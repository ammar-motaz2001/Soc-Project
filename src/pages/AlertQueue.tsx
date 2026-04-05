import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Alert } from '../context/SOCContext';
import PageHeader from '../components/PageHeader';
import AlertModal from '../components/AlertModal';
import {
  getDashboardAlerts,
  patchCloseAlertAsFalsePositive,
  patchCloseAlertAsTruePositive,
} from '../apiClient';
import { mapRemoteDashboardAlertToAlert } from '../utils/mapRemoteDashboardAlert';

export default function AlertQueue() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalAlerts, setTotalAlerts] = useState<number | null>(null);
  const [totalClosed, setTotalClosed] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await getDashboardAlerts();
      const mapped = (data.alerts ?? []).map(mapRemoteDashboardAlertToAlert);
      setAlerts(mapped);
      setTotalAlerts(data.total_alerts ?? mapped.length);
      setTotalClosed(data.total_closed ?? mapped.filter((a) => a.status === 'Closed').length);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load alerts';
      setLoadError(message);
      toast.error('Could not load alert queue', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.id.toLowerCase().includes(searchLower) ||
          a.rule.toLowerCase().includes(searchLower) ||
          a.type.toLowerCase().includes(searchLower) ||
          (a.sourceIP?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    if (severityFilter) {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.lastSeen ?? b.timestamp ?? b.date).getTime() -
        new Date(a.lastSeen ?? a.timestamp ?? a.date).getTime(),
    );
  }, [alerts, search, severityFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / perPage));
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const handleResolve = async (
    id: string,
    resolution: 'True Positive' | 'False Positive',
  ) => {
    setClosingId(id);
    try {
      if (resolution === 'True Positive') {
        await patchCloseAlertAsTruePositive(id);
      } else {
        await patchCloseAlertAsFalsePositive(id);
      }
      toast.success(
        resolution === 'True Positive'
          ? 'Closed as true positive'
          : 'Closed as false positive',
      );
      setSelectedAlert(null);
      setIsLoading(true);
      await loadAlerts();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Request failed';
      toast.error('Could not close alert', { description: message });
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Alert queue"
        subtitle={
          isLoading
            ? 'Loading from API…'
            : loadError
              ? 'API unavailable'
              : `API • ${totalAlerts ?? alerts.length} total • ${totalClosed ?? '—'} closed`
        }
      />

      {loadError && (
        <div className="mb-3 p-3 rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/25 text-sm text-[#E6EEF6]">
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

      <div className="bg-[#19232C] rounded-xl p-3 md:p-5">
        <div className="flex flex-wrap items-center justify-end gap-2 mb-4 md:mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              void loadAlerts();
            }}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-white/[0.06] text-[#98A0AC] text-xs hover:bg-white/[0.04] disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="flex items-center gap-2.5 bg-[#151C26] px-3 md:px-4 py-2 rounded-lg text-[#98A0AC] flex-1 md:flex-initial">
            <Search size={16} className="opacity-80" />
            <input
              type="text"
              placeholder="Search ID, rule, type, IP"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 outline-none text-[#E6EEF6] text-sm w-full md:w-56"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-[#151C26] px-3 md:px-4 py-2 rounded-lg text-[#98A0AC] flex-1">
              <label className="text-xs">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 outline-none text-[#98A0AC] text-xs"
              >
                <option value="">All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#151C26] px-3 md:px-4 py-2 rounded-lg text-[#98A0AC] flex-1">
              <label className="text-xs">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 outline-none text-[#98A0AC] text-xs"
              >
                <option value="">All</option>
                <option value="Endpoint">Endpoint</option>
                <option value="Network">Network</option>
                <option value="Phishing">Phishing</option>
                <option value="Firewall">Firewall</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#98A0AC] text-xs md:text-sm md:ml-auto">
            Show
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 outline-none text-[#98A0AC] ml-1.5 text-xs"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
            alerts
          </div>
        </div>

        <div className="bg-[#19232C] rounded-xl border border-white/[0.03] overflow-x-auto">
          <table className="w-full border-collapse min-w-[820px]">
            <thead className="bg-[#0f1a22]">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">
                  ID
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">
                  Alert rule
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">
                  Device IP
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">
                  Severity
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">
                  Type
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">
                  Date
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">
                  Status
                </th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && alerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-2 md:px-4 py-5 md:py-7 text-center text-[#98A0AC] text-xs md:text-sm"
                  >
                    Loading…
                  </td>
                </tr>
              ) : paginatedAlerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-2 md:px-4 py-5 md:py-7 text-center text-[#98A0AC] text-xs md:text-sm"
                  >
                    Showing 0 entries
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm font-mono max-w-[120px] truncate" title={alert.id}>
                      {alert.id}
                    </td>
                    <td
                      className="px-2 md:px-4 py-2 md:py-3 text-[#E6EEF6] text-xs md:text-sm cursor-pointer hover:text-[#A7EA3B]"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      {alert.rule}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm font-mono">
                      {alert.sourceIP ?? '—'}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">
                      {alert.severity}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">
                      {alert.type}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">
                      {alert.date}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">
                      {alert.status}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                      <button
                        type="button"
                        onClick={() => setSelectedAlert(alert)}
                        className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-white/[0.04] text-[#98A0AC] hover:bg-white/[0.02] transition-colors text-xs md:text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 justify-end pt-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2 md:px-3 py-1 md:py-1.5 rounded text-xs md:text-sm text-[#98A0AC] hover:bg-white/[0.02] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <div className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-[#98A0AC] self-center">
              Page {currentPage} / {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2 md:px-3 py-1 md:py-1.5 rounded text-xs md:text-sm text-[#98A0AC] hover:bg-white/[0.02] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AlertModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onResolve={handleResolve}
        readOnly={selectedAlert?.status === 'Closed'}
        isBusy={closingId === selectedAlert?.id}
      />
    </div>
  );
}
