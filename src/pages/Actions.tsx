import { useState } from 'react';
import { useSOC, Alert } from '../context/SOCContext';
import PageHeader from '../components/PageHeader';
import AlertModal from '../components/AlertModal';

export default function Actions() {
  const { state } = useSOC();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const closedAlerts = state.alerts.filter((a) => a.status === 'Closed');

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

  const getResolutionForAlert = (alertId: string) => {
    const caseItem = state.cases.find((c) => c.alertId === alertId);
    return caseItem?.resolution || 'Unknown';
  };

  return (
    <div>
      <PageHeader
        title="Actions"
        subtitle={`Closed alerts • ${closedAlerts.length} total`}
      />

      <section className="mt-[18px]">
        <div className="bg-[#19232C] rounded-[10px] p-[18px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="m-0">Closed Alerts History</h3>
            <div className="text-[#98A0AC] text-sm">
              {closedAlerts.length} alert{closedAlerts.length !== 1 ? 's' : ''} resolved
            </div>
          </div>

          <div className="text-[#98A0AC] mb-4 text-sm">
            View all alerts that have been investigated and closed. Click on any alert to see full details.
          </div>

          <div className="bg-[#19232C] rounded-[10px] border border-white/[0.03] overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-[#0f1a22]">
                <tr>
                  <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[80px]">ID</th>
                  <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm">Alert rule</th>
                  <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[100px]">Severity</th>
                  <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[120px]">Type</th>
                  <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[110px]">Date</th>
                  <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[120px]">Resolution</th>
                </tr>
              </thead>
              <tbody>
                {closedAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3.5 py-7 text-center text-[#98A0AC]">
                      No closed alerts yet. Resolve alerts from the Alert Queue to see them here.
                    </td>
                  </tr>
                ) : (
                  closedAlerts.map((alert) => {
                    const resolution = getResolutionForAlert(alert.id);
                    return (
                      <tr
                        key={alert.id}
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] cursor-pointer"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <td className="px-3.5 py-3 text-[#98A0AC] text-sm">{alert.id}</td>
                        <td className="px-3.5 py-3 text-[#E6EEF6] text-sm hover:text-[#A7EA3B]">
                          {alert.rule}
                        </td>
                        <td className="px-3.5 py-3 text-sm">
                          <span
                            className={`px-2 py-1.5 rounded-lg text-sm inline-block ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-[#98A0AC] text-sm">{alert.type}</td>
                        <td className="px-3.5 py-3 text-[#98A0AC] text-sm">{alert.date}</td>
                        <td className="px-3.5 py-3 text-sm">
                          <span
                            className={`px-2 py-1.5 rounded-lg text-sm inline-block ${
                              resolution === 'True Positive'
                                ? 'bg-[#FF6B6B] text-[#3a0b0b]'
                                : resolution === 'False Positive'
                                ? 'bg-[#A7F3D0] text-[#0b3c2a]'
                                : 'bg-[#98A0AC] text-[#0F1722]'
                            }`}
                          >
                            {resolution === 'True Positive' ? 'TP' : resolution === 'False Positive' ? 'FP' : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <AlertModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAssign={() => {}}
        onResolve={() => {}}
      />
    </div>
  );
}