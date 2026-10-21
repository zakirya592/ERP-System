import { ChevronDown } from 'lucide-react'

export function CategoryForm({ form, errors, parents, update }) {
  return (
    <>
      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Category details</h2>
        <p className="mt-0.5 text-xs text-slate-400">Product category identity and description</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Unique category code"
            required
            value={form.code}
            error={errors.code}
            placeholder="e.g. CAT-TEA"
            hint="Use a unique code across the product category register."
            onChange={(value) => update('code', value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
          />
          <Field
            label="Category name"
            required
            value={form.name}
            error={errors.name}
            placeholder="e.g. Tea"
            hint="Enter a clear name for this group of products."
            onChange={(value) => update('name', value)}
          />
          <label className="block md:col-span-2">
            <span className="text-sm text-slate-700">Description (optional)</span>
            <input
              value={form.description}
              placeholder="e.g. Loose leaf tea, tea bags, and herbal infusions"
              onChange={(event) => update('description', event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Hierarchy & status</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Choose where this category belongs and whether it is available for product classification
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-700">Parent category (optional)</span>
            <span className="relative mt-1.5 block">
              <select
                value={form.parentId}
                onChange={(event) => update('parentId', event.target.value)}
                className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-sky-400 ${
                  errors.parentId ? 'border-rose-300' : 'border-slate-200'
                } ${form.parentId ? 'text-slate-800' : 'text-slate-400'}`}
              >
                <option value="">Select a parent category</option>
                {parents.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.code ? `${item.name} (${item.code})` : item.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400" />
            </span>
            {errors.parentId ? (
              <p className="mt-1 text-xs text-rose-500">{errors.parentId}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Leave empty to create a top-level category. Select an existing category to create a child beneath it.
              </p>
            )}
          </label>

          <fieldset>
            <legend className="text-sm text-slate-700">
              Status <span className="text-rose-500">*</span>
            </legend>
            <div className="mt-2.5 flex items-center gap-5">
              {[
                ['active', 'Active'],
                ['inactive', 'Inactive'],
              ].map(([value, label]) => (
                <label key={value} className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="category-status"
                    value={value}
                    checked={form.status === value}
                    onChange={() => update('status', value)}
                    className="size-4 accent-[#2f6fed]"
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">Active categories are available to classify products.</p>
          </fieldset>
        </div>

        <div className="mt-4 rounded-xl bg-[#f4f7fb] px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">Parent & child classification</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            A child category is grouped under its selected parent. A category cannot be its own parent; keep the hierarchy free of circular links.
          </p>
        </div>
        <div className="mt-3 rounded-xl bg-[#eaf3ff] px-4 py-3">
          <p className="text-sm font-semibold text-[#2f6fed]">Classification only</p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Saving a category classifies products and does not post inventory movements or accounting transactions. Categories are shared across branches.
          </p>
        </div>
      </section>
    </>
  )
}

function Field({ label, required = false, value, error, hint, placeholder, onChange }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-400 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
      />
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </label>
  )
}
