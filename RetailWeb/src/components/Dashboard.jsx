import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, ShoppingCart, Box, Activity, AlertTriangle, BarChart3, Layout } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SummaryCard = ({ title, value, icon, color }) => (
  <div className="summary-card">
    <div className="summary-icon-box" style={{ backgroundColor: color + '15', color: color }}>
      {icon}
    </div>
    <div className="summary-content">
      <span className="summary-label">{title}</span>
      <span className="summary-value">{value !== undefined && value !== null ? value : '0'}</span>
    </div>
  </div>
);

const Dashboard = ({ data }) => {
  const { productName, inventory, sales, charts, lowStockAlert } = data;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
      }
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9', borderDash: [5, 5] },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '500' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '500' } }
      }
    }
  };

  return (
    <div className="dashboard-wrapper fade-in">
      <div className="dashboard-banner">
        <div className="banner-title">
          <Layout size={20} className="banner-icon" />
          <h3>{productName}</h3>
        </div>
        <span className="live-pill">Live Analytics</span>
      </div>

      {lowStockAlert && (
        <div className="critical-alert">
          <AlertTriangle size={18} />
          <span>Low Stock Warning: {inventory.available} units remaining.</span>
        </div>
      )}

      <div className="metrics-row">
        <SummaryCard title="Current Stock" value={inventory.available} icon={<Box size={18}/>} color="#6366F1" />
        <SummaryCard title="Live Revenue" value={sales.totalRevenue} icon={<BarChart3 size={18}/>} color="#10b981" />
        <SummaryCard title="Momentum" value={sales.growth} icon={<TrendingUp size={18}/>} color="#f43f5e" />
      </div>

      <div className="audit-panel">
        <div className="audit-item">
          <span className="audit-key">Database Capacity</span>
          <span className="audit-val">{inventory?.total ?? '0'} SKUs</span>
        </div>
        <div className="audit-item">
          <span className="audit-key">Safety Threshold</span>
          <span className="audit-val">{inventory?.threshold ?? '0'} Units</span>
        </div>
        <div className="audit-item">
          <span className="audit-key">Last Enterprise Sync</span>
          <span className="audit-val">{inventory?.lastUpdated ?? 'N/A'}</span>
        </div>
      </div>

      <div className="visuals-container">
        {charts && charts.length > 0 && charts.map((c, i) => (
          c && c.labels && c.data && (
            <div key={i} className="visual-card">
              <div className="visual-header">
                <span className="visual-title">{c.title || 'Performance Metrics'}</span>
              </div>
              <div className="visual-body">
                {c.type === 'line' ? (
                  <Line 
                    options={chartOptions}
                    data={{
                      labels: c.labels,
                      datasets: [{
                        label: c.title,
                        data: c.data,
                        borderColor: '#6366F1',
                        backgroundColor: (context) => {
                          const ctx = context.chart.ctx;
                          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
                          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                          return gradient;
                        },
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#6366F1',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 3,
                      }]
                    }}
                  />
                ) : (
                  <Bar 
                    options={chartOptions}
                    data={{
                      labels: c.labels,
                      datasets: [{
                        label: c.title,
                        data: c.data,
                        backgroundColor: '#6366F1',
                        borderRadius: 6,
                        hoverBackgroundColor: '#4F46E5'
                      }]
                    }}
                  />
                )}
              </div>
            </div>
          )
        ))}
      </div>

      <style>{`
        .dashboard-wrapper { 
          background: white; 
          border-radius: 20px; 
          padding: 1.5rem; 
          border: 1px solid var(--border-light); 
          width: 550px; 
          max-width: 95vw;
          display: flex; 
          flex-direction: column; 
          gap: 1.5rem;
          box-shadow: 0 4px 30px rgba(0,0,0,0.05);
        }
        
        .dashboard-banner { display: flex; justify-content: space-between; align-items: center; }
        .banner-title { display: flex; align-items: center; gap: 0.75rem; }
        .banner-icon { color: var(--primary); }
        .banner-title h3 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
        .live-pill { 
          background: #f1f5f9; 
          color: #64748b; 
          font-size: 0.7rem; 
          font-weight: 700; 
          padding: 4px 10px; 
          border-radius: 100px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }

        .critical-alert { 
          background: #fff1f2; 
          color: #e11d48; 
          padding: 0.75rem 1rem; 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          gap: 0.75rem; 
          font-size: 0.9rem; 
          font-weight: 600; 
          border: 1px solid #ffe4e6;
        }

        .metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .summary-card { 
          background: #f8fafc; 
          padding: 1rem; 
          border-radius: 16px; 
          border: 1px solid #f1f5f9; 
          display: flex; 
          flex-direction: column; 
          gap: 0.75rem; 
        }
        .summary-icon-box { 
          width: 36px; 
          height: 36px; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        }
        .summary-label { font-size: 0.75rem; font-weight: 600; color: #64748b; }
        .summary-value { font-size: 1.15rem; font-weight: 800; color: #0f172a; }

        .audit-panel { 
          background: #0f172a; 
          padding: 1.25rem; 
          border-radius: 16px; 
          display: flex; 
          flex-direction: column; 
          gap: 0.75rem; 
        }
        .audit-item { display: flex; justify-content: space-between; align-items: center; }
        .audit-key { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
        .audit-val { font-size: 0.85rem; color: white; font-weight: 700; }

        .visuals-container { display: flex; flex-direction: column; gap: 2rem; }
        .visual-card { 
          background: white; 
          border-radius: 16px; 
          overflow: hidden; 
        }
        .visual-header { margin-bottom: 1rem; }
        .visual-title { font-size: 0.95rem; font-weight: 700; color: #334155; }
        .visual-body { height: 220px; width: 100%; }
      `}</style>
    </div>
  );
};

export default Dashboard;
