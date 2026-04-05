import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import type { Alert } from '../context/SOCContext';
import PageHeader from '../components/PageHeader';
import DashboardChart from '../components/DashboardChart';
import AlertModal from '../components/AlertModal';
import { getDashboardAlerts } from '../apiClient';
import { mapRemoteDashboardAlertToAlert } from '../utils/mapRemoteDashboardAlert';

export default function Dashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'types' | 'severity'>('types');
  const [sortBy, setSortBy] = useState<'severity' | 'recent'>('severity');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const loadAlerts = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await getDashboardAlerts();
      const mapped = (data.alerts ?? []).map(mapRemoteDashboardAlertToAlert);
      setAlerts(mapped);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load alerts';
      setLoadError(message);
      toast.error('Could not load dashboard alerts', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const stats = useMemo(() => {
    const total = alerts.length;
    const closed = alerts.filter((a) => a.status === 'Closed').length;
    const openAlerts = alerts.filter((a) => a.status === 'Open').length;
    const truePositives = alerts.reduce(
      (sum, a) => sum + (a.true_positive_count ?? 0),
      0,
    );
    const falsePositives = alerts.reduce(
      (sum, a) => sum + (a.false_positive_count ?? 0),
      0,
    );
    return { total, closed, truePositives, falsePositives, openAlerts };
  }, [alerts]);

  const openAlerts = useMemo(() => {
    const open = alerts.filter((a) => a.status === 'Open');

    if (sortBy === 'severity') {
      const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return [...open].sort((a, b) => {
        const aOrder = severityOrder[a.severity as keyof typeof severityOrder] ?? 4;
        const bOrder = severityOrder[b.severity as keyof typeof severityOrder] ?? 4;
        return aOrder - bOrder;
      });
    }
    return [...open].sort(
      (a, b) =>
        new Date(b.lastSeen ?? b.timestamp ?? b.date).getTime() -
        new Date(a.lastSeen ?? a.timestamp ?? a.date).getTime(),
    );
  }, [alerts, sortBy]);

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

  const formatId = (id: string) =>
    id.length > 12 ? `${id.slice(0, 10)}…` : id;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={
          isLoading
            ? 'Loading alerts from API…'
            : loadError
              ? 'Alerts API unavailable'
              : `Live API • ${stats.openAlerts} open alerts`
        }
      />

      {loadError && (
        <div className="mt-3 p-3 rounded-[10px] bg-[#FF6B6B]/10 border border-[#FF6B6B]/25 text-sm text-[#E6EEF6]">
          {loadError}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              void loadAlerts();
            }}
            className="ml-3 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-[#19232C] p-3 rounded-[10px] min-h-[90px]">
          <div className="text-[#98A0AC] text-xs mb-1">Total alerts</div>
          <div className="text-2xl">{isLoading ? '—' : stats.total}</div>
        </div>
        <div className="bg-[#19232C] p-3 rounded-[10px] min-h-[90px]">
          <div className="text-[#98A0AC] text-xs mb-1">Closed alerts</div>
          <div className="text-2xl">{isLoading ? '—' : stats.closed}</div>
        </div>
        <div className="bg-[#19232C] p-3 rounded-[10px] min-h-[90px]">
          <div className="text-[#98A0AC] text-xs mb-1">True positive count (sum)</div>
          <div className="text-2xl">{isLoading ? '—' : stats.truePositives}</div>
        </div>
        <div className="bg-[#19232C] p-3 rounded-[10px] min-h-[90px]">
          <div className="text-[#98A0AC] text-xs mb-1">False positive count (sum)</div>
          <div className="text-2xl">{isLoading ? '—' : stats.falsePositives}</div>
        </div>
      </section>

      <section className="mt-[18px]">
        <div className="flex justify-between items-center gap-3 mb-[18px]">
          <h3 className="m-0">Alerts overview</h3>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                void loadAlerts();
              }}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg border border-white/[0.06] text-[#98A0AC] text-sm hover:bg-white/[0.04] disabled:opacity-50"
            >
              Refresh
            </button>
            <div className="inline-flex bg-gradient-to-b from-white/[0.01] to-transparent rounded-[10px] p-1 border border-white/[0.04] gap-[6px] items-center">
              <button
                onClick={() => setActiveTab('types')}
                className={`px-3 py-2 rounded-lg border-0 cursor-pointer text-sm ${
                  activeTab === 'types'
                    ? 'bg-[#A7EA3B] text-[#07220a] shadow-[0_6px_18px_rgba(167,234,59,0.06)]'
                    : 'bg-transparent text-[#98A0AC] hover:text-[#E6EEF6] hover:bg-white/[0.01]'
                }`}
              >
                Alert types
              </button>
              <button
                onClick={() => setActiveTab('severity')}
                className={`px-3 py-2 rounded-lg border-0 cursor-pointer text-sm ${
                  activeTab === 'severity'
                    ? 'bg-[#A7EA3B] text-[#07220a] shadow-[0_6px_18px_rgba(167,234,59,0.06)]'
                    : 'bg-transparent text-[#98A0AC] hover:text-[#E6EEF6] hover:bg-white/[0.01]'
                }`}
              >
                Alert severity
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
          <DashboardChart alerts={alerts} activeTab={activeTab} />

          <div className="bg-[#19232C] p-[18px] rounded-[10px] h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="m-0">Open alerts</h3>
              <div className="text-[#98A0AC] text-sm">
                Sort by
                <div className="inline-block ml-2.5 relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'severity' | 'recent')}
                    className="min-w-[150px] px-2.5 py-2 rounded-lg bg-gradient-to-b from-white/[0.01] to-transparent border border-white/[0.03] text-[#98A0AC] outline-none cursor-pointer appearance-none pr-8"
                  >
                    <option value="severity">Severity</option>
                    <option value="recent">Most recent</option>
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                    ▾
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[#98A0AC] mb-3 text-sm">
              Data from{' '}
              <span className="text-[#E6EEF6] font-mono text-xs">
                /alerts
              </span>{' '}
              on the alerts API service.
            </div>

            <div className="bg-[#19232C] rounded-[10px] border border-white/[0.03] overflow-hidden flex-1 flex flex-col">
              <table className="w-full border-collapse">
                <thead className="bg-[#0f1a22]">
                  <tr>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[100px]">ID</th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm">Alert rule</th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[90px]">Severity</th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[120px]">Type</th>
                  </tr>
                </thead>
              </table>
              <div className="overflow-y-auto flex-1">
                <table className="w-full border-collapse">
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-3.5 py-7 text-center text-[#98A0AC]">
                          Loading…
                        </td>
                      </tr>
                    ) : openAlerts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3.5 py-7 text-center text-[#98A0AC]">
                          No open alerts
                        </td>
                      </tr>
                    ) : (
                      openAlerts.map((alert) => (
                        <tr
                          key={alert.id}
                          className="border-b border-white/[0.02] hover:bg-white/[0.02]"
                        >
                          <td
                            className="px-3.5 py-3 text-[#98A0AC] text-sm w-[100px] font-mono text-xs"
                            title={alert.id}
                          >
                            {formatId(alert.id)}
                          </td>
                          <td
                            className="px-3.5 py-3 text-[#E6EEF6] text-sm cursor-pointer hover:text-[#A7EA3B]"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            {alert.rule}
                          </td>
                          <td className="px-3.5 py-3 text-sm w-[90px]">
                            <span
                              className={`px-2 py-1.5 rounded-lg text-sm inline-block ${getSeverityColor(
                                alert.severity,
                              )}`}
                            >
                              {alert.severity}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-[#98A0AC] text-sm w-[120px]">
                            {alert.type}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => navigate('/alert-queue')}
                className="px-2 py-1.5 rounded-lg bg-transparent border border-white/[0.03] text-[#98A0AC] text-sm cursor-pointer hover:bg-white/[0.02]"
              >
                Open full queue
              </button>
            </div>
          </div>
        </div>
      </section>

      <AlertModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onResolve={() => {}}
        readOnly
      />
    </div>
  );
}
