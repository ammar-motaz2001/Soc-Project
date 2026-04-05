import type { Alert } from '../context/SOCContext';
import type { RemoteDashboardAlert } from '../apiClient';

function mapPriorityToSeverity(priority: string): Alert['severity'] {
  const p = priority.toLowerCase();
  if (p === 'critical') return 'Critical';
  if (p === 'high') return 'High';
  if (p === 'low') return 'Low';
  return 'Medium';
}

function formatAlertType(type: string): string {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export function mapRemoteDashboardAlertToAlert(remote: RemoteDashboardAlert): Alert {
  const attackParts = Object.entries(remote.attack_counts ?? {})
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k.replace(/_/g, ' ')}: ${n}`);
  const attackSummary = attackParts.length > 0 ? attackParts.join(' • ') : 'No attack counts';

  const notes = [
    `Device ID: ${remote.device_id ?? '—'}`,
    ...(remote.device_ip ? [`Device IP: ${remote.device_ip}`] : []),
    `Attacks: ${attackSummary}`,
    `True positives: ${remote.true_positive_count} • False positives: ${remote.false_positive_count}`,
    `Updated: ${remote.updated_at}`,
  ].join('\n');

  const iocMatches = Object.entries(remote.attack_counts ?? {})
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k.replace(/_/g, ' ')} (${n})`);

  const totalAttacks = Object.values(remote.attack_counts ?? {}).reduce((sum, n) => sum + n, 0);
  const threatScore = Math.min(
    100,
    Math.round(totalAttacks * 8 + (remote.priority?.toLowerCase() === 'high' ? 25 : 10)),
  );

  const dateSlice = remote.created_at.slice(0, 10);

  return {
    id: remote.id,
    rule: remote.title,
    severity: mapPriorityToSeverity(remote.priority),
    type: formatAlertType(remote.type),
    date: dateSlice,
    status: remote.is_closed ? 'Closed' : 'Open',
    assigned: null,
    notes,
    sourceIP: remote.device_ip,
    timestamp: remote.updated_at,
    firstSeen: remote.created_at,
    lastSeen: remote.updated_at,
    threatScore: totalAttacks > 0 ? threatScore : undefined,
    iocMatches: iocMatches.length > 0 ? iocMatches : undefined,
    reputation: 'Unknown',
    true_positive_count: remote.true_positive_count,
    false_positive_count: remote.false_positive_count,
  };
}
