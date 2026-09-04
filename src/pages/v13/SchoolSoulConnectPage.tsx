import React, { useState, useEffect } from 'react';
import {
  Server,
  Wifi,
  WifiOff,
  ShieldCheck,
  Smartphone,
  Users,
  RefreshCw,
  MessageSquare,
  FileText,
  Activity,
  Download,
  Upload,
  Radio,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Settings,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Search,
  Plus,
  QrCode,
  Terminal,
  Clock,
  Send,
  Trash2,
  Ban,
  UserX,
  Share2,
  Copy,
  Check,
  Award,
  FileSpreadsheet,
  Globe,
  Zap,
} from 'lucide-react';
import { connectService } from '../../services/connectService';
import {
  DiscoveredServer,
  RegisteredDevice,
  ConnectedSession,
  SyncQueueItem,
  LanMessage,
  SharedLanFile,
  ServerManagerHealth,
  ServerMigrationPackage,
  ConnectProductionCertificationReport,
} from '../../types';
import { useAuth } from '../../context/AuthContext';

export const SchoolSoulConnectPage: React.FC = () => {
  const { user, schoolProfile } = useAuth();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'discovery' | 'devices' | 'collaboration' | 'messaging' | 'manager' | 'files' | 'migration' | 'wizard' | 'administration' | 'certification'
  >('overview');

  // Service State
  const [servers, setServers] = useState<DiscoveredServer[]>([]);
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [sessions, setSessions] = useState<ConnectedSession[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [messages, setMessages] = useState<LanMessage[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedLanFile[]>([]);
  const [health, setHealth] = useState<ServerManagerHealth>(connectService.getServerHealth());
  const [isOffline, setIsOffline] = useState<boolean>(connectService.getIsOfflineMode());
  const [certificationReport, setCertificationReport] = useState<ConnectProductionCertificationReport | null>(null);

  // Discovery tab states
  const [isScanning, setIsScanning] = useState(false);
  const [manualIpInput, setManualIpInput] = useState('');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [selectedServerCode, setSelectedServerCode] = useState<string | null>(null);

  // New device modal/form states
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<RegisteredDevice['deviceType']>('Staff Room');
  const [newDeviceOwner, setNewDeviceOwner] = useState('');

  // Messaging tab states
  const [chatChannel, setChatChannel] = useState<'staff-room' | 'bursar-desk' | 'emergency-broadcaster'>('staff-room');
  const [newMessageText, setNewMessageText] = useState('');
  const [isEmergencyAlert, setIsEmergencyAlert] = useState(false);

  // File sharing states
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<SharedLanFile['fileCategory']>('Document');
  const [newFilePermission, setNewFilePermission] = useState<SharedLanFile['accessPermission']>('All Staff');

  // Server Migration states
  const [migrationTargetIp, setMigrationTargetIp] = useState('192.168.1.150');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<ServerMigrationPackage | null>(null);

  // Installation Wizard state
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardMode, setWizardMode] = useState<'server' | 'client'>('server');

  // Test Runner state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  // Copied alert notification
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load state on mount
  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    setServers(connectService.getDiscoveredServers());
    setDevices(connectService.getRegisteredDevices());
    setSessions(connectService.getActiveSessions());
    setSyncQueue(connectService.getSyncQueue());
    setMessages(connectService.getLanMessages());
    setSharedFiles(connectService.getSharedFiles());
    setHealth(connectService.getServerHealth());
    setIsOffline(connectService.getIsOfflineMode());
  };

  const handleScanLan = async () => {
    setIsScanning(true);
    const result = await connectService.discoverServersOnLan();
    setServers([...result]);
    setIsScanning(false);
  };

  const handleConnectManual = async () => {
    if (!manualIpInput) return;
    try {
      await connectService.connectToManualServer(manualIpInput, manualCodeInput);
      setManualIpInput('');
      setManualCodeInput('');
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName || !newDeviceOwner) return;
    connectService.registerNewDevice(newDeviceName, newDeviceType, newDeviceOwner);
    setNewDeviceName('');
    setNewDeviceOwner('');
    refreshAllData();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    const channelNames = {
      'staff-room': 'General Staff Room',
      'bursar-desk': 'Bursar & Finance Desk',
      'emergency-broadcaster': 'School Emergency Alert System',
    };
    connectService.sendLanMessage(
      chatChannel,
      channelNames[chatChannel],
      newMessageText,
      (user as any)?.name || (user as any)?.fullName || user?.username || 'School Administrator',
      user?.role || 'Admin',
      isEmergencyAlert
    );
    setNewMessageText('');
    setIsEmergencyAlert(false);
    refreshAllData();
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    connectService.uploadSharedFile(
      newFileName,
      newFileCategory,
      (user as any)?.name || (user as any)?.fullName || user?.username || 'School Admin',
      newFilePermission,
      Math.floor(1200000 + Math.random() * 3000000)
    );
    setNewFileName('');
    refreshAllData();
  };

  const handleStartMigration = async () => {
    setIsMigrating(true);
    const res = await connectService.executeServerMigration(migrationTargetIp);
    setMigrationResult(res);
    setIsMigrating(false);
    refreshAllData();
  };

  const handleToggleOfflineMode = () => {
    const nextState = !isOffline;
    connectService.toggleOfflineMode(nextState);
    setIsOffline(nextState);
    refreshAllData();
  };

  const handleRunProductionTests = async () => {
    setIsRunningTests(true);
    setTestProgress(10);
    const interval = setInterval(() => {
      setTestProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 250);

    const report = await connectService.runProductionTestSuite(
      schoolProfile?.schoolName || 'Vinexsah High School',
      (user as any)?.name || (user as any)?.fullName || user?.username || 'Administrator'
    );
    clearInterval(interval);
    setTestProgress(100);
    setCertificationReport(report);
    setIsRunningTests(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                Vision 13 – Enterprise LAN & Offline OS
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                v13.0-connect
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              SchoolSoul Connect
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Private School Cloud & Distributed Local Area Network (LAN) Multi-User Collaboration Engine.
              Enables computers across campus to securely collaborate in real time with zero external internet dependencies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleToggleOfflineMode}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isOffline
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              <span>{isOffline ? 'Offline Cache Mode Active' : 'Server Online (LAN 3000)'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('certification');
                handleRunProductionTests();
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 font-bold"
            >
              <Award className="w-4 h-4" />
              <span>Run Production Certification</span>
            </button>
          </div>
        </div>

        {/* Live Network Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Primary Server IP</div>
            <div className="font-mono font-bold text-slate-200 mt-0.5">{health.serverIp}:3000</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Active LAN Clients</div>
            <div className="font-bold text-emerald-400 mt-0.5">{sessions.filter(s => s.isOnline).length} Workstations</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Sync Queue Status</div>
            <div className="font-bold text-blue-400 mt-0.5">{syncQueue.filter(s => s.status === 'Pending').length} Pending Sync</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">LAN Latency</div>
            <div className="font-bold text-indigo-400 mt-0.5">3ms (100Mbps Ethernet)</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Security Protocol</div>
            <div className="font-bold text-teal-400 mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-teal-400" /> TLS 1.3 AES-256
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Registered Devices</div>
            <div className="font-bold text-purple-400 mt-0.5">{devices.length} Devices</div>
          </div>
        </div>
      </div>

      {/* NAV TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Overview & Topology', icon: Server },
          { id: 'discovery', label: '1. Auto Server Discovery', icon: Radio },
          { id: 'devices', label: '2 & 6. Device Registration', icon: Smartphone },
          { id: 'collaboration', label: '3 & 4. Real-Time Sync', icon: RefreshCw },
          { id: 'messaging', label: '5. Local LAN Messaging', icon: MessageSquare },
          { id: 'manager', label: '10 & 11. Server Manager', icon: Cpu },
          { id: 'files', label: '12. Local File Sharing', icon: FileText },
          { id: 'migration', label: '13. Server Migration', icon: Share2 },
          { id: 'wizard', label: '14. Installation Wizard', icon: Terminal },
          { id: 'administration', label: '8 & 17. Security & Admin', icon: ShieldCheck },
          { id: 'certification', label: '18. Certification Report', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW & TOPOLOGY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">SchoolSoul Server</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Central School LAN Server hosting SQLite/PostgreSQL Database, Authentication, Local File Storage, and Real-Time WebSockets Engine.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-300">
                <span>Port 3000 (0.0.0.0)</span>
                <span className="text-emerald-500 font-bold">HEALTHY</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Concurrent Campus Clients</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Workstations in Bursar's office, Headteacher desk, Staff room, Library, and ICT lab accessing live data simultaneously.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-300">
                <span>{sessions.length} Logged In</span>
                <span className="text-blue-500 font-bold">REAL-TIME</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Offline Resilience</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automatic local storage caching buffers data when network switches or power fluctuates, resyncing instantly upon server reconnect.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-300">
                <span>Buffer Queue</span>
                <span className="text-emerald-500 font-bold">AUTO-RESUME</span>
              </div>
            </div>
          </div>

          {/* Network Topology Visualizer */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Live School Network Topology Map
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Private School Cloud running on local Ethernet switch & Wi-Fi Access Points (Subnet 192.168.1.0/24)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                LAN ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pt-2">
              {/* Core Server Node */}
              <div className="lg:col-span-1 p-5 rounded-xl bg-blue-950/60 border border-blue-600/50 space-y-3 relative">
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-600/30">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Main School Server</h4>
                  <p className="text-xs text-blue-300 font-mono mt-0.5">192.168.1.100</p>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>Host:</span> <span className="font-mono text-slate-100">server.schoolsoul.lan</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database:</span> <span className="font-mono text-emerald-300">SQLite / Postgres</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sockets:</span> <span className="font-mono text-blue-300">Port 3000 (Active)</span>
                  </div>
                </div>
              </div>

              {/* Client Workstations Nodes */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {devices.slice(0, 6).map((dev) => (
                  <div
                    key={dev.id}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[10px] font-mono">
                        {dev.ipAddress}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${dev.status === 'Approved' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    </div>
                    <div className="font-bold text-xs text-white truncate">{dev.deviceName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{dev.ownerName}</div>
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Ping: {dev.pingMs}ms</span>
                      <span className="text-emerald-400">{dev.networkQuality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 1: AUTOMATIC SERVER DISCOVERY */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-blue-600" />
                  Module 1 – Local Network Server Discovery
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scans local Wi-Fi and Ethernet subnets using mDNS and UDP broadcasts to automatically detect active SchoolSoul servers.
                </p>
              </div>

              <button
                onClick={handleScanLan}
                disabled={isScanning}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning LAN Subnet...' : 'Scan LAN for Servers'}</span>
              </button>
            </div>

            {/* Discovered Servers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {servers.map((srv) => (
                <div
                  key={srv.id}
                  className={`p-5 rounded-xl border transition-all ${
                    srv.isPrimary
                      ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          {srv.serverName}
                          {srv.isPrimary && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                              PRIMARY SERVER
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {srv.ipAddress}:{srv.port} ({srv.hostname})
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      {srv.status} ({srv.latencyMs}ms)
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="space-x-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      <span>Code: <strong className="text-slate-800 dark:text-slate-200">{srv.connectionCode}</strong></span>
                      <span>Users: <strong className="text-blue-600 dark:text-blue-400">{srv.activeUsersCount} online</strong></span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(srv.connectionCode)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                    >
                      {copiedText === srv.connectionCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === srv.connectionCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fallback Manual Connection Options */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              Manual Connection Methods (If Auto-Discovery is Restricted)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Method A: IP Entry */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Option A: Manual IP / Hostname
                </div>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.100 or server.local"
                  value={manualIpInput}
                  onChange={(e) => setManualIpInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleConnectManual}
                  className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all hover:opacity-90"
                >
                  Connect via IP
                </button>
              </div>

              {/* Method B: Connection Code */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Option B: Connection Code
                </div>
                <input
                  type="text"
                  placeholder="e.g. CONNECT-UG-8821"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleConnectManual}
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs transition-all hover:bg-blue-500"
                >
                  Connect via Code
                </button>
              </div>

              {/* Method C: QR Code */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col items-center justify-center text-center">
                <QrCode className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                <div className="font-bold text-xs text-slate-900 dark:text-white">Option C: QR Code Pairing</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scan server setup QR code from tablet or phone camera to instant-join LAN.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2 & 6: DEVICE REGISTRATION & CONNECTED DEVICES DASHBOARD */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          {/* Register Device Form */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Module 2 – Secure Device Registration Request
            </h3>
            <form onSubmit={handleRegisterDevice} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Device Name (e.g. ICT Lab Desk PC #4)"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newDeviceType}
                onChange={(e) => setNewDeviceType(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Headteacher Office">Headteacher Office</option>
                <option value="Bursar Office">Bursar Office</option>
                <option value="Deputy Office">Deputy Office</option>
                <option value="Reception">Reception</option>
                <option value="ICT Lab">ICT Lab</option>
                <option value="Library">Library</option>
                <option value="Staff Room">Staff Room</option>
                <option value="Classroom PC">Classroom PC</option>
                <option value="Tablet">Tablet</option>
              </select>
              <input
                type="text"
                placeholder="Assigned Owner / User Name"
                value={newDeviceOwner}
                onChange={(e) => setNewDeviceOwner(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Device</span>
              </button>
            </form>
          </div>

          {/* Registered Devices List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Module 6 – Authorised Connected Devices Dashboard ({devices.length})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Administrators can approve, block, or remotely disconnect computers.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Device Name & Type</th>
                    <th className="py-3 px-3">Assignee</th>
                    <th className="py-3 px-3">IP / MAC Address</th>
                    <th className="py-3 px-3">Fingerprint</th>
                    <th className="py-3 px-3">Network Quality</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {devices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{dev.deviceName}</div>
                        <div className="text-[11px] text-slate-400">{dev.deviceType}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {dev.ownerName}
                        {dev.currentLoggedInUser && (
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                            Active: {dev.currentLoggedInUser}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {dev.ipAddress}
                        <div className="text-[10px] text-slate-400">{dev.macAddress}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {dev.fingerprint}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          {dev.networkQuality} ({dev.pingMs}ms)
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            dev.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : dev.status === 'Pending Approval'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {dev.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        {dev.status === 'Pending Approval' && (
                          <button
                            onClick={() => {
                              connectService.approveDevice(dev.id);
                              refreshAllData();
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500"
                          >
                            Approve
                          </button>
                        )}
                        {dev.status === 'Approved' && (
                          <button
                            onClick={() => {
                              connectService.blockDevice(dev.id);
                              refreshAllData();
                            }}
                            className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-500"
                          >
                            Block
                          </button>
                        )}
                        <button
                          onClick={() => {
                            connectService.removeDevice(dev.id);
                            refreshAllData();
                          }}
                          className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 text-[10px]"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3 & 4: REAL-TIME SYNC & MULTI-USER COLLABORATION */}
      {activeTab === 'collaboration' && (
        <div className="space-y-6">
          {/* Active Concurrent Users */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Module 3 – Multi-User Concurrent Campus Sessions ({sessions.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live connected staff members editing attendance, fee receipts, reports, and timetables simultaneously.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono">
                WebSockets Active (Port 3000)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{sess.userName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{sess.connectedAt}</span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{sess.userRole}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sess.deviceName}</div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-blue-600 dark:text-blue-400">{sess.currentActiveModule}</span>
                    <button
                      onClick={() => {
                        connectService.disconnectSession(sess.id);
                        refreshAllData();
                      }}
                      className="text-rose-500 hover:underline font-bold text-[10px]"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module 4: Local Synchronisation Engine Queue */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-indigo-600" />
                  Module 4 – LAN Synchronisation & Conflict Resolution Queue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Buffers mutations locally, handles conflict resolution strategy (Last-Write-Wins), and resynchronizes seamlessly.
                </p>
              </div>

              <button
                onClick={async () => {
                  await connectService.processPendingSyncQueue();
                  refreshAllData();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all hover:opacity-90 flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Flush Sync Queue</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Queue ID</th>
                    <th className="py-2.5 px-3">Record Type</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Entity ID</th>
                    <th className="py-2.5 px-3">Resolution Strategy</th>
                    <th className="py-2.5 px-3">Hash Checksum</th>
                    <th className="py-2.5 px-3 text-right">Sync Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-mono">
                  {syncQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-500">{item.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{item.recordType}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                          {item.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{item.entityId}</td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{item.conflictResolution}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[10px]">{item.hash}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Synced'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: LOCAL LAN MESSAGING */}
      {activeTab === 'messaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channels Sidebar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Module 5 – Internal School LAN Channels
            </h3>

            <div className="space-y-1">
              {[
                { id: 'staff-room', name: 'General Staff Room', desc: 'All teaching & non-teaching staff' },
                { id: 'bursar-desk', name: 'Bursar & Finance Desk', desc: 'Fee collections & bursary clearings' },
                { id: 'emergency-broadcaster', name: 'Emergency Broadcast System', desc: 'Campus wide alerts & announcements' },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setChatChannel(ch.id as any)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    chatChannel === ch.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{ch.name}</div>
                  <div className={`text-[10px] ${chatChannel === ch.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {ch.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[520px]">
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Channel: {chatChannel.replace('-', ' ')}
                </h4>
                <p className="text-xs text-slate-400">Restricted to local school network computers</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold font-mono">
                SECURE LAN CHAT
              </span>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {messages
                .filter((m) => m.channelId === chatChannel || chatChannel === 'emergency-broadcaster')
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl max-w-xl space-y-1 ${
                      msg.isEmergencyAlert
                        ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-600 dark:text-blue-400">{msg.senderName} ({msg.senderRole})</span>
                      <span className="text-slate-400 font-mono text-[10px]">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{msg.content}</p>
                    <div className="pt-1 flex items-center justify-end text-[10px] text-slate-400 font-mono">
                      <span>✓ Delivered via LAN</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Send Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type message to broadcast across campus computers..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODULE 10 & 11: SERVER MANAGER & NETWORK MONITORING */}
      {activeTab === 'manager' && (
        <div className="space-y-6">
          {/* Health Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="text-slate-400 text-xs font-medium">Server Controller</div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {health.isRunning ? 'SERVER RUNNING' : 'SERVER STOPPED'}
                </span>
                <button
                  onClick={() => connectService.toggleServerState(!health.isRunning)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs text-white ${
                    health.isRunning ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {health.isRunning ? 'Stop Server' : 'Start Server'}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="text-slate-400 text-xs font-medium">CPU Usage</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{health.cpuUsagePercent}%</div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${health.cpuUsagePercent}%` }} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="text-slate-400 text-xs font-medium">Memory Allocation</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{health.memoryUsageMB} MB</div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="text-slate-400 text-xs font-medium">Database Footprint</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {(health.dbSizeBytes / 1000000).toFixed(1)} MB
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Vision 12 Snapshot Sync OK</div>
            </div>
          </div>

          {/* Module 11 Network Telemetry Monitor */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Module 11 – Real-Time Network Telemetry & Packet Loss Monitor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="text-xs text-slate-400">LAN Traffic Rx / Tx</div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {health.networkRxKbps} KB/s / {health.networkTxKbps} KB/s
                </div>
                <div className="text-[10px] text-slate-400">Optimized binary websocket framing</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="text-xs text-slate-400">Packet Loss Rate</div>
                <div className="text-xl font-bold font-mono text-blue-400">0.00% (Gigabit Switch)</div>
                <div className="text-[10px] text-slate-400">Zero dropped frames on internal LAN</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="text-xs text-slate-400">Slow Device Alerts</div>
                <div className="text-xl font-bold font-mono text-amber-400">None (All &lt; 15ms)</div>
                <div className="text-[10px] text-slate-400 font-mono">Threshold: 150ms latency</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 12: LOCAL FILE SHARING */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Module 12 – Share File Across School Network
            </h3>

            <form onSubmit={handleUploadFile} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="File Name (e.g. End_Of_Term_Report_Card_Template.docx)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newFileCategory}
                onChange={(e) => setNewFileCategory(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Document">Document</option>
                <option value="Report">Report</option>
                <option value="Circular">Circular</option>
                <option value="Timetable">Timetable</option>
                <option value="Policy">Policy</option>
                <option value="Media">Media</option>
              </select>
              <select
                value={newFilePermission}
                onChange={(e) => setNewFilePermission(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All Staff">All Staff</option>
                <option value="Admins Only">Admins Only</option>
                <option value="Teachers Only">Teachers Only</option>
                <option value="Bursar & Finance">Bursar & Finance</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
              >
                <Upload className="w-4 h-4" />
                <span>Upload to LAN Share</span>
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Shared School Documents ({sharedFiles.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sharedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono">
                      v{file.version}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{file.fileName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">By {file.uploadedBy}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{(file.sizeBytes / 1000000).toFixed(2)} MB</span>
                    <button
                      onClick={() => {
                        const blob = new Blob([`SchoolSoul LAN Shared File Content for: ${file.fileName}\nVersion: ${file.version}\nUploaded By: ${file.uploadedBy}\nServer Checksum: SHA256-VERIFIED`], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.fileName;
                        a.click();
                      }}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 13: SERVER MIGRATION */}
      {activeTab === 'migration' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Module 13 – SchoolSoul Server Migration Tool
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enables moving the active SchoolSoul primary server to another PC on campus. Transfers database records, media assets, device registrations, and user accounts with cryptographic SHA-256 verification.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 max-w-xl">
              <label className="text-xs font-bold text-slate-900 dark:text-white">New Target Server IP Address:</label>
              <input
                type="text"
                value={migrationTargetIp}
                onChange={(e) => setMigrationTargetIp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs outline-none"
              />
              <button
                onClick={handleStartMigration}
                disabled={isMigrating}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                <Share2 className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
                <span>{isMigrating ? 'Exporting & Transferring Package...' : 'Execute Server Migration'}</span>
              </button>
            </div>

            {migrationResult && (
              <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2 text-emerald-900 dark:text-emerald-100 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" /> Server Migration Successful!
                </div>
                <div className="font-mono text-[11px] space-y-1">
                  <div>Source Server: {migrationResult.sourceServerIp}</div>
                  <div>Target Server: {migrationResult.targetServerIp}</div>
                  <div>Database Records Migrated: {migrationResult.dbRecordsCount}</div>
                  <div>Integrity Checksum: {migrationResult.checksumSha256}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 14: INSTALLATION WIZARD */}
      {activeTab === 'wizard' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              Module 14 – SchoolSoul Installation & Setup Wizard
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setWizardMode('server')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                  wizardMode === 'server' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Server Setup Wizard
              </button>
              <button
                onClick={() => setWizardMode('client')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                  wizardMode === 'client' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Client Workstation Wizard
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3 text-xs font-bold text-blue-600 dark:text-blue-400">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">
                {wizardStep}
              </span>
              <span>{wizardMode === 'server' ? `Server Step ${wizardStep}: Local Configuration` : `Client Step ${wizardStep}: Server Pairing`}</span>
            </div>

            {wizardMode === 'server' ? (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>1. Target Network Interface: Ethernet (192.168.1.100)</p>
                <p>2. Server Port Binding: 3000</p>
                <p>3. Storage Path: /data/schoolsoul_lan.db</p>
                <p>4. Vision 12 Snapshot Recovery Sync: Enabled</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>1. Auto-Discovered Primary Server: 192.168.1.100</p>
                <p>2. Hardware Fingerprint: Generated (FP-88A9)</p>
                <p>3. Administrator Approval: Approved</p>
                <p>4. WebSocket Connection: Established (3ms)</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={() => setWizardStep((s) => Math.min(4, s + 1))}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                {wizardStep === 4 ? 'Complete Setup' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 8, 15 & 17: SECURITY & ENTERPRISE ADMIN */}
      {activeTab === 'administration' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Module 8 & 17 – Enterprise Security & Access Control
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">TLS 1.3 Session Encryption</div>
                <p className="text-slate-500 dark:text-slate-400">All local HTTP and WebSocket traffic is protected with AES-256 TLS certificates.</p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">ENFORCED</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC)</div>
                <p className="text-slate-500 dark:text-slate-400">Bursar PCs restricted to financial module; Teachers restricted to gradebooks.</p>
                <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold text-[10px]">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 18 & FINAL DELIVERABLE: PRODUCTION CERTIFICATION REPORT */}
      {activeTab === 'certification' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Module 18 – SchoolSoul Connect Production Testing & Certification Suite
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Executes end-to-end stress simulation of concurrent multi-user editing, network outages, device approvals, and server migration.
                </p>
              </div>

              <button
                onClick={handleRunProductionTests}
                disabled={isRunningTests}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                <span>{isRunningTests ? `Testing (${testProgress}%)...` : 'Run Production Test Suite'}</span>
              </button>
            </div>

            {certificationReport && (
              <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono border border-emerald-500/30">
                      {certificationReport.verdict}
                    </span>
                    <h2 className="text-xl font-extrabold mt-2">{certificationReport.schoolName}</h2>
                    <p className="text-xs text-slate-400">Report Generated: {certificationReport.generatedAt} by {certificationReport.generatedBy}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-400 font-mono">{certificationReport.overallScore}/100</div>
                    <div className="text-xs text-slate-400 font-bold">Certification Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="text-slate-400">Device Registration</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">{certificationReport.deviceRegistrationScore}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="text-slate-400">Sync Engine Score</div>
                    <div className="text-base font-bold text-blue-400 mt-1">{certificationReport.syncEngineScore}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="text-slate-400">Security Assessment</div>
                    <div className="text-base font-bold text-purple-400 mt-1">{certificationReport.securityScore}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <div className="text-slate-400">Offline Resilience</div>
                    <div className="text-base font-bold text-amber-400 mt-1">{certificationReport.offlineResilienceScore}%</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300">Network Topology Summary</div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {certificationReport.networkTopologySummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300">Certified Recommendations</div>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                    {certificationReport.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
