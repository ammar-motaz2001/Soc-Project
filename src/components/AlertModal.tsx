import { X, Network, HardDrive, Mail, Shield, Activity, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { Alert } from '../context/SOCContext';
import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface AlertModalProps {
  alert: Alert | null;
  onClose: () => void;
  onResolve: (
    id: string,
    resolution: 'True Positive' | 'False Positive',
  ) => void | Promise<void>;
  /** When true, hide resolve actions (e.g. API-backed dashboard alerts). */
  readOnly?: boolean;
  /** Disables triage actions while an async resolve is in flight. */
  isBusy?: boolean;
}

export default function AlertModal({
  alert,
  onClose,
  onResolve,
  readOnly = false,
  isBusy = false,
}: AlertModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'endpoint' | 'email' | 'threat'>('overview');

  if (!alert) return null;

  const handleResolve = (resolution: 'True Positive' | 'False Positive') => {
    void (async () => {
      try {
        const out = onResolve(alert.id, resolution);
        if (out != null && typeof (out as Promise<unknown>).then === 'function') {
          await out;
        }
        onClose();
      } catch {
        // Parent shows error toast; keep modal open.
      }
    })();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-[#FF6B6B] text-[#3a0b0b]';
      case 'High':
        return 'bg-[#FFD966] text-[#1f1a00]';
      case 'Medium':
        return 'bg-[#60A5FA] text-[#07213a]';
      case 'Low':
        return 'bg-[#A7F3D0] text-[#0b3c2a]';
      default:
        return 'bg-white/[0.02] text-[#98A0AC]';
    }
  };

  const getReputationColor = (reputation?: string) => {
    switch (reputation) {
      case 'Malicious':
        return 'bg-[#FF6B6B]/20 text-[#FF6B6B] border-[#FF6B6B]/30';
      case 'Suspicious':
        return 'bg-[#FFD966]/20 text-[#FFD966] border-[#FFD966]/30';
      case 'Unknown':
        return 'bg-[#98A0AC]/20 text-[#98A0AC] border-[#98A0AC]/30';
      case 'Trusted':
        return 'bg-[#64D16C]/20 text-[#64D16C] border-[#64D16C]/30';
      default:
        return 'bg-white/[0.02] text-[#98A0AC] border-white/[0.04]';
    }
  };

  const InfoItem = ({ label, value, mono = false }: { label: string; value?: string | number; mono?: boolean }) => {
    if (!value) return null;
    return (
      <div className="mb-3">
        <div className="text-[#98A0AC] text-xs mb-1">{label}</div>
        <div className={`text-[#E6EEF6] text-sm ${mono ? 'font-mono bg-white/[0.02] px-2 py-1 rounded' : ''}`}>
          {value}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Activity },
    { id: 'network' as const, label: 'Network', icon: Network, show: !!(alert.sourceIP || alert.destinationIP) },
    { id: 'endpoint' as const, label: 'Endpoint', icon: HardDrive, show: !!(alert.hostname || alert.processName) },
    { id: 'email' as const, label: 'Email', icon: Mail, show: !!(alert.senderEmail || alert.recipientEmail) },
    { id: 'threat' as const, label: 'Threat Intel', icon: Shield, show: !!(alert.threatScore || alert.iocMatches) },
  ].filter(tab => tab.show !== false);

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-2 md:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-[#19232C] rounded-xl p-3 md:p-6 w-full max-w-[1100px] max-h-[95vh] overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-3 md:mb-4 pb-3 md:pb-4 border-b border-white/[0.03]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                <h3 className="m-0 text-[#E6EEF6] text-base md:text-lg">Alert #{alert.id}</h3>
                <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
                {alert.reputation && (
                  <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs border ${getReputationColor(alert.reputation)}`}>
                    {alert.reputation}
                  </span>
                )}
              </div>
              <div className="text-[#E6EEF6] text-xs md:text-sm mb-1">{alert.rule}</div>
              <div className="text-[#98A0AC] text-xs line-clamp-2 md:line-clamp-none">{alert.notes}</div>
            </div>
            <button
              onClick={onClose}
              className="ml-2 md:ml-4 p-1.5 md:p-2 rounded-lg hover:bg-white/[0.02] text-[#98A0AC] transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 md:gap-2 mb-3 md:mb-4 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs flex items-center gap-1.5 md:gap-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-[#A7EA3B]/10 text-[#A7EA3B] border border-[#A7EA3B]/30'
                      : 'bg-white/[0.02] text-[#98A0AC] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-[#0F1722] rounded-lg p-3 md:p-4 mb-3 md:mb-4 min-h-[250px] md:min-h-[300px]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem label="Alert ID" value={alert.id} />
                <InfoItem label="Type" value={alert.type} />
                <InfoItem label="Date" value={alert.date} />
                <InfoItem label="Status" value={alert.status} />
                {alert.timestamp && <InfoItem label="Timestamp" value={alert.timestamp} />}
                {alert.firstSeen && <InfoItem label="First Seen" value={alert.firstSeen} />}
                {alert.lastSeen && <InfoItem label="Last Seen" value={alert.lastSeen} />}
                {alert.eventCount && <InfoItem label="Event Count" value={alert.eventCount} />}
                {alert.geoLocation && (
                  <div className="mb-3">
                    <div className="text-[#98A0AC] text-xs mb-1 flex items-center gap-1">
                      <MapPin size={12} />
                      Geo Location
                    </div>
                    <div className="text-[#E6EEF6] text-sm">{alert.geoLocation}</div>
                  </div>
                )}
                {alert.threatScore && (
                  <div className="mb-3">
                    <div className="text-[#98A0AC] text-xs mb-1 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Threat Score
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[#E6EEF6] text-sm">{alert.threatScore}/100</div>
                      <div className="flex-1 bg-white/[0.05] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            alert.threatScore >= 80 ? 'bg-[#FF6B6B]' : alert.threatScore >= 60 ? 'bg-[#FFD966]' : 'bg-[#60A5FA]'
                          }`}
                          style={{ width: `${alert.threatScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Network Tab */}
            {activeTab === 'network' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                    <div className="text-[#A7EA3B] text-sm mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#A7EA3B]"></div>
                      Source
                    </div>
                    <InfoItem label="IP Address" value={alert.sourceIP} mono />
                    <InfoItem label="MAC Address" value={alert.sourceMac} mono />
                    <InfoItem label="Port" value={alert.sourcePort} mono />
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                    <div className="text-[#FF6B6B] text-sm mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF6B6B]"></div>
                      Destination
                    </div>
                    <InfoItem label="IP Address" value={alert.destinationIP} mono />
                    <InfoItem label="MAC Address" value={alert.destinationMac} mono />
                    <InfoItem label="Port" value={alert.destinationPort} mono />
                  </div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                  <InfoItem label="Protocol" value={alert.protocol} />
                  {alert.geoLocation && <InfoItem label="Geo Location" value={alert.geoLocation} />}
                </div>
              </div>
            )}

            {/* Endpoint Tab */}
            {activeTab === 'endpoint' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Hostname" value={alert.hostname} mono />
                  <InfoItem label="Username" value={alert.username} />
                  <InfoItem label="Process Name" value={alert.processName} mono />
                  <InfoItem label="Process ID" value={alert.processId} mono />
                  <InfoItem label="Parent Process" value={alert.parentProcess} mono />
                </div>
                {alert.commandLine && (
                  <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                    <div className="text-[#98A0AC] text-xs mb-2">Command Line</div>
                    <div className="text-[#E6EEF6] text-xs font-mono bg-black/20 p-3 rounded overflow-x-auto break-all">
                      {alert.commandLine}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <InfoItem label="File Hash" value={alert.fileHash} mono />
                  <InfoItem label="File Path" value={alert.filePath} mono />
                </div>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                  <div className="text-[#A7EA3B] text-sm mb-3">Email Details</div>
                  <InfoItem label="From" value={alert.senderEmail} mono />
                  <InfoItem label="To" value={alert.recipientEmail} mono />
                  <InfoItem label="Subject" value={alert.emailSubject} />
                </div>
                {alert.attachmentHash && (
                  <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                    <InfoItem label="Attachment Hash" value={alert.attachmentHash} mono />
                  </div>
                )}
              </div>
            )}

            {/* Threat Intel Tab */}
            {activeTab === 'threat' && (
              <div className="space-y-4">
                {alert.threatScore && (
                  <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                    <div className="text-[#A7EA3B] text-sm mb-3">Threat Score</div>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl text-[#E6EEF6]">{alert.threatScore}</div>
                      <div className="text-[#98A0AC] text-sm">/ 100</div>
                      <div className="flex-1 bg-white/[0.05] rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            alert.threatScore >= 80 ? 'bg-[#FF6B6B]' : alert.threatScore >= 60 ? 'bg-[#FFD966]' : 'bg-[#60A5FA]'
                          }`}
                          style={{ width: `${alert.threatScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {alert.iocMatches && alert.iocMatches.length > 0 && (
                  <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                    <div className="text-[#A7EA3B] text-sm mb-3">IOC Matches ({alert.iocMatches.length})</div>
                    <div className="space-y-2">
                      {alert.iocMatches.map((ioc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]"></div>
                          <div className="text-[#E6EEF6]">{ioc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {alert.mitreTechniques && alert.mitreTechniques.length > 0 && (
                  <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                    <div className="text-[#A7EA3B] text-sm mb-3">MITRE ATT&CK Techniques</div>
                    <div className="space-y-2">
                      {alert.mitreTechniques.map((technique, idx) => (
                        <div key={idx} className="bg-[#A7EA3B]/5 border border-[#A7EA3B]/20 rounded px-3 py-2">
                          <div className="text-[#E6EEF6] text-sm font-mono">{technique}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-2 pt-4 border-t border-white/[0.03]">
            {!readOnly && (
              <>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleResolve('True Positive')}
                  className="px-4 py-2 rounded-lg bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30 text-sm hover:bg-[#FF6B6B]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close as True Positive
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleResolve('False Positive')}
                  className="px-4 py-2 rounded-lg bg-[#64D16C]/20 text-[#64D16C] border border-[#64D16C]/30 text-sm hover:bg-[#64D16C]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close as False Positive
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/[0.04] bg-transparent text-[#98A0AC] hover:bg-white/[0.02] transition-colors text-sm md:ml-auto"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}