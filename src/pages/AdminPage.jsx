import { useCallback, useEffect, useMemo, useState } from 'react'
import { getQuestions } from '../api.js'
import { isLoggedIn, login } from '../auth.js'

// Read questions are tracked per browser (the API has no "done" field).
const DONE_KEY = 'done-questions'

function loadDone() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DONE_KEY)) || [])
  } catch {
    return new Set()
  }
}

function saveDone(done) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify([...done]))
  } catch {
    // storage unavailable; keep in memory only
  }
}

const questionKey = (item) => String(item.id ?? `${item.name}|${item.created_at ?? item.createdAt}|${item.questions}`)

export default function AdminPage() {
  const [authed, setAuthed] = useState(isLoggedIn)

  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />
  return <QuestionsList />
}

function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(password)
    setLoading(false)
    if (ok) onSuccess()
    else setError('كلمة السر غلط')
  }

  return (
    <div className="animate-fade-up mx-auto max-w-sm">
      <form onSubmit={handleSubmit} className="card p-6 text-center sm:p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 dark:bg-blue-500/15">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-bold">لوحة المحاضر</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ادخل كلمة السر عشان تشوف الأسئلة</p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          placeholder="كلمة السر"
          className={`input mt-6 text-center ${error ? 'input-error' : ''}`}
        />
        {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <button type="submit" disabled={loading || !password} className="btn-primary mt-5 w-full">
          دخول
        </button>
      </form>
    </div>
  )
}

function QuestionsList() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('new')
  const [done, setDone] = useState(loadDone)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setQuestions(await getQuestions())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleDone = (key) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      saveDone(next)
      return next
    })
  }

  const { newList, doneList } = useMemo(() => {
    const list = [...questions].reverse() // newest first
    return {
      newList: list.filter((item) => !done.has(questionKey(item))),
      doneList: list.filter((item) => done.has(questionKey(item))),
    }
  }, [questions, done])

  const shown = tab === 'new' ? newList : doneList

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">أسئلة الطلاب</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {loading ? 'جاري التحميل...' : `${questions.length} سؤال`}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="btn-ghost shrink-0" title="تحديث">
            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700/60 dark:bg-slate-800">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')} label="الأسئلة الجديدة" count={newList.length} />
        <TabButton active={tab === 'done'} onClick={() => setTab('done')} label="اتقرت" count={doneList.length} />
      </div>

      <div className="mt-6">
        {loading ? (
          <Skeletons />
        ) : error ? (
          <Empty title="مش قادرين نجيب الأسئلة" text={error} action={<button onClick={load} className="btn-primary">حاول تاني</button>} />
        ) : shown.length === 0 ? (
          tab === 'new' ? (
            <Empty
              title={questions.length ? 'خلصت كل الأسئلة' : 'لسه مفيش أسئلة'}
              text={questions.length ? 'مفيش أسئلة جديدة دلوقتي' : 'الأسئلة اللي الطلاب هيبعتوها هتظهر هنا'}
            />
          ) : (
            <Empty title="مفيش أسئلة اتقرت لسه" text="علّم على السؤال بعد ما تقراه وهيظهر هنا" />
          )
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((item) => {
              const key = questionKey(item)
              return <QuestionCard key={key} item={item} done={done.has(key)} onToggle={() => toggleDone(key)} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {label}
      <span className={`rounded-full px-2 text-xs ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>{count}</span>
    </button>
  )
}

function QuestionCard({ item, done, onToggle }) {
  const name = item.name || 'مجهول'
  const date = formatDate(item.created_at ?? item.createdAt)

  return (
    <article className={`card p-5 ${done ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
          {name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h3 dir="auto" className="truncate font-semibold">{name}</h3>
          {date && <p className="text-xs text-slate-400">{date}</p>}
        </div>
        <button
          onClick={onToggle}
          title={done ? 'رجّعه للجديد' : 'اتقرا'}
          aria-pressed={done}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition ${
            done
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 text-slate-300 hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-600 dark:text-slate-600'
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </button>
      </div>
      <p
        dir="auto"
        className={`mt-3 leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300 ${done ? 'line-through' : ''}`}
      >
        {item.questions}
      </p>
    </article>
  )
}

function Skeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card animate-pulse p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-28 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="mt-4 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2.5 h-3 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

function Empty({ title, text, action }) {
  return (
    <div className="card mx-auto max-w-md px-6 py-12 text-center">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
}
