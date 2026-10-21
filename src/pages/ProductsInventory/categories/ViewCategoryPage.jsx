import { ChevronRight } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProductCategories, useProductCategory } from '../../../queries/productCategories/productCategories.queries.js'
import { formatWhen, parentIdOf, statusLabel } from '../../MasterData/ProductCategories/categoryRecords.js'
import { CategoryPageHeader } from './AddCategoryPage.jsx'

function parentRecord(category, categories) {
  const parentId = parentIdOf(category)
  if (!parentId) return null
  return categories.find((item) => item._id === parentId) || null
}

function ViewCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categoryQuery = useProductCategory(id)
  const categoriesQuery = useProductCategories({ page: 1, limit: 100, search: '', status: '' })
  const record = categoryQuery.data?.data
  const categories = categoriesQuery.data?.data || []
  const parent = record ? parentRecord(record, categories) : null
  const children = record ? categories.filter((item) => parentIdOf(item) === record._id) : []
  const segments = parent ? [parent, record] : record ? [record] : []
  const active = record?.status === 'active'

  return (
    <div className="space-y-4">
      <CategoryPageHeader
        title={record?.name || 'Category'}
        subtitle={
          record
            ? `${record.code || 'No code'}${parent ? ` · Child of ${parent.name}` : ' · Top-level category'}`
            : 'Category identity, parent, and status.'
        }
        action={
          record ? (
            <button
              type="button"
              onClick={() => navigate(`/products/categories/${record._id}/edit`)}
              className="cursor-pointer rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-medium text-white"
            >
              Update Category
            </button>
          ) : null
        }
      />

      {categoryQuery.isLoading && <Panel>Loading category...</Panel>}
    
      {record && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Status" value={statusLabel(record.status)} hint={active ? 'Available for classification' : 'Hidden from new classification'} />
            <Stat label="Parent" value={parent ? parent.name : 'Top-level'} hint={parent ? parent.code : 'No parent category'} />
            <Stat label="Child categories" value={String(children.length)} hint={children.length ? 'Grouped under this category' : 'No child categories'} />
            <Stat label="Updated" value={formatWhen(record.updatedAt)} hint={`Created ${formatWhen(record.createdAt)}`} />
          </section>

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">Category details</h2>
                <p className="mt-0.5 text-xs text-slate-400">Product category identity and description</p>
                <dl className="mt-4 grid gap-4 md:grid-cols-2">
                  <Fact label="Unique category code" value={record.code} mono />
                  <Fact label="Category name" value={record.name} />
                  <div className="md:col-span-2">
                    <dt className="text-[13px] text-slate-400">Description</dt>
                    <dd className={`mt-0.5 text-sm leading-6 ${record.description ? 'text-slate-800' : 'text-slate-400'}`}>
                      {record.description || 'Not recorded'}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">Hierarchy & status</h2>
                <p className="mt-0.5 text-xs text-slate-400">Where this category sits and whether it can classify products</p>
                <dl className="mt-4 grid gap-4 md:grid-cols-2">
                  <Fact label="Parent category" value={parent ? parent.name : 'Top-level category'} />
                  <div>
                    <dt className="text-[13px] text-slate-400">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-medium ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {statusLabel(record.status)}
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-xl bg-[#f4f7fb] px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">Parent & child classification</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {segments.map((segment, index) => (
                      <span key={segment._id} className="inline-flex items-center gap-1">
                        {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
                        {segment._id === record._id ? (
                          <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-800">{segment.name}</span>
                        ) : (
                          <Link to={`/products/categories/${segment._id}`} className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-[#2f6fed]">
                            {segment.name}
                          </Link>
                        )}
                      </span>
                    ))}
                  </div>
                  {children.length > 0 ? (
                    <ul className="mt-3 divide-y divide-slate-200/80">
                      {children.map((child) => (
                        <li key={child._id} className="flex items-center justify-between gap-3 py-2">
                          <Link to={`/products/categories/${child._id}`} className="text-sm font-medium text-slate-800">
                            {child.name}
                          </Link>
                          <span className="font-mono text-[12px] text-slate-400">{child.code}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No child categories.</p>
                  )}
                </div>

                <div className="mt-3 rounded-xl bg-[#eaf3ff] px-4 py-3">
                  <p className="text-sm font-semibold text-[#2f6fed]">Classification only</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    This category classifies products and does not post inventory movements or accounting transactions. Categories are shared across branches.
                  </p>
                </div>
              </section>
            </div>

            <aside className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
              <p className="font-mono text-[13px] text-slate-400">{record.code || 'No code'}</p>
              <h2 className="mt-1 text-[18px] font-semibold text-slate-900">{record.name}</h2>
              <p className="mt-3 text-sm text-slate-500">
                {active ? 'Available when classifying products.' : 'Hidden from new products until it is set active.'}
              </p>
              <dl className="mt-5 space-y-3.5 text-sm">
                <div>
                  <dt className="text-slate-400">Parent</dt>
                  <dd className="font-medium text-slate-800">{parent ? `${parent.name} (${parent.code})` : 'Top-level category'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Created</dt>
                  <dd className="font-medium text-slate-800">{formatWhen(record.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Updated</dt>
                  <dd className="font-medium text-slate-800">{formatWhen(record.updatedAt)}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-[22px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </article>
  )
}

function Fact({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-[13px] text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-sm font-medium text-slate-800 ${mono ? 'font-mono text-[13px] text-slate-600' : ''}`}>{value}</dd>
    </div>
  )
}

function Panel({ children, className = 'text-slate-400' }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white px-5 py-8 text-sm shadow-sm ${className}`}>
      {children}
    </section>
  )
}

export default ViewCategoryPage
