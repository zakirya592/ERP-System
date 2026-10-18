import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Building2, ChevronDown, LogOut } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../queries/auth/auth.queries'
import { sidebarMenu } from './sidebarMenu.js'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

function userFromResponse(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.user?.name || payload.user?.email) return payload.user
  if (payload.data?.user?.name || payload.data?.user?.email) return payload.data.user
  if (payload.data?.name || payload.data?.email) return payload.data
  if (payload.name || payload.email) return payload
  return null
}

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'U'
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function matchesPath(to, pathname) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

function groupKeyForPath(pathname) {
  return (
    sidebarMenu.find((item) =>
      item.children?.some((child) => matchesPath(child.to, pathname)),
    )?.key || ''
  )
}

function Sidebar({ open, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const accountRef = useRef(null)
  const { data } = useCurrentUser()
  const user = userFromResponse(data) || readStoredUser()
  const name = user?.name || 'Administrator'
  const detail = user?.email || 'System admin'
  const [openKey, setOpenKey] = useState(() => groupKeyForPath(location.pathname))
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    const key = groupKeyForPath(location.pathname)
    if (key) setOpenKey(key)
    setAccountOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!accountOpen) return

    function closeAccount(event) {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false)
    }

    document.addEventListener('mousedown', closeAccount)
    return () => document.removeEventListener('mousedown', closeAccount)
  }, [accountOpen])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    queryClient.clear()
    setAccountOpen(false)
    onClose?.()
    navigate('/', { replace: true })
  }

  function toggleGroup(key) {
    setOpenKey((current) => (current === key ? '' : key))
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden ${open ? 'block' : 'hidden'}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[260px] shrink-0 flex-col overflow-hidden bg-[#0c1322] text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#1c2942] text-xs font-semibold tracking-wide text-white">
            EA
          </span>
          <p className="text-sm font-semibold tracking-[0.14em] text-white">ERP ADMIN</p>
        </div>

        <nav className="sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {sidebarMenu.map((item) => {
            const Icon = item.icon
            const isOpen = openKey === item.key
            const childActive = item.children?.some((child) =>
              matchesPath(child.to, location.pathname),
            )

            if (!item.children) {
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              )
            }

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium ${
                    childActive || isOpen
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-1 space-y-0.5 pb-1 pl-4">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] ${
                            isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={`size-1.5 rounded-full ${
                                isActive ? 'bg-sky-400' : 'bg-slate-600'
                              }`}
                            />
                            {child.label}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-slate-300">
              <Building2 size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-white">Central Branch</p>
              <p className="truncate text-xs text-slate-500">Main Warehouse</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              Online
            </span>
          </div>

          <div ref={accountRef} className="relative">
            {accountOpen && (
              <div className="absolute right-0 bottom-full left-0 z-20 mb-2 overflow-hidden rounded-lg border border-white/10 bg-[#162033] py-1 shadow-lg">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-slate-200 hover:bg-white/5"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setAccountOpen((current) => !current)}
              className="flex w-full items-center gap-3 rounded-lg text-left"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[#1d4ed8] text-[11px] font-semibold text-white">
                {initials(name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-white">{name}</span>
                <span className="block truncate text-xs text-slate-500">{detail}</span>
              </span>
              <ChevronDown
                size={14}
                className={`shrink-0 text-slate-500 transition-transform ${accountOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
