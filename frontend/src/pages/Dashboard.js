import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { api } from '../services/api';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <Loading label="Loading dashboard..." />;

  const cards = stats
    ? [
        { label: 'Products', value: stats.total_products, accent: 'blue' },
        { label: 'Customers', value: stats.total_customers, accent: 'violet' },
        { label: 'Orders', value: stats.total_orders, accent: 'emerald' },
        { label: 'Low Stock (≤10)', value: stats.low_stock_count, accent: 'amber' },
        {
          label: 'Inventory Value',
          value: formatCurrency(stats.total_inventory_value),
          accent: 'slate',
          wide: true,
        },
      ]
    : [];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory and sales</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadStats}>
          Refresh
        </button>
      </header>

      <Alert type="error" message={error} onDismiss={() => setError('')} />

      <div className="stat-grid">
        {cards.map((card) => (
          <article key={card.label} className={`stat-card accent-${card.accent} ${card.wide ? 'wide' : ''}`}>
            <p className="stat-label">{card.label}</p>
            <p className="stat-value">{card.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
