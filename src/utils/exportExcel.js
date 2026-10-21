import * as XLSX from 'xlsx'

const skippedKeys = new Set(['action', 'actions'])

function clean(value) {
  if (value == null || value === '—') return ''
  return value
}

export function cellValue(column, row) {
  if (typeof column.exportValue === 'function') return clean(column.exportValue(row))

  const value = row?.[column.key]
  if (value == null || value === '' || value === '—') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    return value
      .map((item) => (item && typeof item === 'object' ? item.name || item.code || '' : item))
      .filter(Boolean)
      .join(', ')
  }
  if (typeof value === 'object') return value.name || value.code || value.shortCode || ''
  return value
}

export function downloadExcel({ filename, sheetName = 'Export', columns = [], rows = [] }) {
  const exportable = columns.filter((column) => column.label && !skippedKeys.has(column.key))
  const header = exportable.map((column) => column.label)
  const body = rows.map((row) => exportable.map((column) => cellValue(column, row)))
  const sheet = XLSX.utils.aoa_to_sheet([header, ...body])
  sheet['!cols'] = header.map((label, index) => {
    const widest = body.reduce((width, row) => Math.max(width, String(row[index] ?? '').length), String(label).length)
    return { wch: Math.min(40, Math.max(12, widest + 2)) }
  })

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, String(sheetName).slice(0, 31) || 'Export')

  const day = new Date().toISOString().slice(0, 10)
  const base = String(filename || 'export').replace(/\.xlsx$/i, '')
  XLSX.writeFile(book, `${base}-${day}.xlsx`)
}

export async function fetchAllPages(request, params = {}) {
  const limit = 100
  const first = await request({ ...params, page: 1, limit })
  const rows = [...(first?.data || [])]
  const total = first?.meta?.total ?? rows.length
  const pages = Math.ceil(total / limit)

  for (let page = 2; page <= pages; page += 1) {
    const next = await request({ ...params, page, limit })
    rows.push(...(next?.data || []))
  }

  return rows
}
