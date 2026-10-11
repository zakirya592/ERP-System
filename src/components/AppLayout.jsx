import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef3f8] text-zinc-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-scroll flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100"
          >
            <Menu size={18} />
          </button>
          <p className="text-sm font-semibold tracking-wide">ERP ADMIN</p>
        </header>
        <main className="flex-1 px-5 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
