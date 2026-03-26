import { useApp } from '../context/AppContext'

export default function Settings() {
  const { currentUser } = useApp()

  const permissions = [
    ['Add Fund', true, false, false, false],
    ['Deposit', true, true, false, false],
    ['Request Withdrawal', true, true, true, false],
    ['Approve Withdrawal', true, true, false, false],
    ['Upload Bill', true, true, true, false],
    ['View Reports', true, true, true, true],
    ['Export Data', true, true, false, false],
    ['Audit Log', true, false, false, false],
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20 px-4 md:px-0">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">System Configuration</h1>
        <p className="text-gray-500 dark:text-slate-400 font-medium">Manage institutional identity, team permissions, and security protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Profile Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
              <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">
                {currentUser?.name?.charAt(0)}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{currentUser?.name}</h3>
                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">Authorized {currentUser?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Legal Full Name" value={currentUser?.name} />
              <Input label="Institutional Email" value="admin@company.in" type="email" />
            </div>
          </div>

          {/* Company Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 md:p-12">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-10">Institutional Identity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Organization Designation" value="My Startup Pvt Ltd" />
              <Input label="Tax Identity (GSTIN)" value="27AAPFU0939F1ZV" />
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Headquarters Address</label>
                <textarea rows={3} defaultValue="Pune, Maharashtra, India 411001"
                  className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Security Permissions */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700/50 p-8 overflow-hidden">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-8">Governance Matrix</h4>
            <div className="overflow-x-auto -mx-8 px-8">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                    <th className="pb-4">Operation</th>
                    <th className="pb-4 text-center">Adm</th>
                    <th className="pb-4 text-center">Mng</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(([action, admin, manager]) => (
                    <tr key={action} className="group hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-2 text-[11px] font-black text-gray-600 dark:text-slate-400 uppercase">{action}</td>
                      <td className="py-2 text-center text-xs">{admin ? '⚡' : '⬘'}</td>
                      <td className="py-2 text-center text-xs">{manager ? '⚡' : '⬘'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-8 pt-8 border-t border-gray-50 dark:border-slate-700/50 text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              * Matrix is read-only. Modification requires master-node authorization.
            </p>
          </div>

          <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">
            Commit System Changes ⚡
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, type = 'text' }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">{label}</label>
      <input type={type} defaultValue={value}
        className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
    </div>
  )
}
