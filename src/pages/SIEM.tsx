import PageHeader from '../components/PageHeader';
import { ExternalLink, Activity, Server } from 'lucide-react';
import { useState } from 'react';

export default function SIEM() {
  const [splunkUrl, setSplunkUrl] = useState('https://www.splunk.com');

  const handleOpenSplunk = () => {
    window.open(splunkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <PageHeader title="SIEM" subtitle="Logs & dashboards" />

      {/* Splunk Integration Card */}
      <div className="bg-gradient-to-br from-[#A7EA3B]/[0.08] to-[#A7EA3B]/[0.02] border border-[#A7EA3B]/[0.15] rounded-[10px] p-5 mt-3">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-gradient-to-br from-[#A7EA3B]/[0.15] to-[#A7EA3B]/[0.08] rounded-lg p-3">
            <Server className="text-[#A7EA3B]" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl mb-1 flex items-center gap-2">
              <span>Splunk Integration</span>
              <Activity className="text-[#A7EA3B]" size={18} />
            </h2>
            <p className="text-[#98A0AC] text-sm">
              Access your Splunk SIEM platform for advanced log analysis and threat detection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-[#0F1722] rounded-lg p-4">
            <div className="text-[#A7EA3B] text-xs mb-2">Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#A7EA3B] rounded-full animate-pulse"></div>
              <span className="text-sm">Connected</span>
            </div>
          </div>
          <div className="bg-[#0F1722] rounded-lg p-4">
            <div className="text-[#A7EA3B] text-xs mb-2">Environment</div>
            <div className="text-sm">Production Instance</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleOpenSplunk}
            className="flex-1 bg-[#A7EA3B] text-[#0F1722] px-5 py-3 rounded-lg hover:bg-[#98d932] transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            <span>Open Splunk Dashboard</span>
          </button>
          
          <button
            onClick={() => {
              const newUrl = prompt('Enter Splunk URL:', splunkUrl);
              if (newUrl) setSplunkUrl(newUrl);
            }}
            className="px-5 py-3 rounded-lg border border-[#A7EA3B]/[0.3] text-[#A7EA3B] hover:bg-[#A7EA3B]/[0.05] transition-colors"
          >
            Configure URL
          </button>
        </div>

        <div className="mt-4 p-3 bg-[#0F1722]/[0.5] rounded-lg border border-white/[0.03]">
          <div className="text-[#98A0AC] text-xs mb-1">Current URL:</div>
          <div className="text-sm text-[#E6EEF6] break-all font-mono">{splunkUrl}</div>
        </div>
      </div>

      {/* SIEM Logs Placeholder */}
      <div className="bg-[#19232C] p-[18px] rounded-[10px] mt-3 border border-white/[0.03]">
        <h3 className="text-lg mb-3 flex items-center gap-2">
          <Activity className="text-[#A7EA3B]" size={20} />
          <span>Local SIEM Logs</span>
        </h3>
        <div className="text-[#98A0AC] text-sm">
          SIEM view placeholder — integrate charts or logs here.
        </div>
      </div>
    </div>
  );
}