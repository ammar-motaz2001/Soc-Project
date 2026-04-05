import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, BookOpen, AlertTriangle, CheckCircle, TrendingUp, FileText, Clock, Target } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useSOC } from '../context/SOCContext';

export default function Playbooks() {
  const { state } = useSOC();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<any>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Generate dynamic playbooks from actual alerts and cases
  const playbooks = useMemo(() => {
    const playbookMap = new Map<string, any>();

    // Process all alerts to create playbooks
    state.alerts.forEach(alert => {
      const type = alert.type;
      const key = type;

      if (!playbookMap.has(key)) {
        playbookMap.set(key, {
          title: type,
          category: type,
          totalAlerts: 0,
          criticalCount: 0,
          highCount: 0,
          resolvedCount: 0,
          truePositives: 0,
          falsePositives: 0,
          commonSources: new Set<string>(),
          commonDestinations: new Set<string>(),
          affectedHosts: new Set<string>(),
          avgTimeToResolve: [] as number[],
          detectionRules: new Set<string>(),
          recommendations: new Set<string>(),
          mitreTechniques: new Set<string>(),
          lastSeen: alert.date,
          examples: [] as any[]
        });
      }

      const playbook = playbookMap.get(key)!;
      playbook.totalAlerts++;
      
      if (alert.severity === 'Critical') playbook.criticalCount++;
      if (alert.severity === 'High') playbook.highCount++;
      
      if (alert.status === 'Closed') playbook.resolvedCount++;
      
      playbook.detectionRules.add(alert.rule);

      // Add technical details
      if (alert.sourceIP) playbook.commonSources.add(alert.sourceIP);
      if (alert.destinationIP) playbook.commonDestinations.add(alert.destinationIP);
      if (alert.hostname) playbook.affectedHosts.add(alert.hostname);
      if (alert.mitreTechniques) {
        alert.mitreTechniques.forEach(tech => playbook.mitreTechniques.add(tech));
      }

      // Store examples (max 3 per playbook)
      if (playbook.examples.length < 3) {
        playbook.examples.push({
          id: alert.id,
          rule: alert.rule,
          severity: alert.severity,
          date: alert.date,
          sourceIP: alert.sourceIP,
          destinationIP: alert.destinationIP,
          details: alert
        });
      }
    });

    // Process cases to add resolution data
    state.cases.forEach(caseItem => {
      const key = caseItem.type;
      if (playbookMap.has(key)) {
        const playbook = playbookMap.get(key)!;
        
        if (caseItem.resolution === 'True Positive') playbook.truePositives++;
        if (caseItem.resolution === 'False Positive') playbook.falsePositives++;

        // Extract time to resolve (convert format like "2h 15m" to minutes)
        const timeMatch = caseItem.timeToResolve.match(/(\d+)h\s*(\d+)m/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          playbook.avgTimeToResolve.push(hours * 60 + minutes);
        }

        // Add recommendations from cases
        if (caseItem.recommendation) {
          playbook.recommendations.add(caseItem.recommendation);
        }
      }
    });

    return Array.from(playbookMap.values()).sort((a, b) => b.totalAlerts - a.totalAlerts);
  }, [state.alerts, state.cases]);

  // Get unique categories
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(playbooks.map(p => p.category)))];
  }, [playbooks]);

  // Close dropdown when clicking outside
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

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower) ||
          Array.from(p.detectionRules).some((rule: any) => rule.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [search, selectedCategory, playbooks]);

  const calculateAvgTime = (times: number[]) => {
    if (times.length === 0) return 'N/A';
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const hours = Math.floor(avg / 60);
    const minutes = Math.floor(avg % 60);
    return `${hours}h ${minutes}m`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-[#FF6B6B] text-[#3a0b0b]';
      case 'High': return 'bg-[#FFD966] text-[#1f1a00]';
      case 'Medium': return 'bg-[#60A5FA] text-[#07213a]';
      case 'Low': return 'bg-[#A7F3D0] text-[#0b3c2a]';
      default: return 'bg-[#98A0AC] text-[#0F1722]';
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader 
          title="Playbooks" 
          subtitle="Dynamic incident response procedures learned from real security alerts and cases"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-[#A7EA3B]" size={20} />
              <div className="text-[#98A0AC] text-sm">Total Playbooks</div>
            </div>
            <div className="text-3xl">{playbooks.length}</div>
          </div>

          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="text-[#FF6B6B]" size={20} />
              <div className="text-[#98A0AC] text-sm">Total Alerts Analyzed</div>
            </div>
            <div className="text-3xl">{state.alerts.length}</div>
          </div>

          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-[#64D16C]" size={20} />
              <div className="text-[#98A0AC] text-sm">Cases Resolved</div>
            </div>
            <div className="text-3xl">{state.cases.length}</div>
          </div>

          <div className="bg-[#19232C] rounded-lg p-5 border border-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-[#A7EA3B]" size={20} />
              <div className="text-[#98A0AC] text-sm">Learning Sources</div>
            </div>
            <div className="text-3xl">{state.alerts.length + state.cases.length}</div>
          </div>
        </div>

        <div className="bg-[#19232C] rounded-xl p-5">
          <div className="flex justify-between items-center gap-3 mb-4">
            <div className="flex items-center gap-2.5 bg-[#151C26] px-4 py-2 rounded-lg text-[#98A0AC]">
              <Search size={16} className="opacity-80" />
              <input
                type="text"
                placeholder="Search playbooks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-0 outline-none text-[#E6EEF6] w-56"
              />
            </div>
            <div className="relative" ref={categoryMenuRef}>
              <button
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
                    const count = category === 'All' 
                      ? playbooks.length 
                      : playbooks.filter(p => p.category === category).length;
                    return (
                      <div
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryMenu(false);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                          selectedCategory === category
                            ? 'bg-[#A7EA3B]/10 text-[#A7EA3B]'
                            : 'text-[#98A0AC] hover:bg-white/[0.02] hover:text-[#E6EEF6]'
                        }`}
                      >
                        <span>{category}</span>
                        <span className={`text-xs ${
                          selectedCategory === category ? 'text-[#A7EA3B]' : 'text-[#98A0AC]'
                        }`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Results count */}
          {(search || selectedCategory !== 'All') && (
            <div className="mb-3 text-sm text-[#98A0AC] flex items-center justify-between">
              <span>
                Showing <span className="text-[#A7EA3B]">{filteredPlaybooks.length}</span> playbook{filteredPlaybooks.length !== 1 ? 's' : ''}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </span>
              {(search || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All');
                  }}
                  className="text-[#A7EA3B] text-xs hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          <div className="space-y-4">
            {filteredPlaybooks.map((playbook, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-white/[0.01] to-transparent border border-white/[0.03] rounded-lg p-5 hover:border-[#A7EA3B]/[0.2] transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg m-0 text-[#A7EA3B]">{playbook.title}</h3>
                      <span className="text-xs bg-[#A7EA3B]/10 text-[#A7EA3B] px-2 py-1 rounded border border-[#A7EA3B]/20">
                        {playbook.category}
                      </span>
                    </div>
                    <div className="text-[#98A0AC] text-sm">
                      Learned from {playbook.totalAlerts} alerts and {playbook.resolvedCount} resolved cases
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlaybook(selectedPlaybook?.title === playbook.title ? null : playbook)}
                    className="px-4 py-2 rounded-lg border border-[#A7EA3B]/30 text-[#A7EA3B] hover:bg-[#A7EA3B]/5 transition-colors text-sm whitespace-nowrap"
                  >
                    {selectedPlaybook?.title === playbook.title ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                    <div className="text-[#98A0AC] text-xs mb-1">Critical/High</div>
                    <div className="text-xl text-[#FF6B6B]">{playbook.criticalCount + playbook.highCount}</div>
                  </div>
                  <div className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                    <div className="text-[#98A0AC] text-xs mb-1">True Positives</div>
                    <div className="text-xl text-[#FFD966]">{playbook.truePositives}</div>
                  </div>
                  <div className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                    <div className="text-[#98A0AC] text-xs mb-1">False Positives</div>
                    <div className="text-xl text-[#64D16C]">{playbook.falsePositives}</div>
                  </div>
                  <div className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                    <div className="text-[#98A0AC] text-xs mb-1">Avg. Resolution Time</div>
                    <div className="text-xl">{calculateAvgTime(playbook.avgTimeToResolve)}</div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedPlaybook?.title === playbook.title && (
                  <div className="border-t border-white/[0.05] pt-4 space-y-4">
                    {/* Detection Rules */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="text-[#A7EA3B]" size={16} />
                        <h4 className="text-sm m-0 text-[#A7EA3B]">Detection Rules ({playbook.detectionRules.size})</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(playbook.detectionRules).slice(0, 5).map((rule: any, i: number) => (
                          <span key={i} className="text-xs bg-[#0F1722] text-[#E6EEF6] px-3 py-1.5 rounded border border-white/[0.03]">
                            {rule}
                          </span>
                        ))}
                        {playbook.detectionRules.size > 5 && (
                          <span className="text-xs text-[#98A0AC] px-3 py-1.5">
                            +{playbook.detectionRules.size - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MITRE ATT&CK Techniques */}
                    {playbook.mitreTechniques.size > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="text-[#A7EA3B]" size={16} />
                          <h4 className="text-sm m-0 text-[#A7EA3B]">MITRE ATT&CK Techniques</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(playbook.mitreTechniques).map((tech: any, i: number) => (
                            <span key={i} className="text-xs bg-[#FF6B6B]/10 text-[#FF6B6B] px-3 py-1.5 rounded border border-[#FF6B6B]/20">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Network Intelligence */}
                    {(playbook.commonSources.size > 0 || playbook.commonDestinations.size > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {playbook.commonSources.size > 0 && (
                          <div>
                            <div className="text-[#A7EA3B] text-xs mb-2">Common Source IPs</div>
                            <div className="space-y-1">
                              {Array.from(playbook.commonSources).slice(0, 3).map((ip: any, i: number) => (
                                <div key={i} className="text-xs bg-[#0F1722] text-[#E6EEF6] px-3 py-1.5 rounded border border-white/[0.03] font-mono">
                                  {ip}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {playbook.commonDestinations.size > 0 && (
                          <div>
                            <div className="text-[#A7EA3B] text-xs mb-2">Common Destination IPs</div>
                            <div className="space-y-1">
                              {Array.from(playbook.commonDestinations).slice(0, 3).map((ip: any, i: number) => (
                                <div key={i} className="text-xs bg-[#0F1722] text-[#E6EEF6] px-3 py-1.5 rounded border border-white/[0.03] font-mono">
                                  {ip}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recommendations */}
                    {playbook.recommendations.size > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="text-[#A7EA3B]" size={16} />
                          <h4 className="text-sm m-0 text-[#A7EA3B]">Analyst Recommendations</h4>
                        </div>
                        <div className="space-y-2">
                          {Array.from(playbook.recommendations).map((rec: any, i: number) => (
                            <div key={i} className="text-sm bg-[#0F1722] text-[#E6EEF6] px-4 py-2.5 rounded border border-white/[0.03] flex items-start gap-2">
                              <span className="text-[#A7EA3B] mt-0.5">•</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Example Cases */}
                    {playbook.examples.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="text-[#A7EA3B]" size={16} />
                          <h4 className="text-sm m-0 text-[#A7EA3B]">Recent Examples</h4>
                        </div>
                        <div className="space-y-2">
                          {playbook.examples.map((example: any, i: number) => (
                            <div key={i} className="bg-[#0F1722] rounded-lg p-3 border border-white/[0.03]">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#98A0AC] text-xs">#{example.id}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(example.severity)}`}>
                                    {example.severity}
                                  </span>
                                </div>
                                <span className="text-[#98A0AC] text-xs">{example.date}</span>
                              </div>
                              <div className="text-sm text-[#E6EEF6] mb-2">{example.rule}</div>
                              {(example.sourceIP || example.destinationIP) && (
                                <div className="flex items-center gap-2 text-xs text-[#98A0AC]">
                                  {example.sourceIP && <span className="font-mono">{example.sourceIP}</span>}
                                  {example.sourceIP && example.destinationIP && <span>→</span>}
                                  {example.destinationIP && <span className="font-mono">{example.destinationIP}</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredPlaybooks.length === 0 && (
              <div className="text-center text-[#98A0AC] py-8">
                No playbooks found. The system learns from alerts and cases automatically.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}