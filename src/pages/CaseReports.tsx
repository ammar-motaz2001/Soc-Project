import { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import PageHeader from '../components/PageHeader';
import CaseModal from '../components/CaseModal';
import { Case } from '../context/SOCContext';
import { FileText, TrendingUp, CheckCircle, XCircle, Download, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function CaseReports() {
  const { state } = useSOC();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCaseId, setSearchCaseId] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterResolution, setFilterResolution] = useState<string>('all');

  const truePositives = state.cases.filter(c => c.resolution === 'True Positive').length;
  const falsePositives = state.cases.filter(c => c.resolution === 'False Positive').length;

  // Advanced search and filter
  const filteredCases = state.cases.filter(caseItem => {
    // Search by Case ID
    if (searchCaseId && !caseItem.caseId.toLowerCase().includes(searchCaseId.toLowerCase())) {
      return false;
    }

    // Search by text (rule, notes, analyst, type)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesRule = caseItem.rule.toLowerCase().includes(query);
      const matchesNotes = caseItem.notes?.toLowerCase().includes(query);
      const matchesAnalyst = caseItem.analyst.toLowerCase().includes(query);
      const matchesType = caseItem.type.toLowerCase().includes(query);
      const matchesAlertId = caseItem.alertId.toLowerCase().includes(query);
      
      if (!matchesRule && !matchesNotes && !matchesAnalyst && !matchesType && !matchesAlertId) {
        return false;
      }
    }

    // Filter by severity
    if (filterSeverity !== 'all' && caseItem.severity !== filterSeverity) {
      return false;
    }

    // Filter by resolution
    if (filterResolution !== 'all' && caseItem.resolution !== filterResolution) {
      return false;
    }

    return true;
  });

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

  const downloadCaseReport = (caseItem: Case) => {
    const alert = caseItem.alertDetails;
    
    // Create a detailed report with all technical details
    let reportContent = `
=====================================
        SECURITY CASE REPORT
=====================================

CASE INFORMATION
----------------
Case ID:        ${caseItem.caseId}
Alert ID:       ${caseItem.alertId}
Alert Rule:     ${caseItem.rule}
Severity:       ${caseItem.severity}
Type:           ${caseItem.type}
Original Date:  ${caseItem.originalDate}
Resolved Date:  ${caseItem.dateResolved}

ANALYST INFORMATION
-------------------
Analyst:        ${caseItem.analyst}
Time to Resolve: ${caseItem.timeToResolve}

RESOLUTION
----------
Decision:       ${caseItem.resolution}
`;

    // Add Network Information if available
    if (alert && (alert.sourceIP || alert.destinationIP)) {
      reportContent += `
NETWORK INFORMATION
-------------------
Source IP:          ${alert.sourceIP || 'N/A'}
Source MAC:         ${alert.sourceMac || 'N/A'}
Source Port:        ${alert.sourcePort || 'N/A'}
Destination IP:     ${alert.destinationIP || 'N/A'}
Destination MAC:    ${alert.destinationMac || 'N/A'}
Destination Port:   ${alert.destinationPort || 'N/A'}
Protocol:           ${alert.protocol || 'N/A'}
Geo Location:       ${alert.geoLocation || 'N/A'}
`;
    }

    // Add Endpoint Information if available
    if (alert && (alert.hostname || alert.processName)) {
      reportContent += `
ENDPOINT INFORMATION
--------------------
Hostname:           ${alert.hostname || 'N/A'}
Username:           ${alert.username || 'N/A'}
Process Name:       ${alert.processName || 'N/A'}
Process ID:         ${alert.processId || 'N/A'}
Parent Process:     ${alert.parentProcess || 'N/A'}
File Hash:          ${alert.fileHash || 'N/A'}
File Path:          ${alert.filePath || 'N/A'}
`;
      if (alert.commandLine) {
        reportContent += `Command Line:       ${alert.commandLine}\n`;
      }
    }

    // Add Email Information if available
    if (alert && (alert.senderEmail || alert.recipientEmail)) {
      reportContent += `
EMAIL INFORMATION
-----------------
From:               ${alert.senderEmail || 'N/A'}
To:                 ${alert.recipientEmail || 'N/A'}
Subject:            ${alert.emailSubject || 'N/A'}
Attachment Hash:    ${alert.attachmentHash || 'N/A'}
`;
    }

    // Add Threat Intelligence if available
    if (alert && (alert.threatScore || alert.iocMatches || alert.mitreTechniques)) {
      reportContent += `
THREAT INTELLIGENCE
-------------------
Threat Score:       ${alert.threatScore ? `${alert.threatScore}/100` : 'N/A'}
Reputation:         ${alert.reputation || 'N/A'}
`;
      if (alert.iocMatches && alert.iocMatches.length > 0) {
        reportContent += `\nIOC Matches:\n`;
        alert.iocMatches.forEach((ioc, idx) => {
          reportContent += `  ${idx + 1}. ${ioc}\n`;
        });
      }
      if (alert.mitreTechniques && alert.mitreTechniques.length > 0) {
        reportContent += `\nMITRE ATT&CK Techniques:\n`;
        alert.mitreTechniques.forEach((tech, idx) => {
          reportContent += `  ${idx + 1}. ${tech}\n`;
        });
      }
    }

    // Add Timeline Information if available
    if (alert && (alert.timestamp || alert.firstSeen || alert.lastSeen)) {
      reportContent += `
TIMELINE
--------
Timestamp:          ${alert.timestamp || 'N/A'}
First Seen:         ${alert.firstSeen || 'N/A'}
Last Seen:          ${alert.lastSeen || 'N/A'}
Event Count:        ${alert.eventCount || 'N/A'}
`;
    }

    reportContent += `
${caseItem.notes ? `INITIAL NOTES
--------------
${caseItem.notes}
` : ''}
${caseItem.findings ? `INVESTIGATION FINDINGS
----------------------
${caseItem.findings}
` : ''}
${caseItem.actionsTaken && caseItem.actionsTaken.length > 0 ? `ACTIONS TAKEN
-------------
${caseItem.actionsTaken.map((action, index) => `${index + 1}. ${action}`).join('\n')}
` : ''}
${caseItem.recommendation ? `RECOMMENDATIONS
---------------
${caseItem.recommendation}
` : ''}
=====================================
Report Generated: ${new Date().toLocaleString()}
=====================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `case_report_${caseItem.caseId}_${new Date().toISOString().slice(0, 10)}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Report Downloaded', {
      description: `Case report ${caseItem.caseId} has been downloaded successfully`
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader title="Case reports" subtitle="Resolved incidents and documentation" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-[#A7EA3B]" size={20} />
              <div className="text-[#98A0AC] text-sm">Total Cases</div>
            </div>
            <div className="text-3xl">{state.cases.length}</div>
          </div>

          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-[#FF6B6B]" size={20} />
              <div className="text-[#98A0AC] text-sm">True Positives</div>
            </div>
            <div className="text-3xl text-[#FF6B6B]">{truePositives}</div>
          </div>

          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="text-[#64D16C]" size={20} />
              <div className="text-[#98A0AC] text-sm">False Positives</div>
            </div>
            <div className="text-3xl text-[#64D16C]">{falsePositives}</div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-[#19232C] rounded-xl p-3 md:p-5">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <TrendingUp className="text-[#A7EA3B]" size={20} />
            <h3 className="m-0 text-sm md:text-base">Case History</h3>
          </div>

          {/* Search and Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* Search by Case ID */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A0AC]" size={18} />
              <input
                type="text"
                placeholder="Search by Case ID or Alert ID..."
                value={searchCaseId}
                onChange={(e) => setSearchCaseId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gradient-to-b from-white/[0.01] to-transparent border border-white/[0.06] text-[#E6EEF6] placeholder-[#98A0AC] outline-none focus:border-[#A7EA3B]/30 transition-colors text-sm"
              />
            </div>

            {/* General Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A0AC]" size={18} />
              <input
                type="text"
                placeholder="Search by Rule, Analyst, Type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gradient-to-b from-white/[0.01] to-transparent border border-white/[0.06] text-[#E6EEF6] placeholder-[#98A0AC] outline-none focus:border-[#A7EA3B]/30 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="text-[#98A0AC]" size={16} />
              <span className="text-[#98A0AC] text-sm">Filters:</span>
            </div>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gradient-to-b from-white/[0.01] to-transparent border border-white/[0.06] text-[#E6EEF6] outline-none cursor-pointer text-sm hover:border-[#A7EA3B]/30 transition-colors"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Resolution Filter */}
            <select
              value={filterResolution}
              onChange={(e) => setFilterResolution(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gradient-to-b from-white/[0.01] to-transparent border border-white/[0.06] text-[#E6EEF6] outline-none cursor-pointer text-sm hover:border-[#A7EA3B]/30 transition-colors"
            >
              <option value="all">All Resolutions</option>
              <option value="True Positive">True Positive</option>
              <option value="False Positive">False Positive</option>
            </select>

            {/* Results Count */}
            <div className="ml-auto text-[#98A0AC] text-sm">
              Showing <span className="text-[#A7EA3B] font-medium">{filteredCases.length}</span> of <span className="text-[#E6EEF6]">{state.cases.length}</span> cases
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || searchCaseId || filterSeverity !== 'all' || filterResolution !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchCaseId('');
                  setFilterSeverity('all');
                  setFilterResolution('all');
                }}
                className="px-3 py-2 rounded-lg border border-[#A7EA3B]/30 text-[#A7EA3B] hover:bg-[#A7EA3B]/5 transition-colors text-sm"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="bg-[#19232C] rounded-xl border border-white/[0.03] overflow-hidden">
            {/* Scroll Hint for Mobile */}
            <div className="md:hidden bg-[#A7EA3B]/5 border-b border-[#A7EA3B]/20 px-3 py-2 text-center">
              <div className="text-[#A7EA3B] text-xs flex items-center justify-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-pulse">
                  <path d="M6 8L8 6L10 8M6 10L8 12L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 8 8)"/>
                </svg>
                Swipe left to see more
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead className="bg-[#0f1a22]">
                  <tr>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs w-[80px] md:w-[100px]">Case ID</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs">Alert rule</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs w-[70px] md:w-[100px]">Severity</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs w-[60px] md:w-[100px]">Type</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs w-[60px] md:w-[120px]">Status</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs w-[80px] md:w-[110px]">Resolved</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 md:px-4 py-5 md:py-7 text-center text-[#98A0AC] text-xs md:text-sm">
                        No case reports yet. Resolve alerts from the Alert Queue to generate detailed case reports.
                      </td>
                    </tr>
                  ) : (
                    [...filteredCases].reverse().map((caseItem) => (
                      <tr
                        key={caseItem.caseId}
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-2 md:px-4 py-2 md:py-3 text-[#A7EA3B] text-xs">{caseItem.caseId}</td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-[#E6EEF6] text-xs">
                          <div className="line-clamp-2 md:line-clamp-none">{caseItem.rule}</div>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs">
                          <span className={`inline-block px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-xs ${getSeverityColor(caseItem.severity)}`}>
                            {caseItem.severity}
                          </span>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs">{caseItem.type}</td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs">
                          <span
                            className={`inline-block px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-xs ${
                              caseItem.resolution === 'True Positive'
                                ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                                : 'bg-[#64D16C]/20 text-[#64D16C]'
                            }`}
                          >
                            {caseItem.resolution === 'True Positive' ? 'TP' : 'FP'}
                          </span>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs">
                          {caseItem.dateResolved}
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs">
                          <div className="flex items-center gap-1 md:gap-2">
                            <button
                              onClick={() => setSelectedCase(caseItem)}
                              className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-[#A7EA3B]/[0.3] text-[#A7EA3B] hover:bg-[#A7EA3B]/[0.05] transition-colors text-xs whitespace-nowrap"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadCaseReport(caseItem);
                              }}
                              className="px-1.5 md:px-2 py-1 md:py-1.5 rounded-lg border border-[#A7EA3B]/[0.3] text-[#A7EA3B] hover:bg-[#A7EA3B]/[0.05] transition-colors"
                              title="Download Report"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <CaseModal 
        case={selectedCase} 
        onClose={() => setSelectedCase(null)}
        onDownload={downloadCaseReport}
      />
    </div>
  );
}