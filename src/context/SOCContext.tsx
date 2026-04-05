import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { toast } from 'sonner@2.0.3';
import { postAutomatedDetect, type RealtimeEvent } from '../apiClient';
import { useRealtimeEvents } from '../hooks/useRealtimeEvents';

export interface Alert {
  id: string;
  rule: string;
  severity: 'High' | 'Medium' | 'Low' | 'Critical';
  type: string;
  date: string;
  status: 'Open' | 'Closed';
  assigned: string | null;
  notes: string;
  // Network Information
  sourceIP?: string;
  destinationIP?: string;
  sourceMac?: string;
  destinationMac?: string;
  sourcePort?: string;
  destinationPort?: string;
  protocol?: string;
  // Endpoint Information
  hostname?: string;
  username?: string;
  processName?: string;
  processId?: string;
  parentProcess?: string;
  commandLine?: string;
  fileHash?: string;
  filePath?: string;
  // Email/Phishing Information
  senderEmail?: string;
  recipientEmail?: string;
  emailSubject?: string;
  attachmentHash?: string;
  // Threat Intelligence
  threatScore?: number;
  iocMatches?: string[];
  mitreTechniques?: string[];
  // Additional Context
  timestamp?: string;
  firstSeen?: string;
  lastSeen?: string;
  eventCount?: number;
  geoLocation?: string;
  reputation?: 'Malicious' | 'Suspicious' | 'Unknown' | 'Trusted';
  /** From dashboard alerts API (python-model-v8dl). */
  true_positive_count?: number;
  false_positive_count?: number;
}

export interface AutomatedAction {
  id: string;
  alertId: string;
  alertRule: string;
  actionType: string;
  category: 'Containment' | 'Investigation' | 'Notification' | 'Remediation';
  status: 'Success' | 'Failed' | 'Pending' | 'Partial Success';
  executedAt: string;
  completedAt?: string;
  duration: string;
  playbookUsed?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  details: string;
  executionSteps: Array<{
    step: string;
    status: 'completed' | 'failed' | 'pending';
    duration: string;
    details: string;
  }>;
  affectedAssets: string[];
  triggeredBy: string;
  apiCalls: number;
  dataProcessed: string;
  errorMessage?: string;
}

export interface Case {
  caseId: string;
  alertId: string;
  rule: string;
  severity: string;
  type: string;
  dateResolved: string;
  resolution: 'True Positive' | 'False Positive';
  analyst: string;
  originalDate: string;
  notes: string;
  actionsTaken: string[];
  findings: string;
  recommendation: string;
  timeToResolve: string;
  // Alert Details - Full alert information preserved
  alertDetails?: Alert;
}

interface SOCState {
  alerts: Alert[];
  cases: Case[];
  automatedActions: AutomatedAction[];
}

interface SOCContextType {
  state: SOCState;
  assignAlert: (id: string) => void;
  resolveAlert: (id: string, resolution: 'True Positive' | 'False Positive') => void;
  simulateAlert: (severity: 'Critical' | 'High') => void;
  getStats: () => {
    total: number;
    closed: number;
    truePositives: number;
    falsePositives: number;
    openAlerts: number;
  };
}

const STORAGE_KEY = 'soc_sim_data_v11';

/** Empty initial state – all data comes from localStorage. */
const emptyState: SOCState = {
  alerts: [],
  cases: [],
  automatedActions: [],
};

function getEventId(event: RealtimeEvent): string {
  if (typeof event.seq === 'number') {
    return `seq-${event.seq}`;
  }
  if (typeof event.timestamp === 'string') {
    return `ts-${event.timestamp}`;
  }
  return `raw-${JSON.stringify(event)}`;
}

/** WS events produced when the backend runs POST /detect (DDoS or brute-force paths). */
function isBackendDetectEvent(event: RealtimeEvent): boolean {
  const k = String(event.kind ?? '').toLowerCase();
  return k === 'ddos' || k === 'bruteforce';
}

