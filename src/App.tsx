import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './lib/AppContext'
import { HomePage } from './pages/HomePage'
import { CallbackPage } from './pages/CallbackPage'

export function App() {
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
      </div>
    </AppProvider>
  )
}
