export const movementTypes = ['Purchase', 'Sale', 'Transfer', 'Adjustment']

export const movements = [
  movement('2026-10-21T09:42:00', 'GRN-1042', 'Arabica Coffee 1 kg', 'Main Warehouse', 'Purchase', 120, 'bag', 45600, 'Sara Noor', 'Central Branch'),
  movement('2026-10-21T10:15:00', 'INV-2201', 'Sparkling Water 330 ml', 'Central Branch', 'Sale', -48, 'case', 18240, 'Sara Noor', 'Central Branch'),
  movement('2026-10-21T11:05:00', 'TRF-118', 'White Milk 1L', 'Main Warehouse', 'Transfer', -24, 'carton', 7200, 'Ali Khan', 'Central Branch'),
  movement('2026-10-21T11:40:00', 'ADJ-019', 'Green Tea 100g', 'Central Branch', 'Adjustment', -6, 'box', 1140, 'Ali Khan', 'Central Branch'),
  movement('2026-10-21T12:18:00', 'INV-2208', 'Brown Sugar 1 kg', 'Central Branch', 'Sale', -36, 'bag', 4320, 'Sara Noor', 'Central Branch'),
  movement('2026-10-21T13:02:00', 'GRN-1048', 'Basmati Rice 5 kg', 'Main Warehouse', 'Purchase', 80, 'bag', 64000, 'Ali Khan', 'Central Branch'),
  movement('2026-10-21T13:46:00', 'TRF-121', 'Cooking Oil 1L', 'Main Warehouse', 'Transfer', 18, 'carton', 5400, 'Sara Noor', 'Central Branch'),
  movement('2026-10-21T14:20:00', 'ADJ-022', 'Black Pepper 100g', 'Main Warehouse', 'Adjustment', 4, 'box', 960, 'Ali Khan', 'Central Branch'),
  movement('2026-10-21T15:05:00', 'INV-2214', 'Arabica Coffee 1 kg', 'Central Branch', 'Sale', -15, 'bag', 5700, 'Sara Noor', 'Central Branch'),
  movement('2026-10-21T15:48:00', 'GRN-1051', 'Sparkling Water 330 ml', 'Main Warehouse', 'Purchase', 60, 'case', 22800, 'Ali Khan', 'Central Branch'),
]

function movement(postedAt, reference, product, location, type, qty, unit, value, user, branch) {
  return {
    id: reference,
    postedAt,
    date: postedAt.slice(0, 10),
    reference,
    product,
    location,
    type,
    qty,
    unit,
    value,
    user,
    branch,
  }
}

export function todayInput() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function formatPosted(value) {
  const [datePart, timePart = '00:00:00'] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPkr(value) {
  return `PKR ${Number(value).toLocaleString('en-US')}`
}
