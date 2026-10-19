import { useEffect, useState } from 'react'
import { Pagination, Table } from '@heroui/react'

function GlobalTable({
  columns = [],
  data = [],
  pagination = false,
  rowsPerPage = 5,
  ariaLabel = 'Table',
  className = '',
  rowClassName = 'border-b border-slate-100 last:border-b-0 hover:bg-slate-50',
  onRowPress,
  emptyContent = 'No data available',
  totalCount = undefined,
  page: pageProp = undefined,
  onPageChange = undefined,
  summary,
  contentClassName = 'min-w-300',
}) {
  const [internalPage, setInternalPage] = useState(1)

  const isServerSide =
    typeof totalCount === 'number' ||
    typeof pageProp === 'number' ||
    typeof onPageChange === 'function'

  const effectiveTotal = typeof totalCount === 'number' ? totalCount : data.length
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / rowsPerPage))
  const effectivePage = typeof pageProp === 'number' ? pageProp : internalPage

  useEffect(() => {
    if (!isServerSide) setInternalPage(1)
  }, [data.length, rowsPerPage, isServerSide])

  useEffect(() => {
    if (effectivePage > totalPages) {
      if (onPageChange) onPageChange(totalPages)
      else setInternalPage(totalPages)
    }
  }, [effectivePage, totalPages, onPageChange])

  const startIndex = (effectivePage - 1) * rowsPerPage
  const paginatedData = pagination
    ? isServerSide
      ? data
      : data.slice(startIndex, startIndex + rowsPerPage)
    : data

  const start = effectiveTotal === 0 ? 0 : startIndex + 1
  const end =
    effectiveTotal === 0 ? 0 : Math.min(startIndex + rowsPerPage, effectiveTotal)

  function getVisiblePages() {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    if (effectivePage <= 3) {
      return [1, 2, 3, 4, 'ellipsis-end', totalPages]
    }

    if (effectivePage >= totalPages - 2) {
      return [1, 'ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [
      1,
      'ellipsis-start',
      effectivePage - 1,
      effectivePage,
      effectivePage + 1,
      'ellipsis-end',
      totalPages,
    ]
  }

  const visiblePages = getVisiblePages()

  return (
    <Table className={`h-88 max-h-88 w-full overflow-auto bg-white px-3 pt-2 pb-3 ${className}`}>
      <Table.ScrollContainer className="overflow-x-auto">
        <Table.Content aria-label={ariaLabel} className={contentClassName}>
          <Table.Header className="bg-white">
            {columns.map((column) => (
              <Table.Column
                key={column.key}
                isRowHeader={column.isRowHeader || false}
                className={`px-2 py-1.5 font-bold text-tertiary ${
                  /\btext-(left|center|right|start|end)\b/.test(column.className || '')
                    ? ''
                    : 'text-left'
                } ${column.className || ''}`}
              >
                {column.label}
              </Table.Column>
            ))}
          </Table.Header>

          <Table.Body
            items={paginatedData}
            dependencies={[rowClassName]}
            renderEmptyState={() => (
              <div className="flex min-h-50 w-full items-center justify-center text-center text-sm text-slate-500">
                {emptyContent}
              </div>
            )}
          >
            {(item) => (
              <Table.Row
                key={item.id || item.key}
                className={typeof rowClassName === 'function' ? rowClassName(item) : rowClassName}
                onAction={onRowPress ? () => onRowPress(item) : undefined}
              >
                {columns.map((column) => (
                  <Table.Cell
                    key={column.key}
                    className={`px-2 py-2 ${column.cellClassName || ''}`}
                  >
                    {column.renderCell ? (
                      column.renderCell(item)
                    ) : (
                      <span className="text-[12px] text-tertiary">{item[column.key]}</span>
                    )}
                  </Table.Cell>
                ))}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>

      {pagination && effectiveTotal > 0 && (
        <Table.Footer>
          <Pagination size="sm">
            <Pagination.Summary>
              {summary || `${start} to ${end} of ${effectiveTotal} results`}
            </Pagination.Summary>

            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={effectivePage === 1}
                  onPress={() => {
                    const next = Math.max(1, effectivePage - 1)
                    if (onPageChange) onPageChange(next)
                    else setInternalPage(next)
                  }}
                >
                  <Pagination.PreviousIcon />
                  Prev
                </Pagination.Previous>
              </Pagination.Item>

              {visiblePages.map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                  return (
                    <Pagination.Item key={`${page}-${index}`}>
                      <span className="px-2 text-sm text-slate-400">...</span>
                    </Pagination.Item>
                  )
                }

                return (
                  <Pagination.Item key={page}>
                    <Pagination.Link
                      isActive={page === effectivePage}
                      onPress={() => {
                        if (onPageChange) onPageChange(page)
                        else setInternalPage(page)
                      }}
                      className={page === effectivePage ? 'bg-[#0f4bb8] text-white' : ''}
                    >
                      {page}
                    </Pagination.Link>
                  </Pagination.Item>
                )
              })}

              <Pagination.Item>
                <Pagination.Next
                  isDisabled={effectivePage === totalPages}
                  onPress={() => {
                    const next = Math.min(totalPages, effectivePage + 1)
                    if (onPageChange) onPageChange(next)
                    else setInternalPage(next)
                  }}
                >
                  Next
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </Table.Footer>
      )}
    </Table>
  )
}

export default GlobalTable
