export const FUND_TYPES = ['sarkari', 'grant', 'revenue']

export const FUND_LABELS = {
  sarkari: 'Sarkari Fund',
  grant: 'Grant Money',
  revenue: 'Company Revenue',
}

export const FUND_ICONS = {
  sarkari: '💼',
  grant: '🏛️',
  revenue: '💹',
}

export const FUND_COLORS = {
  sarkari: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    fill: 'bg-blue-500',
    light: 'bg-blue-100',
    hex: '#3b82f6',
  },
  grant: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    fill: 'bg-emerald-500',
    light: 'bg-emerald-100',
    hex: '#10b981',
  },
  revenue: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    fill: 'bg-purple-500',
    light: 'bg-purple-100',
    hex: '#8b5cf6',
  },
}

export const CATEGORIES = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'salary', label: 'Salary' },
  { value: 'rent', label: 'Rent' },
  { value: 'travel', label: 'Travel' },
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'software', label: 'Software' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
]

export const GST_RATES = [0, 5, 12, 18, 28]

export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected']

export const STATUS_COLORS = {
  approved: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
}

export const ROLES = ['admin', 'manager', 'member', 'viewer']

export const CATEGORY_COLORS = {
  equipment: '#6366f1',
  salary: '#f59e0b',
  rent: '#10b981',
  travel: '#3b82f6',
  raw_material: '#ef4444',
  software: '#8b5cf6',
  marketing: '#ec4899',
  utilities: '#14b8a6',
  consulting: '#f97316',
  miscellaneous: '#6b7280',
}
