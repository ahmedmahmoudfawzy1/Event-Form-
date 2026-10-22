import { useState } from 'react'
import { postQuestion } from '../api.js'

const MAX_QUESTION = 500
const SUBMITTED_KEY = 'question-submitted'

// Each student gets one question only; remembered on this device
function hasSubmitted() {
  try {
    return localStorage.getItem(SUBMITTED_KEY) === '1'
  } catch {
    return false
  }
}

export default function AskPage() {
  const [form, setForm] = useState({ name: '', questions: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(() => (hasSubmitted() ? 'success' : 'idle')) // idle | loading | success | error
  const [message, setMessage] = useState('')

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((errs) => ({ ...errs, [field]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'من فضلك اكتب اسمك'
    if (!form.questions.trim()) errs.questions = 'من فضلك اكتب سؤالك'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    try {
      await postQuestion({ name: form.name.trim(), questions: form.questions.trim() })
      try {
        localStorage.setItem(SUBMITTED_KEY, '1')
      } catch {}
      setStatus('success')
      setForm({ name: '', questions: '' })
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
      setErrors({ name: err.fields?.name?.[0], questions: err.fields?.questions?.[0] })
    }
  }

  return (
    <div className="animate-fade-up mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">عندك سؤال؟</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          اكتب اسمك وسؤالك وهيوصل للمحاضر مباشرةً
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        {status === 'success' ? (
          <SuccessState />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label="الاسم" error={errors.name}>
              <input
                type="text"
                dir="auto"
                value={form.name}
                onChange={update('name')}
                placeholder="اكتب اسمك"
                className={`input ${errors.name ? 'input-error' : ''}`}
              />
            </Field>

            <Field label="السؤال" error={errors.questions} hint={`${form.questions.length}/${MAX_QUESTION}`}>
              <textarea
                dir="auto"
                rows={5}
                maxLength={MAX_QUESTION}
                value={form.questions}
                onChange={update('questions')}
                placeholder="اكتب سؤالك هنا..."
                className={`input resize-none ${errors.questions ? 'input-error' : ''}`}
              />
            </Field>

            {status === 'error' && message && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                {message}
              </div>
            )}

            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3.5">
              {status === 'loading' ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال السؤال'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {hint && <span className="text-xs font-normal text-slate-400 tabular-nums">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-rose-600 dark:text-rose-400">{error}</span>}
    </label>
  )
}

function SuccessState() {
  return (
    <div className="animate-fade-up py-6 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
        <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-5 text-xl font-bold">وصلنا سؤالك، شكراً!</h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400">هيتم الرد عليه خلال المحاضرة.</p>
    </div>
  )
}
