import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'react-toastify'
import { downloadExcel } from '../utils/exportExcel.js'

function ExportButton({ filename, sheetName, columns, rows, loadRows, disabled = false }) {
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (pending) return
    setPending(true)
    try {
      const data = typeof loadRows === 'function' ? await loadRows() : rows || []
      if (!data.length) {
        toast.info('Nothing to export.')
        return
      }
      downloadExcel({ filename, sheetName, columns, rows: data })
      toast.success('Excel file downloaded.')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not export this list.')
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download size={15} />
      {pending ? 'Exporting' : 'Export'}
    </button>
  )
}

export default ExportButton
