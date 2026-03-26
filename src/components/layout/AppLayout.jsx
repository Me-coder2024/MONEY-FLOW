import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Toast from '../ui/Toast'
import { useApp } from '../../context/AppContext'

export default function AppLayout() {
  const { toasts } = useApp()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50/80 dark:bg-slate-950 transition-colors duration-300 gradient-mesh">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-64 w-full min-w-0">
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-3 sm:p-5 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast message={t.message} type={t.type} />
          </div>
        ))}
      </div>
    </div>
  )
}
