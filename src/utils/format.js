/**
 * Formatting utilities for Indian currency, dates, and numbers
 */

export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function formatCurrencyShort(amount) {
  const num = parseFloat(amount) || 0
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(1) + 'Cr'
  if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L'
  if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + 'K'
  return formatCurrency(num)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function daysLeft(endDate) {
  if (!endDate) return null
  const now = new Date()
  const end = new Date(endDate)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

export function percentage(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 1000) / 10
}
