import { useLocation, useNavigate } from 'react-router-dom'
import { sidebarMenu } from '../../components/sidebarMenu.js'

const tabs = sidebarMenu.find((item) => item.key === 'users')?.children || []

function SecurityTabs() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const selected = pathname === tab.to || pathname.startsWith(`${tab.to}/`)
        return (
          <button
            key={tab.to}
            type="button"
            onClick={() => navigate(tab.to)}
            className={
              selected
                ? 'cursor-pointer rounded-lg bg-[#e8f1ff] px-3 py-1.5 text-sm font-medium text-[#2f6fed] shadow-sm'
                : 'cursor-pointer rounded-lg bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm hover:bg-white'
            }
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default SecurityTabs