function toastForDetectEvent(event: RealtimeEvent): void {
  const r = event as Record<string, unknown>;
  const attack = r.attack_detected === true;
  const attackType = String(r.attack_type ?? event.kind ?? 'Detection');
  const clientIp = typeof r.client_ip === 'string' ? r.client_ip : undefined;
  const title = attack ? `Detect: ${attackType}` : `Detect: benign (${attackType})`;
  const parts = [clientIp ? `Client: ${clientIp}` : null].filter(Boolean) as string[];
  const description =
    parts.length > 0 ? parts.join(' • ') : 'Classification from live API';

  if (attack) {
    toast.error(title, { description, duration: 6500 });
  } else {
    toast.info(title, { description, duration: 4500 });
  }
}

function toSeverity(value: unknown): Alert['severity'] {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'critical') return 'Critical';
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
}

function mapRealtimeEventToAlert(event: RealtimeEvent): Alert | null {
  const eventRecord = event as Record<string, unknown>;
  const eventKind = String(event.kind ?? eventRecord.event_type ?? '').toLowerCase();
  const shouldBeAlert =
    eventKind.includes('detect') ||
    eventKind.includes('alert') ||
    eventKind.includes('threat') ||
    eventRecord.alert === true;

  if (!shouldBeAlert) {
    return null;
  }

  const rule = String(
    eventRecord.rule ??
      eventRecord.title ??
      eventRecord.message ??
      eventRecord.description ??
      'Realtime SOC Event',
  );
  const timestampValue = String(event.timestamp ?? eventRecord.timestamp ?? new Date().toISOString());
  const sourceIP =
    typeof eventRecord.ip === 'string'
      ? eventRecord.ip
      : typeof eventRecord.source_ip === 'string'
        ? eventRecord.source_ip
        : undefined;

  return {
    id: String(event.seq ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    rule,
    severity: toSeverity(eventRecord.severity),
    type: String(eventRecord.type ?? 'Network'),
    date: new Date(timestampValue).toISOString().slice(0, 10),
    status: 'Open',
    assigned: null,
    notes: JSON.stringify(eventRecord).slice(0, 280),
    sourceIP,
    timestamp: timestampValue,
    firstSeen: timestampValue,
    lastSeen: timestampValue,
    eventCount: 1,
    reputation: 'Unknown',
  };
}

// Generate automated actions for Critical and High severity alerts
const generateAutomatedActionsForAlert = (alert: Alert): AutomatedAction[] => {
  // Only generate actions for Critical and High severity alerts
  if (alert.severity !== 'Critical' && alert.severity !== 'High') {
    return [];
  }

  const actions: AutomatedAction[] = [];
  const randomIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const hostname = `WS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const timestamp = new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  });

  // 1. Notification Action (Always first for Critical/High)
  actions.push({
    id: `${alert.id}-notify-${Date.now()}`,
    alertId: alert.id,
    alertRule: alert.rule,
    actionType: 'Security Alert Notification',
    category: 'Notification',
    status: 'Success',
    executedAt: timestamp,
    completedAt: timestamp,
    duration: '0.312s',
    severity: alert.severity,
    details: `Sent immediate ${alert.severity.toLowerCase()} alert notifications to security team via multiple channels`,
    executionSteps: [
      { step: 'Alert Prioritization', status: 'completed', duration: '0.089s', details: `Calculated risk score: ${alert.severity === 'Critical' ? '95/100' : '82/100'}` },
      { step: 'Email Notification', status: 'completed', duration: '0.123s', details: 'Sent to 5 SOC team members' },
      { step: 'Slack Alert', status: 'completed', duration: '0.067s', details: 'Posted to #security-critical channel' },
      { step: 'SMS Alert', status: 'completed', duration: '0.033s', details: 'Sent to on-call analyst' }
    ],
    affectedAssets: ['Email Server', 'Slack Workspace', 'SMS Gateway'],
    triggeredBy: 'Alert Detection System',
    apiCalls: 4,
    dataProcessed: '12 KB'
  });

  // 2. Threat Intelligence Enrichment
  actions.push({
    id: `${alert.id}-intel-${Date.now()}`,
    alertId: alert.id,
    alertRule: alert.rule,
    actionType: 'Threat Intelligence Enrichment',
    category: 'Investigation',
    status: 'Success',
    executedAt: timestamp,
    completedAt: timestamp,
    duration: '3.421s',
    playbookUsed: 'Automated Threat Analysis v2.1',
    severity: alert.severity,
    details: 'Performed comprehensive threat intelligence lookup across multiple threat feeds',
    executionSteps: [
      { step: 'IOC Extraction', status: 'completed', duration: '0.234s', details: 'Extracted 7 indicators of compromise' },
      { step: 'VirusTotal Query', status: 'completed', duration: '1.234s', details: 'Hash matched by 23/67 vendors' },
      { step: 'MISP Feed Check', status: 'completed', duration: '0.892s', details: 'Found in 3 active threat feeds' },
      { step: 'Historical Analysis', status: 'completed', duration: '1.061s', details: 'Similar patterns in 5 previous incidents' }
    ],
    affectedAssets: ['Threat Intel Platform', 'SIEM', 'VirusTotal API'],
    triggeredBy: 'SOAR Platform',
    apiCalls: 15,
    dataProcessed: '892 KB'
  });

  // 3. Type-specific containment actions
  if (alert.type === 'Endpoint' || alert.type === 'Malware') {
    if (alert.severity === 'Critical') {
      // Endpoint Isolation for Critical
      actions.push({
        id: `${alert.id}-isolate-${Date.now()}`,
        alertId: alert.id,
        alertRule: alert.rule,
        actionType: 'Isolate Endpoint',
        category: 'Containment',
        status: 'Success',
        executedAt: timestamp,
        completedAt: timestamp,
        duration: '2.134s',
        playbookUsed: 'Endpoint Containment v3.0',
        severity: 'Critical',
        details: `Isolated infected endpoint ${hostname} from network to prevent lateral movement`,
        executionSteps: [
          { step: 'Endpoint Agent Check', status: 'completed', duration: '0.421s', details: 'EDR agent responsive' },
          { step: 'Network Isolation', status: 'completed', duration: '0.892s', details: 'Disconnected from all VLANs' },
          { step: 'Process Termination', status: 'completed', duration: '0.534s', details: 'Killed 3 suspicious processes' },
          { step: 'Forensic Collection', status: 'completed', duration: '0.287s', details: 'Collected 128MB memory dump' }
        ],
        affectedAssets: [hostname, 'VLAN-100', 'VLAN-200', 'EDR Platform'],
        triggeredBy: 'EDR Detection Engine',
        apiCalls: 8,
        dataProcessed: '128.4 MB'
      });
    }
    
    // Process Termination
    actions.push({
      id: `${alert.id}-process-${Date.now()}`,
      alertId: alert.id,
      alertRule: alert.rule,
      actionType: 'Terminate Malicious Process',
      category: 'Containment',
      status: 'Success',
      executedAt: timestamp,
      completedAt: timestamp,
      duration: '1.234s',
      playbookUsed: 'Malware Response v2.5',
      severity: alert.severity,
      details: 'Identified and terminated malicious processes on affected endpoint',
      executionSteps: [
        { step: 'Process Analysis', status: 'completed', duration: '0.523s', details: 'Identified 2 malicious processes' },
        { step: 'Process Termination', status: 'completed', duration: '0.421s', details: 'Terminated processes successfully' },
        { step: 'Hash Submission', status: 'completed', duration: '0.290s', details: 'Submitted to threat intel platforms' }
      ],
      affectedAssets: [hostname, 'EDR Platform'],
      triggeredBy: 'Automated Response System',
      apiCalls: 5,
      dataProcessed: '2.3 MB'
    });
  }

  if (alert.type === 'Network' || alert.type === 'Firewall') {
    // IP Blocking
    actions.push({
      id: `${alert.id}-block-ip-${Date.now()}`,
      alertId: alert.id,
      alertRule: alert.rule,
      actionType: 'Block Malicious IP Address',
      category: 'Containment',
      status: 'Success',
      executedAt: timestamp,
      completedAt: timestamp,
      duration: '0.847s',
      playbookUsed: 'Network Threat Containment v2.1',
      severity: alert.severity,
      details: `Successfully blocked suspicious IP ${randomIP} across all network perimeters`,
      executionSteps: [
        { step: 'IP Reputation Check', status: 'completed', duration: '0.234s', details: 'IP confirmed as malicious' },
        { step: 'Firewall Rule Creation', status: 'completed', duration: '0.312s', details: 'Created deny rule on primary firewall' },
        { step: 'Rule Propagation', status: 'completed', duration: '0.301s', details: 'Propagated to 3 network segments' }
      ],
      affectedAssets: ['Firewall-01', 'Firewall-02', 'IDS-Primary'],
      triggeredBy: 'Network Detection System',
      apiCalls: 5,
      dataProcessed: '2.3 KB'
    });
  }

  if (alert.type === 'Phishing') {
    // Email Quarantine
    const affectedUsers = Math.floor(Math.random() * 5) + 1;
    actions.push({
      id: `${alert.id}-quarantine-${Date.now()}`,
      alertId: alert.id,
      alertRule: alert.rule,
      actionType: 'Quarantine Phishing Email',
      category: 'Containment',
      status: 'Success',
      executedAt: timestamp,
      completedAt: timestamp,
      duration: '1.256s',
      playbookUsed: 'Phishing Response v2.5',
      severity: alert.severity,
      details: `Quarantined phishing email and removed from ${affectedUsers} user mailboxes`,
      executionSteps: [
        { step: 'Email Analysis', status: 'completed', duration: '0.312s', details: 'Identified malicious links and attachments' },
        { step: 'Mailbox Search', status: 'completed', duration: '0.523s', details: `Found in ${affectedUsers} mailboxes` },
        { step: 'Email Quarantine', status: 'completed', duration: '0.421s', details: 'Moved to secure quarantine' }
      ],
      affectedAssets: [`${affectedUsers} User Mailboxes`, 'Exchange Server', 'Email Gateway'],
      triggeredBy: 'Email Security Gateway',
      apiCalls: 12,
      dataProcessed: '4.7 MB'
    });
  }

  // 4. SIEM Log Correlation
  actions.push({
    id: `${alert.id}-siem-${Date.now()}`,
    alertId: alert.id,
    alertRule: alert.rule,
    actionType: 'SIEM Log Correlation',
    category: 'Investigation',
    status: 'Success',
    executedAt: timestamp,
    completedAt: timestamp,
    duration: '5.234s',
    playbookUsed: 'Log Analysis Automation v2.0',
    severity: alert.severity,
    details: 'Performed automated log correlation across multiple data sources',
    executionSteps: [
      { step: 'Log Collection', status: 'completed', duration: '1.234s', details: 'Retrieved 45,234 log entries' },
      { step: 'Pattern Matching', status: 'completed', duration: '2.341s', details: 'Found 127 related events' },
      { step: 'Timeline Creation', status: 'completed', duration: '0.892s', details: 'Built attack timeline' },
      { step: 'Report Generation', status: 'completed', duration: '0.767s', details: 'Created incident summary' }
    ],
    affectedAssets: ['SIEM Platform', 'Log Storage', '8 Data Sources'],
    triggeredBy: 'SIEM Correlation Engine',
    apiCalls: 23,
    dataProcessed: '234 MB'
  });

  return actions;
};

// Generate initial automated actions for existing alerts
const generateInitialAutomatedActions = (alerts: Alert[]): AutomatedAction[] => {
  const allActions: AutomatedAction[] = [];
  alerts.forEach(alert => {
    if (alert.severity === 'Critical' || alert.severity === 'High') {
      allActions.push(...generateAutomatedActionsForAlert(alert));
    }
  });
  return allActions;
};

// Helper function to create Case Report from a single Automated Action
  const generateCaseReportFromAction = (alert: Alert, action: AutomatedAction, caseNumber: number): Case => {
    const actionDetails = action.executionSteps.map(step => 
      `${step.step}: ${step.status} (${step.duration}) - ${step.details}`
    ).join('; ');

    const actionsTaken = [
      `Automated action triggered: ${action.actionType}`,
      `Execution initiated at ${action.executedAt}`,
      ...action.executionSteps.map(step => `${step.step} - ${step.status}`)
    ];

    const findings = `Automated Security Response executed for ${alert.severity} severity alert.\n\n` +
      `Alert: ${alert.rule}\n` +
      `Action Type: ${action.actionType} (${action.category})\n` +
      `Status: ${action.status}\n` +
      `Duration: ${action.duration}\n\n` +
      `Execution Details:\n${actionDetails}\n\n` +
      `Affected Assets: ${action.affectedAssets.join(', ')}\n` +
      `API Calls Made: ${action.apiCalls}\n` +
      `Data Processed: ${action.dataProcessed}\n` +
      `Triggered By: ${action.triggeredBy}\n\n` +
      (action.playbookUsed ? `Playbook Used: ${action.playbookUsed}\n` : '') +
      `Additional Details: ${action.details}`;

    // Determine resolution: 90% True Positive, 10% False Positive for variety
    const resolution: 'True Positive' | 'False Positive' = Math.random() > 0.9 ? 'False Positive' : 'True Positive';

    const recommendation = action.status === 'Success'
      ? `Automated response completed successfully. ${
          alert.severity === 'Critical' 
            ? 'Continue monitoring affected assets closely. Schedule immediate incident review. Consider implementing additional preventive controls.' 
            : 'Monitor for similar patterns. Review automation effectiveness. Document lessons learned.'
        }`
      : `Automated response encountered issues. Manual intervention may be required. Review error logs and retry if necessary.`;

    return {
      caseId: `C-${1000 + caseNumber}`,
      alertId: alert.id,
      rule: `${alert.rule} - ${action.actionType}`,
      severity: alert.severity,
      type: action.category,
      dateResolved: new Date().toISOString().slice(0, 10),
      resolution,
      analyst: 'Automated Response System',
      originalDate: alert.date,
      notes: `Automated action executed in response to ${alert.severity} alert. Action: ${action.actionType}. Status: ${action.status}.`,
      actionsTaken,
      findings,
      recommendation,
      timeToResolve: `Immediate (${action.duration})`,
      alertDetails: alert
    };
  };

// Create context outside of the provider
const SOCContext = createContext<SOCContextType | undefined>(undefined);

export function SOCProvider({ children }: { children: ReactNode }) {
  const { events: realtimeEvents } = useRealtimeEvents();
  const processedRealtimeIdsRef = useRef<Set<string>>(new Set());

  const [state, setState] = useState<SOCState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyState));
        return { ...emptyState };
      }
      const parsedState = JSON.parse(stored);
      if (!parsedState.automatedActions) {
        parsedState.automatedActions = [];
      }
      if (!parsedState.cases) {
        parsedState.cases = [];
      }
      return parsedState;
    } catch (e) {
      console.error(e);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyState));
      return { ...emptyState };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (realtimeEvents.length === 0) {
      return;
    }

    const newEvents = realtimeEvents.filter((event) => {
      const id = getEventId(event);
      if (processedRealtimeIdsRef.current.has(id)) {
        return false;
      }
      processedRealtimeIdsRef.current.add(id);
      return true;
    });

    if (newEvents.length === 0) {
      return;
    }

    const mappedAlerts = newEvents
      .map((event) => mapRealtimeEventToAlert(event))
      .filter((alert): alert is Alert => alert !== null);

    if (mappedAlerts.length > 0) {
      setState((prev) => ({
        ...prev,
        alerts: [...mappedAlerts.reverse(), ...prev.alerts],
      }));
    }

    for (const evt of newEvents) {
      if (isBackendDetectEvent(evt)) {
        toastForDetectEvent(evt);
      }
    }
  }, [realtimeEvents]);

  // Check for new high/critical alerts and generate automated actions
  useEffect(() => {
    const highPriorityAlerts = state.alerts.filter(
      alert => 
        alert.status === 'Open' && 
        (alert.severity === 'Critical' || alert.severity === 'High') &&
        !state.automatedActions.some(action => action.alertId === alert.id)
    );

    if (highPriorityAlerts.length > 0) {
      const newActions: AutomatedAction[] = [];
      const newCases: Case[] = [];
      
      highPriorityAlerts.forEach(alert => {
        const actions = generateAutomatedActionsForAlert(alert);
        newActions.push(...actions);
        
        // Generate a case report for EACH automated action
        actions.forEach((action) => {
          const caseReport = generateCaseReportFromAction(
            alert, 
            action, 
            state.cases.length + newCases.length + 1
          );
          newCases.push(caseReport);
        });
        
      });

      if (newActions.length > 0) {
        setState(prev => ({
          ...prev,
          automatedActions: [...prev.automatedActions, ...newActions],
          cases: [...prev.cases, ...newCases]
        }));
      }
    }
  }, [state.alerts]);

  const assignAlert = (id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) =>
        alert.id === id ? { ...alert, assigned: 'analyst' } : alert
      ),
    }));
  };

  const resolveAlert = (id: string, resolution: 'True Positive' | 'False Positive') => {
    setState((prev) => {
      const alert = prev.alerts.find((a) => a.id === id);
      if (!alert) return prev;

      const updatedAlert = {
        ...alert,
        status: 'Closed' as const,
        assigned: alert.assigned || 'analyst',
      };

      // Calculate time to resolve
      const originalDate = new Date(alert.date);
      const resolvedDate = new Date();
      const daysDiff = Math.floor((resolvedDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24));
      const timeToResolve = daysDiff === 0 ? 'Same day' : `${daysDiff} day${daysDiff > 1 ? 's' : ''}`;

      // Generate detailed actions based on alert type and resolution
      const actionsTaken = generateActionsTaken(alert, resolution);
      const findings = generateFindings(alert, resolution);
      const recommendation = generateRecommendation(alert, resolution);

      const newCase: Case = {
        caseId: `C-${1000 + prev.cases.length + 1}`,
        alertId: alert.id,
        rule: alert.rule,
        severity: alert.severity,
        type: alert.type,
        dateResolved: new Date().toISOString().slice(0, 10),
        resolution,
        analyst: alert.assigned || 'SOC Analyst',
        originalDate: alert.date,
        notes: alert.notes,
        actionsTaken,
        findings,
        recommendation,
        timeToResolve,
        // Add full alert details to the case
        alertDetails: alert
      };

      return {
        alerts: prev.alerts.map((a) => (a.id === id ? updatedAlert : a)),
        cases: [...prev.cases, newCase],
        automatedActions: prev.automatedActions, // Keep automated actions
      };
    });
  };

  // Helper function to generate actions based on alert type
  const generateActionsTaken = (alert: Alert, resolution: string): string[] => {
    const baseActions = [
      'Initial alert review and validation',
      'Gathered relevant logs and context from SIEM',
      'Analyzed alert severity and potential impact',
    ];

    const typeSpecificActions: { [key: string]: string[] } = {
      'Endpoint': [
        'Reviewed endpoint security logs',
        'Checked process execution history',
        'Verified user activity at time of alert',
        'Scanned endpoint for malware signatures',
      ],
      'Network': [
        'Analyzed network traffic patterns',
        'Reviewed firewall and IDS logs',
        'Identified source and destination IPs',
        'Checked for similar traffic patterns',
      ],
      'Phishing': [
        'Analyzed email headers and content',
        'Verified sender authenticity',
        'Checked URLs and attachments for threats',
        'Reviewed user interaction with email',
      ],
      'Firewall': [
        'Reviewed firewall rule matches',
        'Analyzed blocked connection attempts',
        'Verified source IP reputation',
        'Checked for repeated access attempts',
      ],
    };

    const resolutionActions = resolution === 'True Positive'
      ? [
          'Confirmed malicious activity',
          'Initiated incident response procedures',
          'Documented threat indicators',
          'Implemented containment measures',
        ]
      : [
          'Verified alert as false positive',
          'Documented benign behavior pattern',
          'Recommended detection rule tuning',
          'Updated alert baseline thresholds',
        ];

    return [...baseActions, ...(typeSpecificActions[alert.type] || []), ...resolutionActions];
  };

  const generateFindings = (alert: Alert, resolution: string): string => {
    if (resolution === 'True Positive') {
      const findings: { [key: string]: string } = {
        'Endpoint': `Analysis confirmed malicious activity on the endpoint. The ${alert.rule.toLowerCase()} indicates a potential security breach. Immediate action was required to contain the threat and prevent lateral movement.`,
        'Network': `Investigation revealed suspicious network behavior matching threat indicators. The ${alert.rule.toLowerCase()} represents unauthorized access attempts that could lead to data exfiltration or system compromise.`,
        'Phishing': `Email analysis confirmed phishing attempt. The message contained malicious links designed to harvest credentials or deploy malware. User did not interact with the malicious content, preventing potential compromise.`,
        'Firewall': `Firewall logs show persistent attempts to access blacklisted resources. The ${alert.rule.toLowerCase()} indicates potential command and control communication or data exfiltration attempt that was successfully blocked.`,
      };
      return findings[alert.type] || `Confirmed security incident requiring immediate attention. The alert was validated as a genuine threat to the organization's security posture.`;
    } else {
      const findings: { [key: string]: string } = {
        'Endpoint': `Investigation determined the activity was part of legitimate administrative operations. The ${alert.rule.toLowerCase()} was triggered by authorized system maintenance performed by IT staff.`,
        'Network': `Analysis showed the network traffic was related to normal business operations. The ${alert.rule.toLowerCase()} was caused by legitimate application behavior that mimicked suspicious patterns.`,
        'Phishing': `Email verification confirmed the message was legitimate business communication. The ${alert.rule.toLowerCase()} was triggered due to overly aggressive detection rules that need refinement.`,
        'Firewall': `Review of firewall logs indicated the blocked connection was from a known and trusted business partner. The ${alert.rule.toLowerCase()} occurred due to outdated whitelist configurations.`,
      };
      return findings[alert.type] || `After thorough investigation, the alert was determined to be a false positive. The activity was part of normal, authorized operations and does not represent a security threat.`;
    }
  };

  const generateRecommendation = (alert: Alert, resolution: string): string => {
    if (resolution === 'True Positive') {
      const recommendations: { [key: string]: string } = {
        'Critical': 'IMMEDIATE ACTION REQUIRED: Isolate affected systems, initiate full incident response protocol, engage senior security team, conduct comprehensive forensic analysis, and prepare executive briefing.',
        'High': 'HIGH PRIORITY: Contain the threat immediately, perform detailed investigation, update security controls, implement additional monitoring, and brief relevant stakeholders.',
        'Medium': 'MEDIUM PRIORITY: Address the security gap, enhance monitoring for similar patterns, review and update security policies, and conduct targeted security awareness training.',
        'Low': 'LOW PRIORITY: Document the incident for trend analysis, consider minor security control adjustments, and include in regular security awareness communications.',
      };
      return recommendations[alert.severity] || 'Continue monitoring for similar threats and maintain enhanced security posture.';
    } else {
      return `Alert rule requires tuning to reduce false positive rate. Recommended actions: (1) Update detection thresholds to better distinguish between normal and malicious behavior, (2) Add exception rules for known legitimate activity patterns, (3) Review and refine alert correlation logic, (4) Document this case for future reference to improve detection accuracy.`;
    }
  };

  const getStats = () => {
    // Total alerts = ALL alerts (open + closed)
    const total = state.alerts.length;
    const closed = state.alerts.filter((a) => a.status === 'Closed').length;
    const truePositives = state.cases.filter((c) => c.resolution === 'True Positive').length;
    const falsePositives = state.cases.filter((c) => c.resolution === 'False Positive').length;
    const openAlerts = state.alerts.filter((a) => a.status === 'Open').length;

    return { total, closed, truePositives, falsePositives, openAlerts };
  };

  const simulateAlert = (severity: 'Critical' | 'High') => {
    void postAutomatedDetect({
      severity,
      source: 'frontend-manual',
      timestamp: new Date().toISOString(),
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to send detect request', {
        description: message,
        duration: 4500,
      });
    });
  };

  return (
    <SOCContext.Provider value={{ state, assignAlert, resolveAlert, simulateAlert, getStats }}>
      {children}
    </SOCContext.Provider>
  );
}

export function useSOC() {
  const context = useContext(SOCContext);
  if (!context) {
    throw new Error('useSOC must be used within SOCProvider');
  }
  return context;
}