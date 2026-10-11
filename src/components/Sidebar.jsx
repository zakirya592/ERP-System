import { useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { sidebarMenu } from './sidebarMenu.js'

function Sidebar({ open, onClose }) {
  const location = useLocation()
  const [openKey, setOpenKey] = useState('')

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
            const childActive = item.children?.some((child) => child.to === location.pathname)

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

          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#1d4ed8] text-[11px] font-semibold text-white">
              AD
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-white">Administrator</p>
              <p className="truncate text-xs text-slate-500">System admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
