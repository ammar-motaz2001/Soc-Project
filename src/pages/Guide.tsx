import { Home, Bell, CheckCircle, Database, FileText, BookOpen, FolderOpen, Shield, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function Guide() {
  const sections = [
    {
      icon: Home,
      title: 'Dashboard',
      path: 'Home Page',
      description: 'The main page of the system where you can see an overview of all security alerts.',
      features: [
        'Display alert statistics (Total, Open, Closed, True Positive, False Positive)',
        'Interactive charts showing alert distribution by type and severity',
        'Display open alerts sorted by severity or date',
        'Real-time statistics updates'
      ]
    },
    {
      icon: Bell,
      title: 'Alert Queue',
      path: 'Alert Management',
      description: 'Page for managing all open and closed security alerts.',
      features: [
        'Display all alerts in an interactive table',
        'Filter alerts by status (Open/Closed)',
        'Assign alerts to analysts',
        'Add notes and track investigation progress',
        'View complete technical details for each alert (IPs, MACs, hashes, etc.)'
      ]
    },
    {
      icon: CheckCircle,
      title: 'Actions',
      path: 'Decision Making',
      description: 'Page for reviewing and resolving security alerts assigned to you.',
      features: [
        'Review alerts assigned to you',
        'Resolve alerts as True Positive or False Positive',
        'Add investigation findings and recommendations',
        'Document actions taken for each case',
        'Automatic case report generation'
      ]
    },
    {
      icon: Zap,
      title: 'Automated Actions',
      path: 'Security Automation',
      description: 'Monitor automated security actions taken by the system in response to Critical and High severity alerts.',
      features: [
        'Real-time automated response to high-risk threats',
        'IP blocking for suspicious network traffic',
        'Device isolation for compromised endpoints',
        'Email quarantine for phishing attempts',
        'Automatic notifications to security team',
        'Detailed action reports with technical information'
      ]
    },
    {
      icon: Database,
      title: 'SIEM Interface',
      path: 'SIEM Integration',
      description: 'Interface for integrating with SIEM systems and displaying security logs.',
      features: [
        'Search security logs',
        'Display real-time events',
        'Analyze security patterns',
        'Integration with external SIEM systems',
        'Filter data by source and time'
      ]
    },
    {
      icon: FileText,
      title: 'Documentation',
      path: 'Knowledge Center',
      description: 'Knowledge center and standard security procedures.',
      features: [
        'Incident response procedures',
        'Security checklists',
        'Security analyst guide',
        'Security classification standards',
        'Security best practices'
      ]
    },
    {
      icon: BookOpen,
      title: 'Playbooks',
      path: 'Response Procedures',
      description: 'Library of specific procedures for responding to different types of threats.',
      features: [
        'Phishing Response - Respond to phishing attacks',
        'Malware Investigation - Investigate malicious software',
        'Unauthorized Access - Handle unauthorized access',
        'Data Exfiltration - Data leakage response',
        'DDoS Mitigation - Denial of service attack mitigation'
      ]
    },
    {
      icon: FolderOpen,
      title: 'Case Reports',
      path: 'Case Archive',
      description: 'Archive of all closed cases and final reports.',
      features: [
        'Display all closed cases with complete details',
        'Advanced search by Case ID, Alert ID, Rule, Analyst, Type',
        'Filter by severity and resolution type',
        'Statistics on True Positive and False Positive',
        'Download detailed reports in text format',
        'Automatic case generation from automated actions'
      ]
    }
  ];

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader 
          title="System Guide" 
          subtitle="Welcome to IRAS (Incident Response Automation System). This guide explains all system sections and how to use them effectively."
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="max-w-5xl">
          {/* Overview Card */}
          <div className="bg-gradient-to-br from-[#A7EA3B]/[0.08] to-[#A7EA3B]/[0.02] border border-[#A7EA3B]/[0.15] rounded-[10px] p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="text-[#A7EA3B]" size={28} />
              <h2 className="text-xl m-0 text-[#A7EA3B]">System Overview</h2>
            </div>
            <p className="text-[#E6EEF6] text-sm leading-relaxed mb-4">
              IRAS is a Security Operations Center (SOC) simulation system designed to help cybersecurity teams manage 
              security alerts and respond to incidents effectively. The system provides an integrated interface for tracking, 
              analyzing, and resolving security threats with automated response capabilities.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#19232C] rounded-lg p-4 border border-white/[0.03]">
                <div className="text-[#A7EA3B] text-xs mb-1">Primary Function</div>
                <div className="text-sm">Security Alert Management</div>
              </div>
              <div className="bg-[#19232C] rounded-lg p-4 border border-white/[0.03]">
                <div className="text-[#A7EA3B] text-xs mb-1">Goal</div>
                <div className="text-sm">Rapid Incident Response</div>
              </div>
              <div className="bg-[#19232C] rounded-lg p-4 border border-white/[0.03]">
                <div className="text-[#A7EA3B] text-xs mb-1">Automation</div>
                <div className="text-sm">Real-time Threat Response</div>
              </div>
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="bg-[#19232C] rounded-[10px] p-5 border border-white/[0.03] hover:border-[#A7EA3B]/[0.2] transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gradient-to-br from-[#A7EA3B]/[0.1] to-[#A7EA3B]/[0.05] rounded-lg p-3 flex-shrink-0">
                      <Icon className="text-[#A7EA3B]" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg m-0">{section.title}</h3>
                        <span className="text-[#98A0AC] text-xs bg-[#0F1722] px-2.5 py-1 rounded-md border border-white/[0.03]">
                          {section.path}
                        </span>
                      </div>
                      <p className="text-[#98A0AC] text-sm leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0F1722] rounded-lg p-4 border border-white/[0.03]">
                    <div className="text-[#A7EA3B] text-xs mb-3 font-medium">Key Features:</div>
                    <ul className="space-y-2 m-0 p-0 list-none">
                      {section.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#E6EEF6]">
                          <span className="text-[#A7EA3B] mt-1 text-lg leading-none">•</span>
                          <span className="flex-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Getting Started Guide */}
          <div className="bg-gradient-to-br from-[#A7EA3B]/[0.05] to-transparent border border-[#A7EA3B]/[0.1] rounded-[10px] p-5 mb-6">
            <h3 className="text-lg mb-4 text-[#A7EA3B] flex items-center gap-2">
              <CheckCircle size={20} />
              Getting Started
            </h3>
            <ol className="space-y-2.5 m-0 pl-5 text-sm text-[#E6EEF6]">
              <li>Start from <strong className="text-[#A7EA3B]">Dashboard</strong> to see system overview and statistics</li>
              <li>Navigate to <strong className="text-[#A7EA3B]">Alert Queue</strong> to view all alerts</li>
              <li>Assign alerts to yourself using the "Assign to me" button</li>
              <li>Review assigned alerts in the <strong className="text-[#A7EA3B]">Actions</strong> page</li>
              <li>Use <strong className="text-[#A7EA3B]">Playbooks</strong> to learn appropriate response procedures</li>
              <li>Resolve alerts as True Positive or False Positive with detailed findings</li>
              <li>Monitor <strong className="text-[#A7EA3B]">Automated Actions</strong> for system responses to high-risk threats</li>
              <li>Review closed cases and download reports in <strong className="text-[#A7EA3B]">Case Reports</strong></li>
            </ol>
          </div>

          {/* Footer */}
          <div className="text-center bg-[#19232C] rounded-lg border border-white/[0.03] p-4">
            <div className="text-[#98A0AC] text-xs">
              IRAS - Incident Response Automation System | SOC Analyst Platform
            </div>
            <div className="text-[#98A0AC]/60 text-xs mt-1">
              Designed for security operations centers and incident response teams
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}