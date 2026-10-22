import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="EraaSoft"
            className="h-12 w-12 rounded-xl bg-white object-contain p-0.5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <span className="text-lg font-bold">EraaSoft</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:py-12">
        <Outlet />
      </main>
    </div>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
  }

  return (
    <button onClick={toggle} className="btn-ghost h-10 w-10 !p-0" title={dark ? 'الوضع الفاتح' : 'الوضع الداكن'}>
      {dark ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
