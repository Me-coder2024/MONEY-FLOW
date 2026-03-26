export default function Toast({ message, type = 'success' }) {
  const styles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-600 text-white',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${styles[type]}`}>
      <span className="text-base">{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}
