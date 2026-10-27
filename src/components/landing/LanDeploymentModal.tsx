import React, { useState } from 'react';
import {
  Wifi,
  Server,
  HardDrive,
  Smartphone,
  CheckCircle,
  ShieldCheck,
  Download,
  RotateCcw,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';

interface LanDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanDeploymentModal: React.FC<LanDeploymentModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'backup'>('architecture');

  const steps = [
    {
      step: '1. Hardware Setup',
      desc: 'Use any desktop computer, laptop, or dedicated mini PC (Intel Core i3+, 8GB RAM recommended) as your School Local Server Node.',
      icon: <Server className="w-5 h-5 text-blue-600" />,
    },
    {
      step: '2. Local Wi-Fi Router Connection',
      desc: 'Connect the school server to an ordinary office Wi-Fi router via Ethernet cable. Internet bundles are NOT required for staff to connect locally.',
      icon: <Wifi className="w-5 h-5 text-emerald-600" />,
    },
    {
      step: '3. Run SchoolSoul OS',
      desc: 'Start SchoolSoul OS on the server (via standard Node.js or Docker container). The system automatically opens port 3000 on the local subnet.',
      icon: <HardDrive className="w-5 h-5 text-indigo-600" />,
    },
    {
      step: '4. Staff Tablet / Phone Access',
      desc: 'Teachers and administrators connect their phones, tablets, or laptops to the school Wi-Fi and browse to http://192.168.1.100:3000 to work instantly.',
      icon: <Smartphone className="w-5 h-5 text-amber-600" />,
    },
    {
      step: '5. Automatic Backup & Optional Cloud Sync',
      desc: 'When an internet hotspot or modem is temporarily plugged in, the system automatically synchronizes pending changes with the primary cloud backup.',
      icon: <CheckCircle className="w-5 h-5 text-purple-600" />,
    },
  ];

  const backupRecoveryGuide = [
    {
      title: 'Local Flash Drive Encrypted Vault',
      desc: 'Administrators can export an AES-encrypted JSON snapshot of the entire school database directly to any USB drive in under 15 seconds.',
      icon: <Lock className="w-4 h-4 text-emerald-500" />,
    },
    {
      title: 'Zero-Hardware Recovery (Disaster Recovery)',
      desc: 'If the school server fails or suffers a power surge, plug the backup USB into any standard replacement PC, start SchoolSoul, and restore in 60 seconds.',
      icon: <RotateCcw className="w-4 h-4 text-blue-500" />,
    },
    {
      title: 'Universal CSV & PDF Portability',
      desc: 'Export students, fee registers, class gradebooks, and staff records to open CSV and printable PDF formats. Zero data hostage.',
      icon: <FileSpreadsheet className="w-4 h-4 text-purple-500" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="On-Premise School Server & Local LAN Deployment"
      maxWidth="2xl"
      id="lan-deployment-modal"
    >
      <div className="space-y-4 text-slate-900 dark:text-slate-100">
        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            LAN Deployment Architecture
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Backup, Restore &amp; Disaster Recovery
          </button>
        </div>

        {activeTab === 'architecture' ? (
          <>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              SchoolSoul OS is engineered with a genuine offline-first architecture. Schools in remote areas or institutions with intermittent connectivity can run a 100% self-contained local deployment with zero monthly internet bills.
            </p>

            <div className="space-y-2.5">
              {steps.map((st, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {st.icon}
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{st.step}</h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Institutional safety requires robust local disaster recovery procedures that do not depend on internet access:
            </p>

            <div className="space-y-2.5">
              {backupRecoveryGuide.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {item.icon}
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-950 dark:text-blue-200">
            <span className="font-bold block">Need deployment assistance?</span>
            VINEXSAH TECHNOLOGIES provides pre-configured school server hardware, on-site installation, and staff training across East Africa. Contact our technical team for institutional setups.
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
