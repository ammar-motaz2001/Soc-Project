import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Server,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import type { Alert } from '../context/SOCContext';
import { toast } from 'sonner@2.0.3';
import {
  getDashboardAlerts,
  getAutomatedActionsList,
  type RemoteAutomatedAction,
} from '../apiClient';
import { mapRemoteDashboardAlertToAlert } from '../utils/mapRemoteDashboardAlert';
import {
  humanizeAutomatedActionKey,
  playbookCategoryFromActionKey,
} from '../utils/mapRemoteAutomatedAction';

interface PlaybookAggregate {
  actionKey: string;
  title: string;
  category: string;
  actions: RemoteAutomatedAction[];
  relatedAlerts: Alert[];
}

export default function Playbooks() {
  const [dashboardAlerts, setDashboardAlerts] = useState<Alert[]>([]);
  const [remoteActions, setRemoteActions] = useState<RemoteAutomatedAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookAggregate | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [alertsRes, actionsRes] = await Promise.all([
        getDashboardAlerts(),
        getAutomatedActionsList(),
      ]);
      const mappedAlerts = (alertsRes.alerts ?? []).map(mapRemoteDashboardAlertToAlert);
      setDashboardAlerts(mappedAlerts);
      setRemoteActions(actionsRes.automated_actions ?? []);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load playbooks data';
      setLoadError(message);
      toast.error('Could not load playbooks', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const playbooks = useMemo((): PlaybookAggregate[] => {
    const byAction = new Map<string, RemoteAutomatedAction[]>();
    for (const act of remoteActions) {
      const k = act.action;
      if (!byAction.has(k)) byAction.set(k, []);
      byAction.get(k)!.push(act);
    }

    const alertById = new Map(dashboardAlerts.map((a) => [a.id, a]));

    return Array.from(byAction.entries())
      .map(([actionKey, actions]) => {
        const linkedIds = new Set(
          actions
            .map((a) => a.alert_id)
            .filter((id): id is string => id != null && String(id).length > 0),
        );
        const relatedAlerts = [...linkedIds]
          .map((id) => alertById.get(id))
          .filter((a): a is Alert => a != undefined);

        const sortedActions = [...actions].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return {
          actionKey,
          title: humanizeAutomatedActionKey(actionKey),
          category: playbookCategoryFromActionKey(actionKey),
          actions: sortedActions,
          relatedAlerts,
        };
      })
      .sort((a, b) => b.actions.length - a.actions.length);
  }, [remoteActions, dashboardAlerts]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(playbooks.map((p) => p.category)))];
  }, [playbooks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setShowCategoryMenu(false);
      }
    };

    if (showCategoryMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryMenu]);

  const filteredPlaybooks = useMemo(() => {
    let filtered = playbooks;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.actionKey.toLowerCase().includes(q) ||
          p.actions.some(
            (a) =>
              a.reason.toLowerCase().includes(q) ||
              a.ip.toLowerCase().includes(q) ||
              (a.device_id?.toLowerCase().includes(q) ?? false),
          ) ||
          p.relatedAlerts.some(
            (a) =>
              a.rule.toLowerCase().includes(q) ||
              a.notes?.toLowerCase().includes(q) ||
              a.id.toLowerCase().includes(q),
          ),
      );
    }

    return filtered;
  }, [search, selectedCategory, playbooks]);

  const stats = useMemo(() => {
    const closed = dashboardAlerts.filter((a) => a.status === 'Closed').length;
    return {
      playbooks: playbooks.length,
      alerts: dashboardAlerts.length,
      closed,
      actionRuns: remoteActions.length,
    };
  }, [playbooks, dashboardAlerts, remoteActions]);

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

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'done') return 'bg-[#A7F3D0]/20 text-[#A7F3D0]';
    if (s === 'triggered') return 'bg-[#FFD966]/20 text-[#FFD966]';
    if (s === 'failed') return 'bg-[#FF6B6B]/20 text-[#FF6B6B]';
    return 'bg-[#98A0AC]/20 text-[#98A0AC]';
  };

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader
          title="Playbooks"
          subtitle={
            isLoading
              ? 'Loading automated actions + dashboard alerts…'
              : loadError
                ? 'API unavailable'
                : 'Playbook names from /automated-actions • Details from /alerts'
          }
        />
      </div>

      {loadError && (
        <div className="flex-shrink-0 mb-3 p-3 rounded-lg bg-[#FF6B6B]/10 border border-[#FF6B6B]/25 text-sm text-[#E6EEF6]">
          {loadError}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              void loadData();
            }}
            className="ml-3 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-[#A7EA3B]" size={20} />
              <div className="text-[#98A0AC] text-sm">Playbooks (action types)</div>
            </div>
            <div className="text-3xl">{isLoading ? '—' : stats.playbooks}</div>
          </div>

          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-[#FF6B6B]" size={20} />
              <div className="text-[#98A0AC] text-sm">Dashboard alerts</div>
            </div>
            <div className="text-3xl">{isLoading ? '—' : stats.alerts}</div>
          </div>

          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-[#64D16C]" size={20} />
              <div className="text-[#98A0AC] text-sm">Closed alerts</div>
            </div>
            <div className="text-3xl">{isLoading ? '—' : stats.closed}</div>
          </div>

          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-[#A7EA3B]" size={20} />
              <div className="text-[#98A0AC] text-sm">Action runs</div>
            </div>
            <div className="text-3xl">{isLoading ? '—' : stats.actionRuns}</div>
          </div>
        </div>

        <div className="bg-[#19232C] rounded-xl p-5">
          <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 bg-[#151C26] px-4 py-2 rounded-lg text-[#98A0AC]">
                <Search size={16} className="opacity-80" />
                <input
                  type="text"
                  placeholder="Search playbooks, IPs, reasons, alerts…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-0 outline-none text-[#E6EEF6] w-56 min-w-[200px]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  void loadData();
                }}
                disabled={isLoading}
                className="px-3 py-2 rounded-lg border border-white/[0.06] text-[#98A0AC] text-sm hover:bg-white/[0.04] disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
            <div className="relative" ref={categoryMenuRef}>
              <button
                type="button"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="bg-[#151C26] px-4 py-2 rounded-lg text-[#98A0AC] text-sm cursor-pointer hover:bg-[#1a2230] transition-colors border border-white/[0.03] flex items-center gap-2"
              >
                <span>{selectedCategory}</span>
                {selectedCategory !== 'All' && (
                  <span className="bg-[#A7EA3B]/20 text-[#A7EA3B] px-2 py-0.5 rounded text-xs">
                    {filteredPlaybooks.length}
                  </span>
                )}
                <span>▾</span>
              </button>
              {showCategoryMenu && (
                <div className="absolute right-0 mt-2 bg-[#19232C] rounded-lg border border-white/[0.03] shadow-lg z-10 min-w-[200px] overflow-hidden">
                  {categories.map((category) => {
                    const count =
                      category === 'All'
                        ? playbooks.length
                        : playbooks.filter((p) => p.category === category).length;
                    return (
                      <div
                        key={category}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryMenu(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedCategory(category);
                            setShowCategoryMenu(false);
                          }
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                          selectedCategory === category
                            ? 'bg-[#A7EA3B]/10 text-[#A7EA3B]'
                            : 'text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6]'
                        }`}
                      >
                        <span>{category}</span>
                        <span
                          className={`text-xs ${
                            selectedCategory === category ? 'text-[#A7EA3B]' : 'text-[#98A0AC]'
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {(search || selectedCategory !== 'All') && (
            <div className="mb-3 text-sm text-[#98A0AC] flex items-center justify-between">
              <span>
                Showing{' '}
                <span className="text-[#A7EA3B]">{filteredPlaybooks.length}</span> playbook
                {filteredPlaybooks.length !== 1 ? 's' : ''}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="text-[#A7EA3B] text-xs hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="space-y-4">
            {isLoading && playbooks.length === 0 ? (
              <div className="text-center text-[#98A0AC] py-8">Loading…</div>
            ) : (
              filteredPlaybooks.map((playbook) => (
                <div
                  key={playbook.actionKey}
                  className="bg-gradient-to-r from-white/[0.01] to-transparent border border-white/[0.03] rounded-lg p-5 hover:border-[#A7EA3B]/[0.2] transition-all"
                >
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg m-0 text-[#A7EA3B]">{playbook.title}</h3>
                        <span className="text-xs bg-[#A7EA3B]/10 text-[#A7EA3B] px-2 py-1 rounded border border-[#A7EA3B]/20">
                          {playbook.category}
                        </span>
                        <code className="text-[10px] text-[#98A0AC] font-mono truncate max-w-[200px]">
                          {playbook.actionKey}
                        </code>
                      </div>
                      <div className="text-[#98A0AC] text-sm">
                        {playbook.actions.length} run{playbook.actions.length !== 1 ? 's' : ''} from
                        automated actions • {playbook.relatedAlerts.length} linked dashboard alert
                        {playbook.relatedAlerts.length !== 1 ? 's' : ''}{' '}
                        <span className="text-[#98A0AC]/80">(via alert_id)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPlaybook(
                          selectedPlaybook?.actionKey === playbook.actionKey ? null : playbook,
                        )
                      }
                      className="px-4 py-2 rounded-lg border border-[#A7EA3B]/30 text-[#A7EA3B] hover:bg-[#A7EA3B]/5 transition-colors text-sm whitespace-nowrap shrink-0"
                    >
                      {selectedPlaybook?.actionKey === playbook.actionKey
                        ? 'Hide Details'
                        : 'View Details'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                      <div className="text-[#98A0AC] text-xs mb-1">Done</div>
                      <div className="text-xl text-[#A7F3D0]">
                        {playbook.actions.filter((a) => a.status === 'done').length}
                      </div>
                    </div>
                    <div className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                      <div className="text-[#98A0AC] text-xs mb-1">Triggered</div>
                      <div className="text-xl text-[#FFD966]">
                        {playbook.actions.filter((a) => a.status === 'triggered').length}
                      </div>
                    </div>
                    <div className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                      <div className="text-[#98A0AC] text-xs mb-1">Unique IPs</div>
                      <div className="text-xl text-[#E6EEF6]">
                        {new Set(playbook.actions.map((a) => a.ip)).size}
                      </div>
                    </div>
                    <div className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                      <div className="text-[#98A0AC] text-xs mb-1">Linked alerts</div>
                      <div className="text-xl text-[#60A5FA]">{playbook.relatedAlerts.length}</div>
                    </div>
                  </div>

                  {selectedPlaybook?.actionKey === playbook.actionKey && (
                    <div className="border-t border-white/[0.05] pt-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="text-[#A7EA3B]" size={16} />
                          <h4 className="text-sm m-0 text-[#A7EA3B]">
                            Automated action runs ({playbook.actions.length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {playbook.actions.slice(0, 12).map((a) => (
                            <div
                              key={a.id}
                              className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03] text-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${statusBadge(a.status)}`}>
                                  {a.status}
                                </span>
                                <span className="text-[#98A0AC] text-xs font-mono">{a.created_at}</span>
                              </div>
                              <div className="text-[#E6EEF6]">{a.reason}</div>
                              <div className="text-[#98A0AC] text-xs mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                <span>
                                  IP: <span className="font-mono text-[#E6EEF6]">{a.ip}</span>
                                </span>
                                <span>
                                  device:{' '}
                                  <span className="font-mono text-[#E6EEF6]">{a.device_id}</span>
                                </span>
                                {a.alert_id && (
                                  <span>
                                    alert_id:{' '}
                                    <span className="font-mono text-[#A7EA3B]">{a.alert_id}</span>
                                  </span>
                                )}
                              </div>
                              {a.enforcement?.message && (
                                <div className="text-xs text-[#98A0AC] mt-2 border-t border-white/[0.05] pt-2">
                                  {a.enforcement.message}
                                </div>
                              )}
                            </div>
                          ))}
                          {playbook.actions.length > 12 && (
                            <div className="text-xs text-[#98A0AC]">
                              +{playbook.actions.length - 12} more runs not shown
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="text-[#A7EA3B]" size={16} />
                          <h4 className="text-sm m-0 text-[#A7EA3B]">
                            Dashboard alert details ({playbook.relatedAlerts.length})
                          </h4>
                        </div>
                        {playbook.relatedAlerts.length === 0 ? (
                          <p className="text-[#98A0AC] text-sm">
                            No dashboard alerts linked (no matching <code className="text-xs">alert_id</code>{' '}
                            on these runs, or alert not in current <code className="text-xs">/alerts</code>{' '}
                            response).
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {playbook.relatedAlerts.map((alert) => (
                              <div
                                key={alert.id}
                                className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]"
                              >
                                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#98A0AC] text-xs font-mono">#{alert.id}</span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(alert.severity)}`}
                                    >
                                      {alert.severity}
                                    </span>
                                    <span className="text-[#98A0AC] text-xs">{alert.status}</span>
                                  </div>
                                  <span className="text-[#98A0AC] text-xs">{alert.date}</span>
                                </div>
                                <div className="text-sm text-[#E6EEF6] font-medium mb-2">{alert.rule}</div>
                                <div className="text-xs text-[#98A0AC] whitespace-pre-wrap leading-relaxed">
                                  {alert.notes}
                                </div>
                                {(alert.sourceIP || alert.true_positive_count != null) && (
                                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#98A0AC]">
                                    {alert.sourceIP && (
                                      <span>
                                        IP: <span className="font-mono text-[#E6EEF6]">{alert.sourceIP}</span>
                                      </span>
                                    )}
                                    {alert.true_positive_count != null && (
                                      <span>TP: {alert.true_positive_count}</span>
                                    )}
                                    {alert.false_positive_count != null && (
                                      <span>FP: {alert.false_positive_count}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="text-[#A7EA3B]" size={16} />
                          <h4 className="text-sm m-0 text-[#A7EA3B]">Detection titles (from alerts)</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {playbook.relatedAlerts.length === 0 ? (
                            <span className="text-[#98A0AC] text-xs">—</span>
                          ) : (
                            [...new Set(playbook.relatedAlerts.map((a) => a.rule))].map((rule) => (
                              <span
                                key={rule}
                                className="text-xs bg-[#0F1722] text-[#E6EEF6] px-3 py-1.5 rounded border border-white/[0.03]"
                              >
                                {rule}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {!isLoading && filteredPlaybooks.length === 0 && (
              <div className="text-center text-[#98A0AC] py-8">
                No playbooks yet. Load data from <code className="text-xs">/automated-actions</code> and{' '}
                <code className="text-xs">/alerts</code>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
