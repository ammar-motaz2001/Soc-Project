import { useEffect, useRef, useMemo } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { Alert } from '../context/SOCContext';

// Register Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface DashboardChartProps {
  alerts: Alert[];
  activeTab: 'types' | 'severity';
}

export default function DashboardChart({ alerts, activeTab }: DashboardChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const openAlerts = useMemo(() => alerts.filter((a) => a.status !== 'Closed'), [alerts]);
  const total = openAlerts.length;

  const chartData = useMemo(() => {
    const counts = new Map<string, number>();

    if (activeTab === 'types') {
      openAlerts.forEach((alert) => {
        const type = alert.type || 'Unknown';
        counts.set(type, (counts.get(type) || 0) + 1);
      });
    } else {
      const severityOrder = ['Low', 'Medium', 'High', 'Critical'];
      severityOrder.forEach((sev) => counts.set(sev, 0));
      openAlerts.forEach((alert) => {
        const sev = alert.severity || 'Low';
        counts.set(sev, (counts.get(sev) || 0) + 1);
      });
    }

    const labels = Array.from(counts.keys());
    const data = labels.map((l) => counts.get(l) || 0);

    const palette =
      activeTab === 'types'
        ? ['#FFD966', '#FF6B6B', '#60A5FA', '#A7F3D0', '#C084FC', '#F59E0B']
        : ['#A7F3D0', '#60A5FA', '#FFD966', '#FF6B6B'];

    const colors = labels.map((_, i) => palette[i % palette.length]);

    return { labels, data, colors };
  }, [openAlerts, activeTab]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.data,
            backgroundColor: chartData.colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        maintainAspectRatio: false,
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div className="bg-[#19232C] p-[18px] rounded-[10px] h-[500px] flex flex-col">
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-full relative flex flex-col items-center" style={{ maxWidth: '320px' }}>
          <div className="relative" style={{ width: '300px', height: '300px' }}>
            <canvas ref={canvasRef} width="300" height="300" aria-label={`Alert ${activeTab} chart`} />
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <div className="text-[40px] font-medium leading-none">{total}</div>
              <div className="text-[#98A0AC] text-sm mt-1">Alerts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {chartData.labels.map((label, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03]"
          >
            <span
              className="inline-block w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: chartData.colors[index] }}
            />
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[#E6EEF6] text-sm font-medium truncate">{label}</span>
              <span className="text-[#98A0AC] text-sm whitespace-nowrap">{chartData.data[index]} alerts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}