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
      { label: 'Sarkari Fund', data: monthlyData.sarkari, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, borderWidth: 4, pointRadius: 0 },
      { label: 'Grant Money', data: monthlyData.grant, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, borderWidth: 4, pointRadius: 0 },
      { label: 'Revenue', data: monthlyData.revenue, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', fill: true, tension: 0.4, borderWidth: 4, pointRadius: 0 },
    ],
  }

  const fundDoughnut = {
    labels: funds.map(f => FUND_LABELS[f.fund_type]),
    datasets: [{
      data: funds.map(f => parseFloat(f.total_spent || 0)),
      backgroundColor: funds.map(f => FUND_COLORS[f.fund_type]?.hex),
      borderWidth: 0, cutout: '75%', borderRadius: 10,
    }],
  }

  const categoryDoughnut = {
    labels: categories.map(c => CATEGORIES.find(x => x.value === c.category)?.label || c.category),
    datasets: [{
      data: categories.map(c => c.amount),
      backgroundColor: categories.map(c => CATEGORY_COLORS[c.category] || '#6b7280'),
      borderWidth: 0, cutout: '75%', borderRadius: 10,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { weight: 'bold', size: 10 },
          color: '#94a3b8'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 12,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { weight: 'bold', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: {
          color: '#94a3b8',
          font: { weight: 'bold', size: 10 },
          callback: v => formatCurrencyShort(v)
        }
      }
    }
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Intelligence & Analytics</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Deep-dive assessment of organizational capital deployment.</p>
        </div>
        <Link to="/reports/compliance"
          className="w-full md:w-auto bg-emerald-600 dark:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest px-8 py-5 rounded-2xl shadow-xl hover:scale-105 transition-all text-center">
          📋 compliance architecture
        </Link>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12">
        <div className="mb-10">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Temporal Burn Map</h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">Aggregate monthly disbursement across repositories</p>
        </div>
        <div className="h-80 w-full">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12 flex flex-col items-center">
          <div className="w-full mb-10">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Repo Allocation</h3>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">Capital distribution by fund governance</p>
          </div>
          <div className="h-64 w-full relative flex items-center justify-center">
            <Doughnut data={fundDoughnut} options={{ ...chartOptions, scales: undefined }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">Deployed</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">100%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12 flex flex-col items-center">
          <div className="w-full mb-10">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Strategic Categories</h3>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">Spending weight by operational utility</p>
          </div>
          <div className="h-64 w-full relative flex items-center justify-center">
            <Doughnut data={categoryDoughnut} options={{ ...chartOptions, scales: undefined }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">Utility</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12">
        <div className="mb-10">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Asset Classification Ledger</h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">Granular breakdown of capital utilization efficiency</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {categories.map(({ category, amount, percentage: pct }) => {
            const label = CATEGORIES.find(c => c.value === category)?.label || category
            const color = CATEGORY_COLORS[category] || '#6b7280'
            return (
              <div key={category} className="group">
                <div className="flex justify-between items-end mb-3 px-1">
                  <div>
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{label}</span>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-0.5">{pct.toFixed(1)}% of total burn</p>
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white tabular-nums">{formatCurrencyShort(amount)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80" 
                    style={{ width: `${pct}%`, backgroundColor: color }} />
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
