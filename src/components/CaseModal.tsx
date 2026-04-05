import { X, FileText, CheckCircle, AlertTriangle, Clock, User, Calendar, Download, Network, HardDrive, Mail, Shield, Activity, MapPin } from 'lucide-react';
import { Case } from '../context/SOCContext';
import { useState } from 'react';

interface CaseModalProps {
  case: Case | null;
  onClose: () => void;
  onDownload?: (caseItem: Case) => void;
}

export default function CaseModal({ case: caseData, onClose, onDownload }: CaseModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'endpoint' | 'email' | 'threat' | 'investigation'>('overview');

  if (!caseData) return null;

  const alert = caseData.alertDetails;

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
        return 'bg-[#98A0AC] text-[#0F1722]';
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

  const handleDownload = () => {
    if (onDownload && caseData) {
      onDownload(caseData);
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
    { id: 'network' as const, label: 'Network', icon: Network, show: !!(alert?.sourceIP || alert?.destinationIP) },
    { id: 'endpoint' as const, label: 'Endpoint', icon: HardDrive, show: !!(alert?.hostname || alert?.processName) },
    { id: 'email' as const, label: 'Email', icon: Mail, show: !!(alert?.senderEmail || alert?.recipientEmail) },
    { id: 'threat' as const, label: 'Threat Intel', icon: Shield, show: !!(alert?.threatScore || alert?.iocMatches) },
    { id: 'investigation' as const, label: 'Investigation', icon: FileText },
  ].filter(tab => tab.show !== false);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#19232C] rounded-xl p-3 md:p-6 w-full max-w-[1100px] my-4 md:my-8 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 md:mb-4 pb-3 md:pb-4 border-b border-white/[0.05]">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 md:gap-3 mb-2">
              <div className="bg-gradient-to-br from-[#A7EA3B]/[0.15] to-[#A7EA3B]/[0.08] rounded-lg p-2 md:p-3 flex-shrink-0">
                <FileText className="text-[#A7EA3B]" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg md:text-2xl text-[#E6EEF6] mb-1">Case Report</h3>
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                  <span className="text-[#A7EA3B] text-sm md:text-base">{caseData.caseId}</span>
                  <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs ${getSeverityColor(caseData.severity)}`}>
                    {caseData.severity}
                  </span>
                  {alert?.reputation && (
                    <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs border ${getReputationColor(alert.reputation)}`}>
                      {alert.reputation}
                    </span>
                  )}
                  <span
                    className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs border ${
                      caseData.resolution === 'True Positive'
                        ? 'bg-[#FF6B6B]/20 text-[#FF6B6B] border-[#FF6B6B]/30'
                        : 'bg-[#64D16C]/20 text-[#64D16C] border-[#64D16C]/30'
                    }`}
                  >
                    {caseData.resolution}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[#E6EEF6] text-xs md:text-sm line-clamp-2 md:line-clamp-none">{caseData.rule}</div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 md:ml-4 p-1.5 md:p-2 rounded-lg hover:bg-white/[0.02] text-[#98A0AC] transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
          <div className="bg-[#0F1722] rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <User className="text-[#A7EA3B]" size={14} />
              <div className="text-[#98A0AC] text-xs">Analyst</div>
            </div>
            <div className="text-xs md:text-sm truncate">{caseData.analyst}</div>
          </div>
          <div className="bg-[#0F1722] rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <Clock className="text-[#A7EA3B]" size={14} />
              <div className="text-[#98A0AC] text-xs">Time to Resolve</div>
            </div>
            <div className="text-xs md:text-sm">{caseData.timeToResolve}</div>
          </div>
          <div className="bg-[#0F1722] rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <Calendar className="text-[#A7EA3B]" size={14} />
              <div className="text-[#98A0AC] text-xs">Resolution Date</div>
            </div>
            <div className="text-xs md:text-sm">{caseData.dateResolved}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 md:gap-2 mb-3 md:mb-4 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 scrollbar-thin">
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem label="Case ID" value={caseData.caseId} />
                <InfoItem label="Alert ID" value={caseData.alertId} />
                <InfoItem label="Type" value={caseData.type} />
                <InfoItem label="Original Date" value={caseData.originalDate} />
                {alert?.timestamp && <InfoItem label="Timestamp" value={alert.timestamp} />}
                {alert?.firstSeen && <InfoItem label="First Seen" value={alert.firstSeen} />}
                {alert?.lastSeen && <InfoItem label="Last Seen" value={alert.lastSeen} />}
                {alert?.eventCount && <InfoItem label="Event Count" value={alert.eventCount} />}
                {alert?.geoLocation && (
                  <div className="mb-3">
                    <div className="text-[#98A0AC] text-xs mb-1 flex items-center gap-1">
                      <MapPin size={12} />
                      Geo Location
                    </div>
                    <div className="text-[#E6EEF6] text-sm">{alert.geoLocation}</div>
                  </div>
                )}
                {alert?.threatScore && (
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
              {caseData.notes && (
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                  <div className="text-[#98A0AC] text-xs mb-2">Initial Notes</div>
                  <div className="text-[#E6EEF6] text-sm">{caseData.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Network Tab */}
          {activeTab === 'network' && alert && (
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
          {activeTab === 'endpoint' && alert && (
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
          {activeTab === 'email' && alert && (
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
          {activeTab === 'threat' && alert && (
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

          {/* Investigation Tab */}
          {activeTab === 'investigation' && (
            <div className="space-y-4">
              {/* Actions Taken */}
              {caseData.actionsTaken && caseData.actionsTaken.length > 0 && (
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                  <h4 className="text-base mb-3 text-[#A7EA3B]">Actions Taken</h4>
                  <ol className="space-y-2 m-0 pl-5 text-sm text-[#E6EEF6]">
                    {caseData.actionsTaken.map((action, index) => (
                      <li key={index} className="leading-relaxed">
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Findings */}
              {caseData.findings && (
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.03]">
                  <h4 className="text-base mb-3 text-[#A7EA3B]">Investigation Findings</h4>
                  <p className="text-sm text-[#E6EEF6] leading-relaxed">
                    {caseData.findings}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {caseData.recommendation && (
                <div className={`rounded-lg p-4 border ${
                  caseData.resolution === 'True Positive'
                    ? 'bg-[#FF6B6B]/[0.05] border-[#FF6B6B]/[0.2]'
                    : 'bg-[#64D16C]/[0.05] border-[#64D16C]/[0.2]'
                }`}>
                  <h4 className="text-base mb-3 flex items-center gap-2">
                    <FileText size={16} className={caseData.resolution === 'True Positive' ? 'text-[#FF6B6B]' : 'text-[#64D16C]'} />
                    <span className={caseData.resolution === 'True Positive' ? 'text-[#FF6B6B]' : 'text-[#64D16C]'}>
                      Recommendations
                    </span>
                  </h4>
                  <p className="text-sm text-[#E6EEF6] leading-relaxed">
                    {caseData.recommendation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full bg-[#A7EA3B] text-[#0F1722] px-4 py-3 rounded-lg hover:bg-[#98d932] transition-colors flex items-center justify-center gap-2"
        >
          <Download size={18} />
          <span>Download Full Report</span>
        </button>
      </div>
    </div>
  );
}