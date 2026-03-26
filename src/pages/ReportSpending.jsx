import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatCurrencyShort } from '../utils/format'
import { FUND_COLORS, FUND_LABELS, CATEGORIES, CATEGORY_COLORS } from '../utils/constants'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler)

export default function ReportSpending() {
  const { funds, approvedWithdrawals, totalBalance, getCategoryBreakdown } = useApp()
  const categories = getCategoryBreakdown()

  // Monthly spending data
  const monthlyData = getMonthlySpending(approvedWithdrawals, funds)

  const lineData = {
    labels: monthlyData.labels,
    datasets: [
      { label: 'Sarkari Fund', data: monthlyData.sarkari, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 },
      { label: 'Grant Money', data: monthlyData.grant, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
      { label: 'Revenue', data: monthlyData.revenue, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.4 },
    ],
  }

  const fundDoughnut = {
    labels: funds.map(f => FUND_LABELS[f.fund_type]),
    datasets: [{
      data: funds.map(f => parseFloat(f.total_spent || 0)),
      backgroundColor: funds.map(f => FUND_COLORS[f.fund_type]?.hex),
      borderWidth: 0, cutout: '65%',
    }],
  }

  const categoryDoughnut = {
    labels: categories.map(c => CATEGORIES.find(x => x.value === c.category)?.label || c.category),
    datasets: [{
      data: categories.map(c => c.amount),
      backgroundColor: categories.map(c => CATEGORY_COLORS[c.category] || '#6b7280'),
      borderWidth: 0, cutout: '65%',
    }],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Spending trends and fund analytics</p>
        </div>
        <Link to="/reports/compliance"
          className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors">
          📋 Compliance Report
        </Link>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Monthly Spending Trend</h3>
        <div className="h-72">
          <Line data={lineData} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
              y: { beginAtZero: true, ticks: { callback: v => formatCurrencyShort(v) } },
            },
          }} />
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Fund-Wise Spending</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={fundDoughnut} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Category-Wise Spending</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={categoryDoughnut} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {categories.map(({ category, amount, percentage: pct }) => {
            const label = CATEGORIES.find(c => c.value === category)?.label || category
            const color = CATEGORY_COLORS[category] || '#6b7280'
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">{pct.toFixed(1)}%  •  {formatCurrencyShort(amount)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getMonthlySpending(withdrawals, funds) {
  const months = {}
  const labels = []
  const now = new Date()

  // Last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    labels.push(label)
    months[key] = { sarkari: 0, grant: 0, revenue: 0 }
  }

  withdrawals.forEach(w => {
    const d = new Date(w.spent_date || w.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (months[key]) {
      const fund = funds.find(f => f.id === w.fund_id)
      const type = fund?.fund_type || 'revenue'
      months[key][type] += parseFloat(w.total_amount || 0)
    }
  })

  const keys = Object.keys(months)
  return {
    labels,
    sarkari: keys.map(k => months[k].sarkari),
    grant: keys.map(k => months[k].grant),
    revenue: keys.map(k => months[k].revenue),
  }
}
