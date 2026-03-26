import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import FundsList from './pages/FundsList'
import FundDetail from './pages/FundDetail'
import FundCreate from './pages/FundCreate'
import DepositsList from './pages/DepositsList'
import DepositNew from './pages/DepositNew'
import WithdrawalsList from './pages/WithdrawalsList'
import WithdrawalNew from './pages/WithdrawalNew'
import WithdrawalDetail from './pages/WithdrawalDetail'
import ApprovalQueue from './pages/ApprovalQueue'
import FoundersList from './pages/FoundersList'
import ReportSpending from './pages/ReportSpending'
import ReportCompliance from './pages/ReportCompliance'
import AuditLog from './pages/AuditLog'
import Settings from './pages/Settings'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="funds" element={<FundsList />} />
              <Route path="funds/create" element={<FundCreate />} />
              <Route path="funds/:id" element={<FundDetail />} />
              <Route path="deposits" element={<DepositsList />} />
              <Route path="deposits/new" element={<DepositNew />} />
              <Route path="withdrawals" element={<WithdrawalsList />} />
              <Route path="withdrawals/new" element={<WithdrawalNew />} />
              <Route path="withdrawals/pending" element={<ApprovalQueue />} />
              <Route path="withdrawals/:id" element={<WithdrawalDetail />} />
              <Route path="founders" element={<FoundersList />} />
              <Route path="reports" element={<ReportSpending />} />
              <Route path="reports/compliance" element={<ReportCompliance />} />
              <Route path="audit-log" element={<AuditLog />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
  )
}
