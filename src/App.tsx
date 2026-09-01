import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './lib/AppContext'
import { HomePage } from './pages/HomePage'
import { CallbackPage } from './pages/CallbackPage'
import { DevelopmentNoticeModal } from './components/DevelopmentNoticeModal'

const DEV_NOTICE_KEY = 'pt_dev_notice_dismissed'

export function App() {
  const [noticeOpen, setNoticeOpen] = useState(
    () => localStorage.getItem(DEV_NOTICE_KEY) !== 'true',
  )

  return (
    <AppProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/callback/:platform" element={<CallbackPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <DevelopmentNoticeModal
          open={noticeOpen}
          onClose={() => setNoticeOpen(false)}
        />
      </div>
    </AppProvider>
  )
}
