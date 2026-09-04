import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import { mutateServerDB } from '../db/store';

interface ConnectedPeer {
  ws: WebSocket;
  userId: string;
  userName: string;
  userRole: string;
  avatar?: string;
  roomId: string;
  liveClassId: string;
  schoolId: string;
  isHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isHandRaised: boolean;
  canSpeak: boolean;
  canDraw: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
  lastHeartbeat: number;
}

// In-memory room management
const rooms: Map<string, Map<string, ConnectedPeer>> = new Map();
// Room-specific whiteboard stroke histories for immediate catchup on join
const roomWhiteboards: Map<string, any[]> = new Map();

function verifyRoomToken(token: string): any | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    const secret = process.env.ROOM_TOKEN_SECRET || 'schoolsoul_secure_live_key_2026';
    const { sig, ...dataObj } = parsed;
    const expectedHmac = crypto.createHmac('sha256', secret).update(JSON.stringify(dataObj)).digest('hex');
    if (sig !== expectedHmac && process.env.NODE_ENV === 'production') {
      return null;
    }
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
}

export function setupLiveLearningWebSocket(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws/live' });

  wss.on('connection', (ws: WebSocket) => {
    let currentPeer: ConnectedPeer | null = null;

    ws.on('message', (messageData: string) => {
      try {
        const payload = JSON.parse(messageData.toString());
        const { type, data } = payload;

        switch (type) {
          case 'join-room': {
            const { token, roomId, liveClassId, userId, userName, userRole, avatar } = data;
            const tokenData = token ? verifyRoomToken(token) : null;

            const effectiveUserId = tokenData?.userId || userId || `user-${Date.now()}`;
            const effectiveUserName = tokenData?.userName || userName || 'Participant';
            const effectiveRole = tokenData?.role || userRole || 'Student';
            const effectiveRoomId = tokenData?.roomId || roomId || 'default-room';
            const effectiveLiveClassId = tokenData?.liveClassId || liveClassId || '';
            const effectiveSchoolId = tokenData?.schoolId || 'school-001';
            const isHost = tokenData?.isHost ?? (effectiveRole === 'Teacher' || effectiveRole === 'Super Administrator');

            if (!rooms.has(effectiveRoomId)) {
              rooms.set(effectiveRoomId, new Map());
            }
            if (!roomWhiteboards.has(effectiveRoomId)) {
              roomWhiteboards.set(effectiveRoomId, []);
            }

            const room = rooms.get(effectiveRoomId)!;

            currentPeer = {
              ws,
              userId: effectiveUserId,
              userName: effectiveUserName,
              userRole: effectiveRole,
              avatar,
              roomId: effectiveRoomId,
              liveClassId: effectiveLiveClassId,
              schoolId: effectiveSchoolId,
              isHost,
              isMuted: false,
              isCameraOff: false,
              isHandRaised: false,
              canSpeak: isHost || true,
              canDraw: isHost,
              isScreenSharing: false,
              joinedAt: new Date().toISOString(),
              lastHeartbeat: Date.now(),
            };

            room.set(effectiveUserId, currentPeer);

            // Send room state and whiteboard history to joining peer
            const participantsList = Array.from(room.values()).map((p) => ({
              userId: p.userId,
              userName: p.userName,
              userRole: p.userRole,
              avatar: p.avatar,
              isHost: p.isHost,
              isMuted: p.isMuted,
              isCameraOff: p.isCameraOff,
              isHandRaised: p.isHandRaised,
              canSpeak: p.canSpeak,
              canDraw: p.canDraw,
              isScreenSharing: p.isScreenSharing,
              joinedAt: p.joinedAt,
            }));

            ws.send(
              JSON.stringify({
                type: 'room-joined',
                data: {
                  roomId: effectiveRoomId,
                  selfId: effectiveUserId,
                  isHost,
                  participants: participantsList,
                  whiteboardHistory: roomWhiteboards.get(effectiveRoomId) || [],
                },
              })
            );

            // Notify all other peers in room of new joiner
            broadcastToRoom(
              effectiveRoomId,
              {
                type: 'peer-joined',
                data: {
                  userId: effectiveUserId,
                  userName: effectiveUserName,
                  userRole: effectiveRole,
                  avatar,
                  isHost,
                  isMuted: currentPeer.isMuted,
                  isCameraOff: currentPeer.isCameraOff,
                  isHandRaised: false,
                  canSpeak: currentPeer.canSpeak,
                  canDraw: currentPeer.canDraw,
                  isScreenSharing: false,
                },
              },
              effectiveUserId
            );
            break;
          }

          case 'webrtc-offer': {
            if (!currentPeer) return;
            const { targetUserId, sdp } = data;
            sendToPeer(currentPeer.roomId, targetUserId, {
              type: 'webrtc-offer',
              data: {
                fromUserId: currentPeer.userId,
                sdp,
              },
            });
            break;
          }

          case 'webrtc-answer': {
            if (!currentPeer) return;
            const { targetUserId, sdp } = data;
            sendToPeer(currentPeer.roomId, targetUserId, {
              type: 'webrtc-answer',
              data: {
                fromUserId: currentPeer.userId,
                sdp,
              },
            });
            break;
          }

          case 'webrtc-ice-candidate': {
            if (!currentPeer) return;
            const { targetUserId, candidate } = data;
            sendToPeer(currentPeer.roomId, targetUserId, {
              type: 'webrtc-ice-candidate',
              data: {
                fromUserId: currentPeer.userId,
                candidate,
              },
            });
            break;
          }

          case 'participant-state': {
            if (!currentPeer) return;
            const { isMuted, isCameraOff, isHandRaised, isScreenSharing } = data;
            if (isMuted !== undefined) currentPeer.isMuted = isMuted;
            if (isCameraOff !== undefined) currentPeer.isCameraOff = isCameraOff;
            if (isHandRaised !== undefined) currentPeer.isHandRaised = isHandRaised;
            if (isScreenSharing !== undefined) currentPeer.isScreenSharing = isScreenSharing;

            broadcastToRoom(
              currentPeer.roomId,
              {
                type: 'participant-state-updated',
                data: {
                  userId: currentPeer.userId,
                  isMuted: currentPeer.isMuted,
                  isCameraOff: currentPeer.isCameraOff,
                  isHandRaised: currentPeer.isHandRaised,
                  isScreenSharing: currentPeer.isScreenSharing,
                },
              }
            );
            break;
          }

          case 'whiteboard-stroke': {
            if (!currentPeer) return;
            const stroke = data.stroke;
            const strokes = roomWhiteboards.get(currentPeer.roomId);
            if (strokes) {
              strokes.push(stroke);
              if (strokes.length > 2000) strokes.shift(); // keep reasonable limit
            }
            broadcastToRoom(
              currentPeer.roomId,
              {
                type: 'whiteboard-stroke',
                data: { stroke, authorId: currentPeer.userId },
              },
              currentPeer.userId
            );
            break;
          }

          case 'whiteboard-clear': {
            if (!currentPeer) return;
            roomWhiteboards.set(currentPeer.roomId, []);
            broadcastToRoom(currentPeer.roomId, {
              type: 'whiteboard-clear',
              data: { authorId: currentPeer.userId },
            });
            break;
          }

          case 'whiteboard-undo': {
            if (!currentPeer) return;
            const strokes = roomWhiteboards.get(currentPeer.roomId);
            if (strokes && strokes.length > 0) {
              strokes.pop();
            }
            broadcastToRoom(currentPeer.roomId, {
              type: 'whiteboard-history-sync',
              data: { strokes: strokes || [] },
            });
            break;
          }

          case 'chat-message': {
            if (!currentPeer) return;
            const { content, messageType = 'CHAT' } = data;
            const msg = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              schoolId: currentPeer.schoolId,
              liveClassId: currentPeer.liveClassId,
              senderId: currentPeer.userId,
              senderName: currentPeer.userName,
              senderRole: currentPeer.userRole,
              senderAvatar: currentPeer.avatar,
              content: content || '',
              messageType,
              timestamp: new Date().toISOString(),
            };

            // Save to store
            mutateServerDB((db) => {
              if (!db.liveClassMessages) db.liveClassMessages = [];
              db.liveClassMessages.push(msg);
            });

            broadcastToRoom(currentPeer.roomId, {
              type: 'chat-message',
              data: msg,
            });
            break;
          }

          case 'teacher-action': {
            if (!currentPeer || !currentPeer.isHost) return;
            const { targetUserId, action, value } = data;
            const room = rooms.get(currentPeer.roomId);
            if (!room) return;

            if (targetUserId === 'all') {
              if (action === 'mute-all') {
                for (const p of room.values()) {
                  if (!p.isHost) p.isMuted = true;
                }
                broadcastToRoom(currentPeer.roomId, {
                  type: 'room-mute-all',
                  data: { hostId: currentPeer.userId },
                });
              }
            } else {
              const targetPeer = room.get(targetUserId);
              if (targetPeer) {
                if (action === 'mute') {
                  targetPeer.isMuted = true;
                  sendToPeer(currentPeer.roomId, targetUserId, {
                    type: 'force-mute',
                    data: { hostId: currentPeer.userId },
                  });
                } else if (action === 'allow-draw') {
                  targetPeer.canDraw = Boolean(value);
                  broadcastToRoom(currentPeer.roomId, {
                    type: 'permission-updated',
                    data: { userId: targetUserId, canDraw: targetPeer.canDraw },
                  });
                } else if (action === 'lower-hand') {
                  targetPeer.isHandRaised = false;
                  broadcastToRoom(currentPeer.roomId, {
                    type: 'participant-state-updated',
                    data: { userId: targetUserId, isHandRaised: false },
                  });
                } else if (action === 'kick') {
                  sendToPeer(currentPeer.roomId, targetUserId, {
                    type: 'kicked-from-room',
                    data: { reason: 'Removed by teacher host' },
                  });
                  targetPeer.ws.close();
                  room.delete(targetUserId);
                  broadcastToRoom(currentPeer.roomId, {
                    type: 'peer-left',
                    data: { userId: targetUserId },
                  });
                }
              }
            }
            break;
          }

          case 'poll-launched': {
            if (!currentPeer) return;
            broadcastToRoom(currentPeer.roomId, {
              type: 'poll-launched',
              data: data.poll,
            });
            break;
          }

          case 'heartbeat': {
            if (currentPeer) {
              currentPeer.lastHeartbeat = Date.now();
              ws.send(JSON.stringify({ type: 'heartbeat-ack', timestamp: Date.now() }));
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      if (currentPeer) {
        const { roomId, userId, liveClassId, schoolId } = currentPeer;
        const room = rooms.get(roomId);
        if (room) {
          room.delete(userId);
          if (room.size === 0) {
            rooms.delete(roomId);
          } else {
            broadcastToRoom(roomId, {
              type: 'peer-left',
              data: { userId },
            });
          }
        }

        // Record departure for attendance anti-abuse
        mutateServerDB((d) => {
          if (!d.liveClassAttendance) d.liveClassAttendance = [];
          const att = d.liveClassAttendance.find(
            (a: any) => a.liveClassId === liveClassId && a.studentId === userId && a.schoolId === schoolId
          );
          if (att) {
            att.lastLeftAt = new Date().toISOString();
          }
        });
      }
    });
  });

  function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const room = rooms.get(roomId);
    if (!room) return;
    const msgString = JSON.stringify(message);
    for (const peer of room.values()) {
      if (excludeUserId && peer.userId === excludeUserId) continue;
      if (peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(msgString);
      }
    }
  }

  function sendToPeer(roomId: string, targetUserId: string, message: any) {
    const room = rooms.get(roomId);
    if (!room) return;
    const peer = room.get(targetUserId);
    if (peer && peer.ws.readyState === WebSocket.OPEN) {
      peer.ws.send(JSON.stringify(message));
    }
  }

  return wss;
}
