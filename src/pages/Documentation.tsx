import { useState } from 'react';
import PageHeader from '../components/PageHeader';

const tabs = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'triage', label: 'Alert triage' },
  { id: 'classification', label: 'Alert Classification' },
  { id: 'reporting', label: 'Alert Reporting' },
  { id: 'company', label: 'Company information' },
  { id: 'assets', label: 'Asset Inventory' },
];

interface TabContentProps {
  activeTab: string;
}

function TabContent({ activeTab }: TabContentProps) {
  switch (activeTab) {
    case 'welcome':
      return (
        <>
          <h2 className="text-[#E6EEF6] mt-0">Welcome</h2>
          <p className="my-2">
            Get ready to step into the shoes of a Security Operations Center (SOC) analyst. This
            platform simulates real-world scenarios where you'll receive alerts, investigate them as
            needed, and take appropriate actions to resolve or close them.
          </p>
          <p className="my-2">
            Since this is a simulation, alerts may not arrive in rapid succession — delays are
            intentional to mirror a realistic workflow and give you time to think through each case.
          </p>
          <div className="text-[#E6EEF6] mt-3.5 mb-2">How to use this documentation</div>
          <ul className="ml-[18px]">
            <li className="my-1.5">
              Read the <strong>Alert triage</strong> guide to understand initial steps when an alert
              is received.
            </li>
            <li className="my-1.5">
              Follow the <strong>Alert Classification</strong> guidance when marking alerts as True
              Positive or False Positive.
            </li>
            <li className="my-1.5">
              Use the <strong>Alert Reporting</strong> guide to write clear, useful case reports.
            </li>
            <li className="my-1.5">
              Refer to <strong>Company information</strong> and <strong>Asset Inventory</strong> when
              identifying impacted hosts or users.
            </li>
          </ul>
        </>
      );

    case 'triage':
      return (
        <>
          <h2 className="text-[#E6EEF6] mt-0">Alert triage</h2>
          <div className="text-[#E6EEF6] mt-3.5 mb-2">Read Before You Begin</div>
          <ul className="ml-[18px]">
            <li className="my-1.5">
              Check out the Alert Triage Playbook described in this documentation.
            </li>
            <li className="my-1.5">
              Assign the earliest alert to yourself to start the investigation.
            </li>
            <li className="my-1.5">
              Review the alert details and any provided IOCs (IPs, domains, filenames).
            </li>
            <li className="my-1.5">
              Use the SIEM and Analyst VM tools to gather more context and evidence.
            </li>
          </ul>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Alert Triage Playbook</div>
          <ol className="ml-[18px] list-decimal">
            <li className="my-1.5">
              <strong>Initial Alert Review:</strong>
              <ul className="ml-[18px] list-disc">
                <li className="my-1">
                  <strong>Access the SOC Dashboard:</strong> Review the new alerts and their
                  severity.
                </li>
                <li className="my-1">
                  <strong>Assign Alert to Yourself:</strong> Add the alert to your assigned list.
                </li>
                <li className="my-1">
                  <strong>Understand Alert Logic:</strong> Read the rule description and expected
                  behavior.
                </li>
                <li className="my-1">
                  <strong>Review Alert Details:</strong> Check all attached IOCs and quick context.
                </li>
              </ul>
            </li>

            <li className="my-1.5">
              <strong>Investigate in the SIEM:</strong>
              <ul className="ml-[18px] list-disc">
                <li className="my-1">
                  <strong>Access the SIEM:</strong> Query logs to build a timeline.
                </li>
                <li className="my-1">
                  <strong>Query Related Logs:</strong> Correlate endpoints, user, and network data.
                </li>
                <li className="my-1">
                  <strong>Use Analyst VM:</strong> Run lookups and threat-intel checks.
                </li>
                <li className="my-1">
                  <strong>Correlate:</strong> Verify whether activity is anomalous or expected.
                </li>
              </ul>
            </li>

            <li className="my-1.5">
              <strong>Resolution and Closure:</strong>
              <ul className="ml-[18px] list-disc">
                <li className="my-1">
                  <strong>Decide on Classification:</strong> True Positive or False Positive.
                </li>
                <li className="my-1">
                  <strong>Write Case Report:</strong> Document evidence, actions, and
                  recommendations.
                </li>
                <li className="my-1">
                  <strong>Escalate if Needed:</strong> If remediation is required (isolate host,
                  password reset).
                </li>
                <li className="my-1">
                  <strong>Close the Alert:</strong> Submit the case report and close in the
                  dashboard.
                </li>
              </ul>
            </li>
          </ol>
        </>
      );

    case 'classification':
      return (
        <>
          <h2 className="text-[#E6EEF6] mt-0">Alert Classification</h2>
          <div className="text-[#E6EEF6] mt-3.5 mb-2">True Positive</div>
          <p className="my-2">
            Classification for confirmed unauthorized access or malicious activity — e.g., malware,
            credential theft, data exfiltration. True Positives normally require remediation such as
            host isolation, password rotation, or malware cleanup.
          </p>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">False Positive</div>
          <p className="my-2">
            Classification for activity determined to be legitimate or benign (no malicious intent).
            False Positives are useful for tuning detection rules and improving coverage.
          </p>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Classification Examples</div>
          <ul className="ml-[18px]">
            <li className="my-1.5">
              <strong>Rule: "Windows Account Brute Force"</strong>
              <ul className="ml-[18px] list-disc">
                <li className="my-1">
                  <strong>True Positive:</strong> Repeated failed attempts from an external IP,
                  followed by successful login from that IP.
                </li>
                <li className="my-1">
                  <strong>False Positive:</strong> A legitimate scheduled script performed password
                  validations and triggered the rule.
                </li>
              </ul>
            </li>
            <li className="my-1.5">
              <strong>Rule: "Login from Unfamiliar Location"</strong>
              <ul className="ml-[18px] list-disc">
                <li className="my-1">
                  <strong>True Positive:</strong> Login from a foreign datacenter IP to a critical
                  account.
                </li>
                <li className="my-1">
                  <strong>False Positive:</strong> User connecting via corporate VPN node in another
                  region.
                </li>
              </ul>
            </li>
          </ul>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Alert Escalation</div>
          <p className="my-2">
            If the alert is a True Positive and requires immediate action, follow escalation
            procedures: notify SOC Lead, isolate affected hosts, and open a remediation incident in
            the tracker.
          </p>
        </>
      );

    case 'reporting':
      return (
        <>
          <h2 className="text-[#E6EEF6] mt-0">Alert Reporting</h2>
          <p className="my-2">
            Good reporting makes remediation and future detection easier. Include the following in
            every case report:
          </p>
          <ul className="ml-[18px]">
            <li className="my-1.5">
              <strong>Who/What:</strong> The identities and assets affected.
            </li>
            <li className="my-1.5">
              <strong>Where:</strong> The network location, host, or service impacted.
            </li>
            <li className="my-1.5">
              <strong>When:</strong> Time range of the activity.
            </li>
            <li className="my-1.5">
              <strong>IOCs:</strong> IPs, domains, file hashes, ports, and other indicators.
            </li>
            <li className="my-1.5">
              <strong>Actions taken:</strong> Containment, eradication, and recovery steps.
            </li>
          </ul>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Best Practice Reports</div>
          <div className="border-l-4 border-white/[0.06] pl-3 text-[#98A0AC] my-3">
            Include clear recommendations and context — e.g., "Immediate isolation required: host X
            shows active C2 traffic at time Y."
          </div>

          <h3 className="mt-3 text-[#E6EEF6]">
            Example: True Positive — "Windows Account Brute Force"
          </h3>
          <p className="my-2">
            This activity is classified as a True Positive because multiple failed attempts from IP
            211.219.22.213 ... (example text for the report body).
          </p>

          <h3 className="mt-3 text-[#E6EEF6]">
            Example: False Positive — "Windows Account Brute Force"
          </h3>
          <p className="my-2">
            This activity is classified as a False Positive because investigation shows the user's
            account used an expired password and the failures are consistent with scheduled jobs.
          </p>
        </>
      );

    case 'company':
      return (
        <>
          <h2 className="text-[#E6EEF6] mt-0">Company information</h2>
          <p className="my-2">Useful static information to reference during investigations.</p>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Firewall</div>
          <p className="my-2">
            Firewall: Firewall logs from company's main firewall. Use the firewall console for
            block/allow evidence.
          </p>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Analyst Workstation</div>
          <p className="my-2">
            Analysts have access to the TryDetectThis VM via the Analyst VM portal. Use it for
            lookups and sandboxing suspicious files.
          </p>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Employees</div>
          <table className="w-full border-collapse mt-3">
            <thead>
              <tr>
                <th className="border border-white/[0.04] p-2.5 text-left text-[#98A0AC] bg-white/[0.01]">
                  Name
                </th>
                <th className="border border-white/[0.04] p-2.5 text-left text-[#98A0AC] bg-white/[0.01]">
                  Department
                </th>
                <th className="border border-white/[0.04] p-2.5 text-left text-[#98A0AC] bg-white/[0.01]">
                  Email
                </th>
                <th className="border border-white/[0.04] p-2.5 text-left text-[#98A0AC] bg-white/[0.01]">
                  Logged-in Host
                </th>
                <th className="border border-white/[0.04] p-2.5 text-left text-[#98A0AC] bg-white/[0.01]">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">Ethan Johnson</td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">Editorial</td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">
                  e.johnson@thetrydaily.thm
                </td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">win-3451</td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">10.20.2.1</td>
              </tr>
              <tr>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">Julia Garcia</td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">Content</td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">
                  j.garcia@thetrydaily.thm
                </td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">win-3452</td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">10.20.2.8</td>
              </tr>
              <tr>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">
                  Isabella Martinez
                </td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">Marketing</td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">
                  i.martinez@thetrydaily.thm
                </td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">win-3453</td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">10.20.2.9</td>
              </tr>
            </tbody>
          </table>
        </>
      );

    case 'assets':
      return (
        <>
          <h2 className="text-[#E6EEF6] mt-0">Asset Inventory</h2>
          <p className="my-2">
            Known network ranges and asset purpose used for triage and containment decisions.
          </p>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Network and Subnets</div>
          <table className="w-full border-collapse mt-3">
            <thead>
              <tr>
                <th className="border border-white/[0.04] p-2.5 text-left text-[#98A0AC] bg-white/[0.01]">
                  Purpose
                </th>
                <th className="border border-white/[0.04] p-2.5 text-left text-[#98A0AC] bg-white/[0.01]">
                  Range
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">
                  Office Network
                </td>
                <td className="border border-white/[0.04] p-2.5 text-[#98A0AC]">10.20.2.0/24</td>
              </tr>
            </tbody>
          </table>

          <div className="text-[#E6EEF6] mt-3.5 mb-2">Hosts of interest</div>
          <ul className="ml-[18px]">
            <li className="my-1.5">win-3451 — Editor workstation (10.20.2.1)</li>
            <li className="my-1.5">win-3453 — Marketing (10.20.2.9)</li>
            <li className="my-1.5">trydetect-vm — Analyst VM (internal)</li>
          </ul>
        </>
      );

    default:
      return <p>No content</p>;
  }
}

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('welcome');

  return (
    <div>
      <PageHeader title="Documentation" subtitle="Guides & playbooks" />

      <div className="mt-3">
        <div className="flex gap-[22px] border-b border-white/[0.03] pb-3 items-center overflow-auto whitespace-nowrap">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-1 text-sm cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#A7EA3B] border-b-[3px] border-[#A7EA3B] pb-[9px]'
                  : 'text-[#98A0AC]'
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="mt-[18px] bg-[#19232C] p-[22px] rounded-[10px] border border-white/[0.03] min-h-[520px] text-[#98A0AC] leading-relaxed">
          <TabContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}
