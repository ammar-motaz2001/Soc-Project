import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSOC } from '../context/SOCContext';
import { toast } from 'sonner@2.0.3';

let lastProcessedAlertIds: Set<string> = new Set();

export function NotificationHandler() {
  const navigate = useNavigate();
  const { state } = useSOC();

  useEffect(() => {
    // Check for new high/critical alerts that haven't been processed yet
    const highPriorityAlerts = state.alerts.filter(
      alert => 
        alert.status === 'Open' && 
        (alert.severity === 'Critical' || alert.severity === 'High') &&
        !lastProcessedAlertIds.has(alert.id)
    );

    if (highPriorityAlerts.length > 0) {
      highPriorityAlerts.forEach(alert => {
        // Mark as processed
        lastProcessedAlertIds.add(alert.id);

        // Find automated actions for this alert
        const alertActions = state.automatedActions.filter(action => action.alertId === alert.id);
        
        if (alertActions.length > 0) {
          const actionNames = alertActions.map(a => a.actionType).slice(0, 3);
          const moreCount = alertActions.length > 3 ? ` +${alertActions.length - 3} more` : '';
          
          // Show detailed notification
          toast.error(`🚨 ${alert.severity} Alert Detected!`, {
            description: (
              <div className="space-y-1">
                <div className="font-semibold">Alert {alert.id}: {alert.rule}</div>
                <div className="text-sm mt-2 space-y-0.5">
                  <div className="font-semibold text-[#A7EA3B]">Automated Actions Executed:</div>
                  {actionNames.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[#A7F3D0]">✓</span>
                      <span>{name}</span>
                    </div>
                  ))}
                  {moreCount && <div className="text-[#98A0AC] text-xs">{moreCount}</div>}
                </div>
              </div>
            ),
            duration: 10000,
            action: {
              label: 'View Actions',
              onClick: () => navigate('/automated-actions')
            }
          });
        } else {
          // Show initial notification (actions are being generated)
          toast.error(`🚨 ${alert.severity} Alert Detected!`, {
            description: (
              <div className="space-y-1">
                <div className="font-semibold">Alert #{alert.id}</div>
                <div className="text-sm">{alert.rule}</div>
                <div className="text-xs text-[#98A0AC] mt-1">
                  Automated response initiated...
                </div>
              </div>
            ),
            duration: 8000,
            action: {
              label: 'View Queue',
              onClick: () => navigate('/queue')
            }
          });
        }
      });
    }
  }, [state.alerts, state.automatedActions, navigate]);

  return null;
}
