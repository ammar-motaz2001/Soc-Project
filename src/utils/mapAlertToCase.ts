import type { Alert, Case } from '../context/SOCContext';

function inferResolution(alert: Alert): 'True Positive' | 'False Positive' {
  const tp = alert.true_positive_count ?? 0;
  const fp = alert.false_positive_count ?? 0;
  if (tp > fp) return 'True Positive';
  if (fp > tp) return 'False Positive';
  return 'True Positive';
}

function resolvedDate(alert: Alert): string {
  const raw = alert.lastSeen ?? alert.timestamp ?? alert.date;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return alert.date;
}

/** Builds a case report row from a closed alert returned by the alerts API (dashboard model). */
export function mapClosedAlertToCase(alert: Alert): Case {
  const resolution = inferResolution(alert);
  return {
    caseId: `CASE-${alert.id}`,
    alertId: alert.id,
    rule: alert.rule,
    severity: alert.severity,
    type: alert.type,
    dateResolved: resolvedDate(alert),
    resolution,
    analyst: 'Alerts API',
    originalDate: alert.date,
    notes: alert.notes,
    actionsTaken: [
      `Recorded true-positive count: ${alert.true_positive_count ?? 0}`,
      `Recorded false-positive count: ${alert.false_positive_count ?? 0}`,
    ],
    findings: alert.notes,
    recommendation:
      resolution === 'True Positive'
        ? 'Continue monitoring linked assets; validate automated actions completed successfully.'
        : 'Review detection logic and document benign activity to reduce noise.',
    timeToResolve: '',
    alertDetails: alert,
  };
}
