import type { LiveParticipant, WhiteboardStroke, LiveClassMessage, LivePoll } from '../types';

export type WebRTCEventCallback = (event: string, data: any) => void;

export class LiveClassWebRTCManager {
  private ws: WebSocket | null = null;
  private roomId: string = '';
  private liveClassId: string = '';
  private token: string = '';
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micDataArray: Uint8Array | null = null;
  private micCheckInterval: any = null;
  private heartbeatInterval: any = null;
  private eventListeners: Map<string, Set<WebRTCEventCallback>> = new Map();

  public isMuted: boolean = false;
  public isCameraOff: boolean = false;
  public isScreenSharing: boolean = false;
  public isHandRaised: boolean = false;
  public connectionState: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' = 'DISCONNECTED';

  // Event Subscription
  on(event: string, callback: WebRTCEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: WebRTCEventCallback): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((cb) => cb(event, data));
    }
  }

  // 1. Device Diagnostics & Pre-Flight Checks
  async checkCameraAvailability(): Promise<{ ready: boolean; stream?: MediaStream; error?: string }> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return { ready: false, error: 'Camera API unsupported in this environment' };
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      return { ready: true, stream };
    } catch (err: any) {
      return { ready: false, error: err.name || 'Camera permission denied or camera in use' };
    }
  }

  async checkMicrophoneAvailability(onVolumeChange?: (vol: number) => void): Promise<{ ready: boolean; stream?: MediaStream; error?: string }> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        return { ready: false, error: 'Microphone API unsupported' };
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // AudioContext real-time volume detection
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.micAnalyser = this.audioContext.createAnalyser();
        this.micAnalyser.fftSize = 256;
        source.connect(this.micAnalyser);

        const bufferLength = this.micAnalyser.frequencyBinCount;
        this.micDataArray = new Uint8Array(bufferLength);

        if (onVolumeChange) {
          if (this.micCheckInterval) clearInterval(this.micCheckInterval);
          this.micCheckInterval = setInterval(() => {
            if (this.micAnalyser && this.micDataArray) {
              this.micAnalyser.getByteFrequencyData(this.micDataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += this.micDataArray[i];
              }
              const average = sum / bufferLength;
              const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));
              onVolumeChange(normalizedVolume);
            }
          }, 100);
        }
      }

      return { ready: true, stream };
    } catch (err: any) {
      return { ready: false, error: err.name || 'Microphone access denied' };
    }
  }

  async playSpeakerTestTone(): Promise<boolean> {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 tone
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.4); // G5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);
      return true;
    } catch (e) {
      console.warn('Audio tone error:', e);
      return false;
    }
  }

  // 2. Initialize Local Real Media Stream
  async acquireMediaStream(options: { video?: boolean; audio?: boolean; quality?: string } = { video: true, audio: true }): Promise<MediaStream | null> {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach((t) => t.stop());
      }

      let videoConstraints: any = false;
      if (options.video !== false) {
        const height = options.quality === 'HD' ? 1080 : options.quality === 'HIGH' ? 720 : 480;
        videoConstraints = {
          width: { ideal: Math.round((height * 16) / 9) },
          height: { ideal: height },
          frameRate: { ideal: 30 },
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: options.audio !== false,
      });

      this.localStream = stream;
      return stream;
    } catch (err) {
      console.warn('Could not acquire full media stream, falling back to audio only or mock:', err);
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.localStream = audioOnly;
        this.isCameraOff = true;
        return audioOnly;
      } catch (audioErr) {
        console.warn('Audio acquisition failed:', audioErr);
        return null;
      }
    }
  }

  // 3. Screen Sharing Capture
  async startScreenShare(): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported by your browser');
      }
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      this.screenStream = stream;
      this.isScreenSharing = true;

      // Handle screen share stopped by user from browser bar
      stream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      this.broadcastParticipantState();
      this.emit('screenshare-started', { stream });
      return stream;
    } catch (err) {
      console.warn('Screen share cancelled or failed:', err);
      return null;
    }
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    this.isScreenSharing = false;
    this.broadcastParticipantState();
    this.emit('screenshare-stopped', {});
  }

  // 4. Mute & Video Toggles
  toggleAudio(forceMute?: boolean): boolean {
    this.isMuted = forceMute !== undefined ? forceMute : !this.isMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = !this.isMuted;
      });
    }
    this.broadcastParticipantState();
    this.emit('audio-toggled', { isMuted: this.isMuted });
    return this.isMuted;
  }

  toggleVideo(forceOff?: boolean): boolean {
    this.isCameraOff = forceOff !== undefined ? forceOff : !this.isCameraOff;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((t) => {
        t.enabled = !this.isCameraOff;
      });
    }
    this.broadcastParticipantState();
    this.emit('video-toggled', { isCameraOff: this.isCameraOff });
    return this.isCameraOff;
  }

  toggleHandRaise(): boolean {
    this.isHandRaised = !this.isHandRaised;
    this.broadcastParticipantState();
    this.emit('hand-toggled', { isHandRaised: this.isHandRaised });
    return this.isHandRaised;
  }

  // 5. Connect to Live Learning WebSocket Room
  connectToRoom(config: {
    wsEndpoint: string;
    roomId: string;
    liveClassId: string;
    token: string;
    userId: string;
    userName: string;
    userRole: string;
    avatar?: string;
  }): void {
    this.roomId = config.roomId;
    this.liveClassId = config.liveClassId;
    this.token = config.token;
    this.connectionState = 'CONNECTING';

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const targetWsUrl = config.wsEndpoint || `${protocol}//${host}/ws/live`;

    try {
      this.ws = new WebSocket(targetWsUrl);

      this.ws.onopen = () => {
        this.connectionState = 'CONNECTED';
        this.emit('connected', {});

        // Send room join handshake
        this.sendWsMessage('join-room', {
          token: this.token,
          roomId: this.roomId,
          liveClassId: this.liveClassId,
          userId: config.userId,
          userName: config.userName,
          userRole: config.userRole,
          avatar: config.avatar,
        });

        // Setup periodic heartbeat keepalive
        this.heartbeatInterval = setInterval(() => {
          this.sendWsMessage('heartbeat', { timestamp: Date.now() });
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleIncomingWsMessage(message);
        } catch (err) {
          console.error('Error parsing incoming WS message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket error in live room:', err);
        this.emit('connection-error', err);
      };

      this.ws.onclose = () => {
        this.connectionState = 'DISCONNECTED';
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.emit('disconnected', {});
      };
    } catch (err) {
      this.connectionState = 'DISCONNECTED';
      this.emit('connection-error', err);
    }
  }

  private sendWsMessage(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  private broadcastParticipantState(): void {
    this.sendWsMessage('participant-state', {
      isMuted: this.isMuted,
      isCameraOff: this.isCameraOff,
      isHandRaised: this.isHandRaised,
      isScreenSharing: this.isScreenSharing,
    });
  }

  private handleIncomingWsMessage(message: { type: string; data: any }): void {
    const { type, data } = message;
    switch (type) {
      case 'room-joined':
        this.emit('room-joined', data);
        break;
      case 'peer-joined':
        this.emit('peer-joined', data);
        break;
      case 'peer-left':
        this.emit('peer-left', data);
        break;
      case 'participant-state-updated':
        this.emit('participant-state-updated', data);
        break;
      case 'whiteboard-stroke':
        this.emit('whiteboard-stroke', data.stroke);
        break;
      case 'whiteboard-clear':
        this.emit('whiteboard-clear', data);
        break;
      case 'whiteboard-history-sync':
        this.emit('whiteboard-history-sync', data.strokes);
        break;
      case 'chat-message':
        this.emit('chat-message', data);
        break;
      case 'force-mute':
        this.toggleAudio(true);
        this.emit('forced-mute', data);
        break;
      case 'room-mute-all':
        this.toggleAudio(true);
        this.emit('room-muted-by-host', data);
        break;
      case 'permission-updated':
        this.emit('permission-updated', data);
        break;
      case 'kicked-from-room':
        this.disconnect();
        this.emit('kicked', data);
        break;
      case 'poll-launched':
        this.emit('poll-launched', data);
        break;
      default:
        this.emit(type, data);
        break;
    }
  }

  // 6. Interactive Classroom Broadcasting APIs
  sendChatMessage(content: string, messageType: 'CHAT' | 'ANNOUNCEMENT' = 'CHAT'): void {
    this.sendWsMessage('chat-message', { content, messageType });
  }

  sendWhiteboardStroke(stroke: WhiteboardStroke): void {
    this.sendWsMessage('whiteboard-stroke', { stroke });
  }

  clearWhiteboard(): void {
    this.sendWsMessage('whiteboard-clear', {});
  }

  undoWhiteboardStroke(): void {
    this.sendWsMessage('whiteboard-undo', {});
  }

  broadcastPollLaunched(poll: LivePoll): void {
    this.sendWsMessage('poll-launched', { poll });
  }

  // Teacher Moderation Actions
  muteParticipant(targetUserId: string): void {
    this.sendWsMessage('teacher-action', { targetUserId, action: 'mute' });
  }

  muteAllParticipants(): void {
    this.sendWsMessage('teacher-action', { targetUserId: 'all', action: 'mute-all' });
  }

  setParticipantDrawPermission(targetUserId: string, allowDraw: boolean): void {
    this.sendWsMessage('teacher-action', { targetUserId, action: 'allow-draw', value: allowDraw });
  }

  lowerStudentHand(targetUserId: string): void {
    this.sendWsMessage('teacher-action', { targetUserId, action: 'lower-hand' });
  }

  kickParticipant(targetUserId: string): void {
    this.sendWsMessage('teacher-action', { targetUserId, action: 'kick' });
  }

  // Cleanup & Teardown
  disconnect(): void {
    if (this.micCheckInterval) clearInterval(this.micCheckInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionState = 'DISCONNECTED';
    this.eventListeners.clear();
  }
}
