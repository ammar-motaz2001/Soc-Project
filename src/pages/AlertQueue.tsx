import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSOC } from '../context/SOCContext';
import PageHeader from '../components/PageHeader';
import AlertModal from '../components/AlertModal';
import { Alert } from '../context/SOCContext';

export default function AlertQueue() {
  const { state, assignAlert, resolveAlert } = useSOC();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const assignedAlert = state.alerts.find(
    (a) => a.assigned === 'analyst' && a.status === 'Open'
  );

  const filteredAlerts = useMemo(() => {
    let filtered = [...state.alerts].reverse();

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.id.toLowerCase().includes(searchLower) ||
          a.rule.toLowerCase().includes(searchLower) ||
          a.type.toLowerCase().includes(searchLower)
      );
    }

    if (severityFilter) {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    return filtered;
  }, [state.alerts, search, severityFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / perPage));
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleAssign = (id: string) => {
    assignAlert(id);
  };

  const handleResolve = (id: string, resolution: 'True Positive' | 'False Positive') => {
    resolveAlert(id, resolution);
  };

  return (
    <div>
      <PageHeader title="Alert queue" subtitle="Manage and triage alerts" />

      <div className="bg-[#19232C] rounded-xl p-3 md:p-5">
        <div className="mb-3 md:mb-4 text-[#98A0AC] text-xs md:text-sm">Assigned alert</div>
        <div className="border-l-2 border-[#A7EA3B]/30 pl-3 md:pl-4 text-[#98A0AC] text-xs md:text-sm mb-4 md:mb-6">
          {assignedAlert ? (
            <>
              You are assigned to{' '}
              <strong className="text-[#A7EA3B]">{assignedAlert.id}</strong> -{' '}
              {assignedAlert.rule}
            </>
          ) : (
            "You haven't picked up any alert! Assign yourself to an alert to start investigating."
          )}
        </div>

        <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="flex items-center gap-2.5 bg-[#151C26] px-3 md:px-4 py-2 rounded-lg text-[#98A0AC] flex-1 md:flex-initial">
            <Search size={16} className="opacity-80" />
            <input
              type="text"
              placeholder="Search for an alert"
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
          <table className="w-full border-collapse min-w-[800px]">
            <thead className="bg-[#0f1a22]">
              <tr>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">ID</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">Alert rule</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">Severity</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">Type</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">Date</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">Status</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-[#98A0AC] text-xs md:text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 md:px-4 py-5 md:py-7 text-center text-[#98A0AC] text-xs md:text-sm">
                    Showing 0 entries
                  </td>
                </tr>
              ) : (
                paginatedAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">{alert.id}</td>
                    <td
                      className="px-2 md:px-4 py-2 md:py-3 text-[#E6EEF6] text-xs md:text-sm cursor-pointer hover:text-[#A7EA3B]"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      {alert.rule}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">{alert.severity}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">{alert.type}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">{alert.date}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-[#98A0AC] text-xs md:text-sm">
                      {alert.status}
                      {alert.assigned && (
                        <span className="text-[#A7EA3B]"> • {alert.assigned}</span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={() => handleAssign(alert.id)}
                          className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-[#A7EA3B] text-[#07220a] hover:bg-[#A7EA3B]/90 transition-colors text-xs md:text-sm"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-white/[0.04] text-[#98A0AC] hover:bg-white/[0.02] transition-colors text-xs md:text-sm"
                        >
                          View
                        </button>
                      </div>
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
        onAssign={handleAssign}
        onResolve={handleResolve}
      />
    </div>
  );
}