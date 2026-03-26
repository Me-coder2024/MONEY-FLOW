import { useApp } from '../context/AppContext'

export default function Settings() {
  const { currentUser } = useApp()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, team, and company settings</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full gradient-indigo flex items-center justify-center text-white text-2xl font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{currentUser.name}</p>
            <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" defaultValue={currentUser.name}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" defaultValue="admin@company.in"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Company Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input type="text" defaultValue="My Startup Pvt Ltd"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company GSTIN</label>
            <input type="text" defaultValue="27AAPFU0939F1ZV" placeholder="15 digit GSTIN"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea rows={2} defaultValue="Pune, Maharashtra, India 411001"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" />
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Role Permissions</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
              <th className="text-left py-2">Action</th>
              <th className="text-center py-2">Admin</th>
              <th className="text-center py-2">Manager</th>
              <th className="text-center py-2">Member</th>
              <th className="text-center py-2">Viewer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-600">
            {[
              ['Add Fund', true, false, false, false],
              ['Deposit', true, true, false, false],
              ['Request Withdrawal', true, true, true, false],
              ['Approve Withdrawal', true, true, false, false],
              ['Upload Bill', true, true, true, false],
              ['View Reports', true, true, true, true],
              ['Export Data', true, true, false, false],
              ['Audit Log', true, false, false, false],
            ].map(([action, ...perms]) => (
              <tr key={action}>
                <td className="py-2 font-medium">{action}</td>
                {perms.map((p, i) => <td key={i} className="text-center py-2">{p ? '✅' : '❌'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl shadow-sm transition-all hover:shadow-md">
        Save Changes
      </button>
    </div>
  )
}
