import type { AutomatedAction } from '../context/SOCContext';
import type { RemoteAutomatedAction } from '../apiClient';

function mapApiStatus(remoteStatus: string): AutomatedAction['status'] {
  const s = remoteStatus.toLowerCase();
  if (s === 'done' || s === 'success' || s === 'completed') return 'Success';
  if (s === 'failed' || s === 'error') return 'Failed';
  if (s === 'partial') return 'Partial Success';
  return 'Pending';
}

function mapCategory(action: string): AutomatedAction['category'] {
  const a = action.toLowerCase();
  if (a.includes('block') || a.includes('isolate')) return 'Containment';
  if (a.includes('notify') || a.includes('alert')) return 'Notification';
  if (a.includes('remediat') || a.includes('patch')) return 'Remediation';
  return 'Investigation';
}

function humanizeAction(action: string): string {
  return action
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function mapRemoteAutomatedActionToAutomatedAction(
  remote: RemoteAutomatedAction,
): AutomatedAction {
  const executionSteps: AutomatedAction['executionSteps'] = [];

  if (remote.enforcement) {
    const e = remote.enforcement;
    const stepStatus =
      e.applied === true
        ? 'completed'
        : e.attempted === true && e.applied !== true
          ? 'failed'
          : 'pending';
    executionSteps.push({
      step: 'Enforcement',
      status: stepStatus,
      duration: '-',
      details: e.message ?? JSON.stringify(e),
    });
  }

  if (executionSteps.length === 0) {
    executionSteps.push({
      step: humanizeAction(remote.action),
      status: remote.status === 'done' ? 'completed' : 'pending',
      duration: '-',
      details: remote.reason,
    });
  }

  const affectedAssets = [remote.ip, remote.device_id].filter(Boolean);

  const actionLower = remote.action.toLowerCase();
  const severity: AutomatedAction['severity'] =
    actionLower.includes('isolate') || actionLower.includes('block')
      ? 'High'
      : 'Medium';

  return {
    id: remote.id,
    alertId: remote.alert_id ?? '—',
    alertRule: remote.reason,
    actionType: humanizeAction(remote.action),
    category: mapCategory(remote.action),
    status: mapApiStatus(remote.status),
    executedAt: remote.created_at,
    duration: '-',
    playbookUsed: remote.enforcement?.message,
    severity,
    details: remote.reason,
    executionSteps,
    affectedAssets,
    triggeredBy: 'Security automation',
    apiCalls: 0,
    dataProcessed: '—',
  };
}
