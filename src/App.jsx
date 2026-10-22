import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import AskPage from './pages/AskPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import { ADMIN_PATH } from './auth.js'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AskPage />} />
        {ADMIN_PATH && <Route path={ADMIN_PATH} element={<AdminPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
