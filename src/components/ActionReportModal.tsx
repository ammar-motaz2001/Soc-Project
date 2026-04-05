import { X, Download, CheckCircle, XCircle, Clock, AlertTriangle, Terminal, Calendar, Activity, Server } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import ModalPortal from './ModalPortal';

interface ActionReportModalProps {
  action: any | null;
  onClose: () => void;
}

export default function ActionReportModal({ action, onClose }: ActionReportModalProps) {
  if (!action) return null;

  // Wrap everything in try-catch
  try {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Success': return 'bg-[#A7F3D0] text-[#0b3c2a]';
        case 'Failed': return 'bg-[#FF6B6B] text-[#3a0b0b]';
        case 'Pending': return 'bg-[#FFD966] text-[#1f1a00]';
        case 'Partial Success': return 'bg-[#60A5FA] text-[#07213a]';
        default: return 'bg-[#98A0AC] text-[#0F1722]';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'Success': return <CheckCircle className="text-[#A7F3D0]" size={20} />;
        case 'Failed': return <XCircle className="text-[#FF6B6B]" size={20} />;
        case 'Pending': return <Clock className="text-[#FFD966]" size={20} />;
        case 'Partial Success': return <AlertTriangle className="text-[#60A5FA]" size={20} />;
        default: return <Activity className="text-[#98A0AC]" size={20} />;
      }
    };

    const downloadReport = () => {
      try {
        const reportContent = `
=====================================
   AUTOMATED ACTION REPORT
=====================================

ACTION INFORMATION
------------------
Action ID:      ${action.id || 'N/A'}
Action Type:    ${action.actionType || 'N/A'}
Category:       ${action.category || 'N/A'}
Status:         ${action.status || 'N/A'}
Executed At:    ${action.executedAt || 'N/A'}
Duration:       ${action.duration || 'N/A'}

ALERT INFORMATION
-----------------
Alert ID:       ${action.alertId || 'N/A'}
Alert Rule:     ${action.alertRule || 'N/A'}
Severity:       ${action.severity || 'N/A'}

EXECUTION DETAILS
-----------------
${action.executionSteps && action.executionSteps.length > 0 ? action.executionSteps.map((step: any, idx: number) => 
  `${idx + 1}. ${step.step || 'N/A'}
   Status: ${step.status || 'N/A'}
   Duration: ${step.duration || 'N/A'}
   ${step.details ? `Details: ${step.details}` : ''}`
).join('\n\n') : 'No execution steps recorded'}

RESULTS
-------
Affected Resources: ${action.affectedAssets && action.affectedAssets.length > 0 ? action.affectedAssets.join(', ') : 'N/A'}
API Calls Made:     ${action.apiCalls || 0}
Triggered By:       ${action.triggeredBy || 'System'}
Data Processed:     ${action.dataProcessed || 'N/A'}

PERFORMANCE METRICS
-------------------
Execution Time: ${action.duration || 'N/A'}
Success Rate:   ${action.status === 'Success' ? '100%' : action.status === 'Partial Success' ? '50%' : '0%'}

=====================================
Report Generated: ${new Date().toLocaleString()}
=====================================
        `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `action_report_${action.id}_${new Date().toISOString().slice(0, 10)}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Report Downloaded', {
          description: `Action report ${action.id} has been downloaded successfully`
        });
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download report');
      }
    };

    return (
      <ModalPortal>
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4"
          onClick={onClose}
        >
          <div className="bg-[#19232C] rounded-xl p-6 w-full max-w-[900px] my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#A7EA3B]/[0.15] to-[#A7EA3B]/[0.08] rounded-lg p-3">
                  <Terminal className="text-[#A7EA3B]" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl text-[#E6EEF6] mb-1">Automated Action Report</h3>
                  <div className="text-[#A7EA3B]">{action.id || 'N/A'}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg border border-white/[0.08] text-[#98A0AC] hover:bg-white/[0.02] transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Close
              </button>
            </div>

            {/* Status Banner */}
            <div className={`rounded-lg p-4 mb-6 flex items-center justify-between border ${
              action.status === 'Success' 
                ? 'bg-[#A7F3D0]/10 border-[#A7F3D0]/30' 
                : action.status === 'Failed'
                ? 'bg-[#FF6B6B]/10 border-[#FF6B6B]/30'
                : action.status === 'Pending'
                ? 'bg-[#FFD966]/10 border-[#FFD966]/30'
                : 'bg-[#60A5FA]/10 border-[#60A5FA]/30'
            }`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(action.status || 'Unknown')}
                <div>
                  <div className="text-xs text-[#98A0AC] mb-1">Execution Status</div>
                  <div className="text-lg">{action.status || 'Unknown'}</div>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-sm ${getStatusColor(action.status || 'Unknown')}`}>
                {action.status || 'Unknown'}
              </span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0F1722] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-[#A7EA3B]" size={16} />
                  <div className="text-[#98A0AC] text-xs">Duration</div>
                </div>
                <div className="text-sm">{action.duration || 'N/A'}</div>
              </div>
              <div className="bg-[#0F1722] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-[#A7EA3B]" size={16} />
                  <div className="text-[#98A0AC] text-xs">Executed At</div>
                </div>
                <div className="text-sm">{action.executedAt || 'N/A'}</div>
              </div>
              <div className="bg-[#0F1722] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="text-[#A7EA3B]" size={16} />
                  <div className="text-[#98A0AC] text-xs">API Calls</div>
                </div>
                <div className="text-sm">{action.apiCalls || 0}</div>
              </div>
            </div>

            {/* Alert Information */}
            <div className="bg-gradient-to-br from-[#A7EA3B]/[0.05] to-transparent border border-[#A7EA3B]/[0.1] rounded-lg p-5 mb-6">
              <h4 className="text-lg mb-4 text-[#A7EA3B] flex items-center gap-2">
                <AlertTriangle size={18} />
                Triggered by Alert
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#98A0AC] text-xs mb-1">Alert ID</div>
                  <div className="text-sm mb-3">{action.alertId || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[#98A0AC] text-xs mb-1">Severity</div>
                  <div className="text-sm mb-3">{action.severity || 'N/A'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-[#98A0AC] text-xs mb-1">Alert Rule</div>
                  <div className="text-sm mb-3">{action.alertRule || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Action Details */}
            <div className="bg-[#0F1722] rounded-lg p-5 mb-6">
              <h4 className="text-lg mb-3 flex items-center gap-2">
                <Terminal className="text-[#A7EA3B]" size={18} />
                Action Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#98A0AC] text-xs mb-1">Action Type</div>
                  <div className="text-sm">{action.actionType || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[#98A0AC] text-xs mb-1">Category</div>
                  <div className="text-sm">{action.category || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Execution Steps */}
            {action.executionSteps && action.executionSteps.length > 0 && (
              <div className="bg-[#0F1722] rounded-lg p-5 mb-6">
                <h4 className="text-lg mb-4 text-[#A7EA3B] flex items-center gap-2">
                  <Activity size={18} />
                  Execution Steps
                </h4>
                <div className="space-y-3">
                  {action.executionSteps.map((step: any, index: number) => (
                    <div 
                      key={index}
                      className="flex gap-3 p-3 rounded-lg bg-[#19232C] border border-white/[0.03]"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#A7EA3B]/20 flex items-center justify-center text-[#A7EA3B] text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm text-[#E6EEF6]">{step.step || 'N/A'}</div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            step.status === 'completed' 
                              ? 'bg-[#A7F3D0]/20 text-[#A7F3D0]'
                              : step.status === 'pending'
                              ? 'bg-[#FFD966]/20 text-[#FFD966]'
                              : 'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                          }`}>
                            {step.status || 'unknown'}
                          </span>
                        </div>
                        {step.details && (
                          <div className="text-xs text-[#98A0AC] mt-1">{step.details}</div>
                        )}
                        <div className="text-xs text-[#98A0AC] mt-1">
                          <code>{step.duration || 'N/A'}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Affected Resources */}
            {action.affectedAssets && action.affectedAssets.length > 0 && (
              <div className="bg-[#0F1722] rounded-lg p-5 mb-6">
                <h4 className="text-lg mb-3 text-[#A7EA3B]">Affected Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {action.affectedAssets.map((resource: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-[#19232C] border border-white/[0.03] text-sm text-[#E6EEF6]"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            {action.details && (
              <div className="bg-gradient-to-br from-[#60A5FA]/[0.05] to-transparent border border-[#60A5FA]/[0.2] rounded-lg p-5 mb-6">
                <h4 className="text-lg mb-3 text-[#60A5FA]">Action Description</h4>
                <p className="text-sm text-[#E6EEF6] leading-relaxed">
                  {action.details}
                </p>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={downloadReport}
              className="w-full bg-[#A7EA3B] text-[#0F1722] px-4 py-3 rounded-lg hover:bg-[#98d932] transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              <span>Download Full Report</span>
            </button>
          </div>
        </div>
      </ModalPortal>
    );
  } catch (error) {
    console.error('Modal render error:', error);
    return (
      <ModalPortal>
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4"
          onClick={onClose}
        >
          <div className="bg-[#19232C] rounded-xl p-6 w-full max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-[#FF6B6B] text-xl mb-4">⚠️ Error Loading Action</div>
              <p className="text-[#98A0AC] mb-4">The action data could not be loaded properly.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#A7EA3B] text-[#0F1722] rounded-lg hover:bg-[#98d932] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
    );
  }
}