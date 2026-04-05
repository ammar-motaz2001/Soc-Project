import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { useSOC } from '../context/SOCContext';
import type { AutomatedAction } from '../context/SOCContext';
import PageHeader from '../components/PageHeader';
import ActionReportModal from '../components/ActionReportModal';
import ErrorBoundary from '../components/ErrorBoundary';
import { toast } from 'sonner@2.0.3';
import { getAutomatedActionsList } from '../apiClient';
import { mapRemoteAutomatedActionToAutomatedAction } from '../utils/mapRemoteAutomatedAction';
import { 
  Zap, CheckCircle, XCircle, Clock, Filter, Shield, Terminal, 
  Mail, Lock, AlertTriangle, Activity, ChevronDown, 
  ChevronRight, Server, User, FileText, ExternalLink, TrendingUp,
  Eye, Download, Search, Calendar, Play, ChevronUp
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function AutomatedActions() {
  const { simulateAlert } = useSOC();
  const [automatedActions, setAutomatedActions] = useState<AutomatedAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Success' | 'Failed' | 'Pending' | 'Partial Success'>('All');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Containment' | 'Investigation' | 'Notification' | 'Remediation'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<AutomatedAction | null>(null);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  const loadAutomatedActions = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await getAutomatedActionsList();
      const mapped = (data.automated_actions ?? [])
        .map(mapRemoteAutomatedActionToAutomatedAction)
        .sort(
          (a, b) =>
            new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime(),
        );
      setAutomatedActions(mapped);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load automated actions';
      setLoadError(message);
      toast.error('Could not load automated actions', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAutomatedActions();
  }, [loadAutomatedActions]);

  useEffect(() => {
    if (!isLiveMonitoring) return;
    const id = window.setInterval(() => {
      void loadAutomatedActions();
    }, 10000);
    return () => window.clearInterval(id);
  }, [isLiveMonitoring, loadAutomatedActions]);

  // Close simulate menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSimulateMenu && !target.closest('.simulate-menu-container')) {
        setShowSimulateMenu(false);
      }
    };

    if (showSimulateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSimulateMenu]);

  const filteredActions = automatedActions.filter(action => {
    const statusMatch = filterStatus === 'All' || action.status === filterStatus;
    const categoryMatch = filterCategory === 'All' || action.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === '' ||
      action.actionType.toLowerCase().includes(q) ||
      action.alertRule.toLowerCase().includes(q) ||
      action.alertId.toLowerCase().includes(q) ||
      action.details.toLowerCase().includes(q) ||
      (action.affectedAssets ?? []).some((asset) => asset.toLowerCase().includes(q));
    
    return statusMatch && categoryMatch && searchMatch;
  });

  const stats = {
    total: automatedActions.length,
    success: automatedActions.filter(a => a.status === 'Success').length,
    failed: automatedActions.filter(a => a.status === 'Failed').length,
    pending: automatedActions.filter(a => a.status === 'Pending').length,
    partial: automatedActions.filter(a => a.status === 'Partial Success').length,
  };

  // Chart data
  const categoryData = [
    { name: 'Containment', value: automatedActions.filter(a => a.category === 'Containment').length, color: '#FF6B6B' },
    { name: 'Investigation', value: automatedActions.filter(a => a.category === 'Investigation').length, color: '#60A5FA' },
    { name: 'Notification', value: automatedActions.filter(a => a.category === 'Notification').length, color: '#FFD966' },
    { name: 'Remediation', value: automatedActions.filter(a => a.category === 'Remediation').length, color: '#A7F3D0' }
  ];

  const successRateData = [
    { name: 'Success', value: stats.success, color: '#A7F3D0' },
    { name: 'Pending', value: stats.pending, color: '#FFD966' },
    { name: 'Failed', value: stats.failed, color: '#FF6B6B' },
    { name: 'Partial', value: stats.partial, color: '#60A5FA' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-[#A7F3D0] text-[#0b3c2a]';
      case 'Failed': return 'bg-[#FF6B6B] text-[#3a0b0b]';
      case 'Pending': return 'bg-[#FFD966] text-[#1f1a00]';
      case 'Partial Success': return 'bg-[#60A5FA] text-[#07213a]';
      default: return 'bg-[#98A0AC] text-[#0F1722]';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Containment': return 'text-[#FF6B6B]';
      case 'Investigation': return 'text-[#60A5FA]';
      case 'Notification': return 'text-[#FFD966]';
      case 'Remediation': return 'text-[#A7F3D0]';
      default: return 'text-[#98A0AC]';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Containment': return <Shield size={16} />;
      case 'Investigation': return <Search size={16} />;
      case 'Notification': return <Mail size={16} />;
      case 'Remediation': return <Lock size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return <CheckCircle size={16} />;
      case 'Failed': return <XCircle size={16} />;
      case 'Pending': return <Clock size={16} />;
      case 'Partial Success': return <AlertTriangle size={16} />;
      default: return null;
    }
  };

  const toggleRowExpansion = (actionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedRows(newExpanded);
  };

  // Export to CSV function
  const handleExportCSV = () => {
    const csvHeaders = ['Alert ID', 'Action Type', 'Category', 'Status', 'Duration', 'Executed At', 'Playbook'];
    const csvRows = filteredActions.map(action => [
      action.alertId,
      action.actionType,
      action.category,
      action.status,
      action.duration,
      action.executedAt,
      action.playbookUsed || '-'
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `automated_actions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Export Successful', {
      description: `Exported ${filteredActions.length} automated actions to CSV file`
    });
  };

  // Live Monitor function
  const handleLiveMonitor = () => {
    if (isLiveMonitoring) {
      toast.success('Live Monitor Stopped', {
        description: 'Real-time monitoring has been deactivated'
      });
      setIsLiveMonitoring(false);
    } else {
      toast.info('Live Monitor Activated', {
        description: 'Monitoring automated actions in real-time. You will receive notifications for new executions.',
        duration: 5000,
        action: {
          label: 'Stop Monitoring',
          onClick: () => {
            toast.success('Live Monitor Stopped', {
              description: 'Real-time monitoring has been deactivated'
            });
            setIsLiveMonitoring(false);
          }
        }
      });
      setIsLiveMonitoring(true);
    }
  };

  const prevCountRef = React.useRef(0);
  useEffect(() => {
    if (!isLiveMonitoring) {
      prevCountRef.current = automatedActions.length;
      return;
    }
    if (automatedActions.length > prevCountRef.current && prevCountRef.current > 0) {
      const newest = automatedActions[0];
      toast.info(
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex-1">
            <div className="font-medium text-[#E6EEF6]">New automated action</div>
            <div className="text-xs text-[#98A0AC] mt-1">
              {newest.actionType} — {newest.status}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAction(newest);
              toast.dismiss();
            }}
            className="px-3 py-1.5 bg-[#A7EA3B] text-[#0F1722] rounded-lg text-xs font-medium hover:bg-[#98d932] transition-colors shrink-0"
          >
            View
          </button>
        </div>,
        {
          duration: 8000,
          style: {
            background: '#19232C',
            border: '1px solid rgba(167, 234, 59, 0.2)',
            color: '#E6EEF6',
          },
        },
      );
    }
    prevCountRef.current = automatedActions.length;
  }, [automatedActions, isLiveMonitoring]);

  return (
    <div className="pb-6">
      <PageHeader
        title="Automated Actions"
        subtitle={
          isLoading
            ? 'Loading from API…'
            : loadError
              ? 'Automated actions API unavailable'
              : undefined
        }
      />

      {loadError && (
        <div className="mt-3 p-3 rounded-[10px] bg-[#FF6B6B]/10 border border-[#FF6B6B]/25 text-sm text-[#E6EEF6]">
          {loadError}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              void loadAutomatedActions();
            }}
            className="ml-3 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Enhanced Statistics Grid */}
      <section className="mt-[18px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#19232C] rounded-[10px] p-4 border border-white/[0.03] hover:border-[#A7EA3B]/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[#98A0AC] text-xs">Total Actions</div>
            <Zap size={18} className="text-[#A7EA3B]" />
          </div>
          <div className="text-2xl text-[#E6EEF6]">{stats.total}</div>
          <div className="text-[#98A0AC] text-xs mt-1">All time</div>
        </div>

        <div className="bg-[#19232C] rounded-[10px] p-4 border border-white/[0.03] hover:border-[#A7F3D0]/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[#98A0AC] text-xs">Successful</div>
            <CheckCircle size={18} className="text-[#A7F3D0]" />
          </div>
          <div className="text-2xl text-[#A7F3D0]">{stats.success}</div>
          <div className="text-[#98A0AC] text-xs mt-1">
            {stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}% success rate
          </div>
        </div>

        <div className="bg-[#19232C] rounded-[10px] p-4 border border-white/[0.03] hover:border-[#FFD966]/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[#98A0AC] text-xs">Pending</div>
            <Clock size={18} className="text-[#FFD966]" />
          </div>
          <div className="text-2xl text-[#FFD966]">{stats.pending}</div>
          <div className="text-[#98A0AC] text-xs mt-1">In progress</div>
        </div>

        <div className="bg-[#19232C] rounded-[10px] p-4 border border-white/[0.03] hover:border-[#FF6B6B]/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[#98A0AC] text-xs">Failed</div>
            <XCircle size={18} className="text-[#FF6B6B]" />
          </div>
          <div className="text-2xl text-[#FF6B6B]">{stats.failed}</div>
          <div className="text-[#98A0AC] text-xs mt-1">Needs attention</div>
        </div>
      </section>

      {/* Analytics Charts */}
      <section className="mt-[18px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Action Categories Distribution */}
        <div className="bg-[#19232C] rounded-[10px] p-[18px] border border-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#A7EA3B]" />
              Actions by Category
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#19232C',
                  border: '1px solid rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  color: '#E6EEF6'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }}></div>
                <span className="text-sm text-[#98A0AC]">{cat.name}: {cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate Distribution */}
        <div className="bg-[#19232C] rounded-[10px] p-[18px] border border-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 flex items-center gap-2">
              <Activity size={20} className="text-[#A7EA3B]" />
              Execution Status
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="#98A0AC" style={{ fontSize: '12px' }} />
              <YAxis stroke="#98A0AC" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#19232C',
                  border: '1px solid rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  color: '#E6EEF6'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {successRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Actions Table with Advanced Filters */}
      <section className="mt-[18px]">
        <div className="bg-[#19232C] rounded-[10px] p-[18px] border border-white/[0.03]">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="m-0 flex items-center gap-2">
              <Terminal size={20} className="text-[#A7EA3B]" />
              Automated Actions Execution Log
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  void loadAutomatedActions();
                }}
                disabled={isLoading}
                className="px-3 py-2 bg-[#0F1722] text-[#E6EEF6] rounded-lg border border-white/[0.03] text-sm hover:border-[#A7EA3B]/30 transition-colors disabled:opacity-50"
              >
                Refresh
              </button>
              <button 
                onClick={handleExportCSV}
                className="px-3 py-2 bg-[#0F1722] text-[#E6EEF6] rounded-lg border border-white/[0.03] text-sm hover:border-[#A7EA3B]/30 transition-colors flex items-center gap-2"
              >
                <Download size={14} />
                Export
              </button>
              <button 
                onClick={handleLiveMonitor}
                className="px-3 py-2 bg-[#0F1722] text-[#E6EEF6] rounded-lg border border-white/[0.03] text-sm hover:border-[#A7EA3B]/30 transition-colors flex items-center gap-2"
              >
                <Eye size={14} />
                Live Monitor
              </button>
              <div className="relative simulate-menu-container">
                <button 
                  onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                  className="px-3 py-2 bg-[#A7EA3B] text-[#0F1722] rounded-lg text-sm hover:bg-[#98d932] transition-colors flex items-center gap-2"
                >
                  <Zap size={14} />
                  Simulate Alert
                </button>
                {showSimulateMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-[#19232C] rounded-lg border border-white/[0.1] shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        simulateAlert('Critical');
                        setShowSimulateMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#E6EEF6] hover:bg-[#FF6B6B]/20 transition-colors flex items-center gap-2 border-b border-white/[0.05]"
                    >
                      <div className="w-2 h-2 bg-[#FF6B6B] rounded-full"></div>
                      Critical Alert
                    </button>
                    <button
                      onClick={() => {
                        simulateAlert('High');
                        setShowSimulateMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#E6EEF6] hover:bg-[#FFD966]/20 transition-colors flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-[#FFD966] rounded-full"></div>
                      High Alert
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 p-4 bg-[#0F1722] rounded-lg border border-white/[0.03]">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-[#98A0AC]" />
              <input
                type="text"
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-[#19232C] text-[#E6EEF6] px-3 py-2 rounded-lg border border-white/[0.03] text-sm outline-none focus:border-[#A7EA3B]/30"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#98A0AC]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 bg-[#19232C] text-[#E6EEF6] px-3 py-2 rounded-lg border border-white/[0.03] text-sm outline-none focus:border-[#A7EA3B]/30"
              >
                <option value="All">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Partial Success">Partial Success</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#98A0AC]" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="flex-1 bg-[#19232C] text-[#E6EEF6] px-3 py-2 rounded-lg border border-white/[0.03] text-sm outline-none focus:border-[#A7EA3B]/30"
              >
                <option value="All">All Categories</option>
                <option value="Containment">Containment</option>
                <option value="Investigation">Investigation</option>
                <option value="Notification">Notification</option>
                <option value="Remediation">Remediation</option>
              </select>
            </div>
          </div>

          <div className="text-[#98A0AC] mb-4 text-sm flex items-center justify-between">
            <span>
              Showing {filteredActions.length} of {automatedActions.length} automated actions
            </span>
            <span className="text-[#A7EA3B]">
              {stats.success} successful • {stats.pending} pending • {stats.failed} failed
            </span>
          </div>

          {/* Scrollable Table Container */}
          <div className="bg-[#19232C] rounded-[10px] border border-white/[0.03] overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="bg-[#0f1a22] sticky top-0 z-10">
                  <tr>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[40px]"></th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[90px]">Alert ID</th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm">Action Type</th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[110px]">Category</th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[130px]">Status</th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm w-[90px]">Duration</th>
                    <th className="px-3.5 py-3 text-left text-[#98A0AC] text-sm">Playbook</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && automatedActions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3.5 py-7 text-center text-[#98A0AC]">
                        Loading…
                      </td>
                    </tr>
                  ) : filteredActions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3.5 py-7 text-center text-[#98A0AC]">
                        No automated actions found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredActions.map((action) => {
                      const isExpanded = expandedRows.has(action.id);
                      const mainRow = (
                        <tr
                          key={action.id}
                          className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-3.5 py-3">
                            <button
                              onClick={() => toggleRowExpansion(action.id)}
                              className="text-[#98A0AC] hover:text-[#A7EA3B] transition-colors"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          </td>
                          <td className="px-3.5 py-3 text-[#98A0AC] text-sm">
                            <code className="bg-[#0F1722] px-2 py-1 rounded text-xs">{action.alertId}</code>
                          </td>
                          <td className="px-3.5 py-3 text-[#E6EEF6] text-sm">
                            <div className="flex items-center gap-2">
                              <Zap size={14} className="text-[#A7EA3B]" />
                              <span className="hover:text-[#A7EA3B] cursor-pointer transition-colors">
                                {action.actionType}
                              </span>
                            </div>
                          </td>
                          <td className="px-3.5 py-3 text-sm">
                            <span className={`flex items-center gap-1.5 ${getCategoryColor(action.category)}`}>
                              {getCategoryIcon(action.category)}
                              {action.category}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-sm">
                            <span
                              className={`px-2 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 ${getStatusColor(
                                action.status
                              )}`}
                            >
                              {getStatusIcon(action.status)}
                              {action.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-[#98A0AC] text-sm">
                            <code className="text-xs">{action.duration}</code>
                          </td>
                          <td className="px-3.5 py-3 text-[#98A0AC] text-sm">
                            <div className="flex items-center gap-1.5">
                              <FileText size={12} className="text-[#60A5FA]" />
                              {action.playbookUsed || '-'}
                            </div>
                          </td>
                        </tr>
                      );

                      const detailsRow = isExpanded ? (
                        <tr key={`${action.id}-details`} className="bg-[#0F1722] border-b border-white/[0.02]">
                          <td colSpan={7} className="px-3.5 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Left Column - Details */}
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[#98A0AC] text-xs mb-1">Alert Rule</div>
                                  <div className="text-[#E6EEF6] text-sm">{action.alertRule}</div>
                                </div>
                                
                                <div>
                                  <div className="text-[#98A0AC] text-xs mb-1">Description</div>
                                  <div className="text-[#E6EEF6] text-sm">{action.details}</div>
                                </div>

                                {action.errorMessage && (
                                  <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-[#FF6B6B] text-sm">
                                      <AlertTriangle size={14} />
                                      <span>{action.errorMessage}</span>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <div className="text-[#98A0AC] text-xs mb-2">Affected Assets</div>
                                  <div className="flex flex-wrap gap-2">
                                    {(action.affectedAssets ?? []).map((asset, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-[#19232C] rounded text-xs text-[#E6EEF6] border border-white/[0.03]"
                                      >
                                        <Server size={10} className="inline mr-1" />
                                        {asset}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-[#98A0AC] text-xs mb-1">Triggered By</div>
                                    <div className="text-[#E6EEF6] text-sm flex items-center gap-1.5">
                                      <User size={12} />
                                      {action.triggeredBy}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[#98A0AC] text-xs mb-1">Data Processed</div>
                                    <div className="text-[#E6EEF6] text-sm">{action.dataProcessed}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column - Execution Steps */}
                              <div>
                                <div className="text-[#98A0AC] text-xs mb-2">Execution Timeline</div>
                                <div className="space-y-2">
                                  {(action.executionSteps ?? []).map((step, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-3 p-2 bg-[#19232C] rounded-lg border border-white/[0.03]"
                                    >
                                      <div className="mt-1">
                                        {step.status === 'completed' && (
                                          <CheckCircle size={14} className="text-[#A7F3D0]" />
                                        )}
                                        {step.status === 'failed' && (
                                          <XCircle size={14} className="text-[#FF6B6B]" />
                                        )}
                                        {step.status === 'pending' && (
                                          <Clock size={14} className="text-[#FFD966]" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-[#E6EEF6] text-sm">{step.step}</div>
                                        <div className="text-[#98A0AC] text-xs mt-0.5">{step.details}</div>
                                        <div className="text-[#98A0AC] text-xs mt-1">
                                          <code>{step.duration}</code>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between">
                              <div className="text-[#98A0AC] text-xs flex items-center gap-2">
                                <Calendar size={12} />
                                Executed: {action.executedAt}
                              </div>
                              <button 
                                onClick={() => setSelectedAction(action)}
                                className="text-[#A7EA3B] text-sm hover:text-[#A7EA3B]/80 transition-colors flex items-center gap-1.5"
                              >
                                <ExternalLink size={14} />
                                View Full Report
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : null;

                      return [mainRow, detailsRow];
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend and Info */}
          {filteredActions.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0F1722] rounded-lg border border-white/[0.03]">
                <div className="text-[#E6EEF6] text-sm mb-2">💡 Quick Tips</div>
                <ul className="text-[#98A0AC] text-xs space-y-1.5 list-disc list-inside">
                  <li>Click on any row to expand and view detailed execution steps</li>
                  <li>Use filters to focus on specific action types or statuses</li>
                  <li>Export logs for compliance and audit purposes</li>
                  <li>Live Monitor shows real-time action execution</li>
                </ul>
              </div>

              <div className="p-4 bg-[#0F1722] rounded-lg border border-white/[0.03]">
                <div className="text-[#E6EEF6] text-sm mb-2">📊 Performance Metrics</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-[#98A0AC]">Success Rate:</div>
                  <div className="text-[#A7F3D0]">
                    {stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-[#98A0AC]">Actions/Hour:</div>
                  <div className="text-[#E6EEF6]">{(stats.total / 24).toFixed(1)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Action Report Modal */}
      <ErrorBoundary>
        <ActionReportModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
        />
      </ErrorBoundary>
    </div>
  );
}