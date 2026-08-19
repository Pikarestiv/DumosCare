import { useState } from 'react'
import { Activity, AlertTriangle, MessageCircle, Users } from 'lucide-react'
import { useLogin } from '../lib/hooks'

const HIGHLIGHTS = [
  { icon: MessageCircle, text: 'Patients check in over WhatsApp — no app to install' },
  { icon: AlertTriangle, text: 'Out-of-range readings are flagged and triaged automatically' },
  { icon: Users, text: 'One dashboard for every patient across every program' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('admin@dumoscare.test')
  const [password, setPassword] = useState('password')
  const login = useLogin()

  function handleSubmit(e) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-emerald-700 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-xl font-semibold">Dumos Care</span>
        </div>

        <div className="relative">
          <h2 className="mb-6 max-w-sm text-2xl font-semibold leading-snug">
            Remote patient monitoring, without asking patients to change how they communicate.
          </h2>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon size={14} />
                </div>
                <span className="text-sm text-emerald-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-emerald-100/70">
          A WhatsApp-first remote monitoring PoC for a single healthcare provider.
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-xl font-semibold text-slate-900">Dumos Care</span>
          </div>
          <h1 className="mb-1 text-lg font-semibold text-slate-900">Provider sign in</h1>
          <p className="mb-6 text-sm text-slate-500">Remote patient monitoring dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {login.isError && (
              <p className="text-sm text-red-600">Invalid email or password.</p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {login.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-400">Demo: admin@dumoscare.test / password</p>
        </div>
      </div>
    </div>
  )
}
