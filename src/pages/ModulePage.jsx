import { useParams } from 'react-router-dom'
import { sidebarMenu } from '../components/sidebarMenu.js'

function ModulePage() {
  const { section, page } = useParams()
  const group = sidebarMenu.find((item) => item.key === section)
  const child = group?.children?.find((item) => item.key === page)

  return (
    <section className="space-y-2">
      <p className="text-sm text-zinc-500">{group?.label || 'Module'}</p>
      <h1 className="text-3xl font-semibold tracking-tight">{child?.label || 'Page'}</h1>
    </section>
  )
}

export default ModulePage
