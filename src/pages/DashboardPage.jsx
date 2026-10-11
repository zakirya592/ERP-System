import { Button, Card } from '@heroui/react'
import { motion } from 'framer-motion'
import { Boxes, ClipboardList, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import GlobalTable from '../components/GlobalTable.jsx'

const modules = [
  {
    title: 'Inventory',
    description: 'Track stock, warehouses, and product movement.',
    icon: Boxes,
  },
  {
    title: 'Orders',
    description: 'Follow purchases, sales, and fulfillment.',
    icon: ClipboardList,
  },
  {
    title: 'People',
    description: 'Keep customers, vendors, and staff in one place.',
    icon: Users,
  },
]

const orderColumns = [
  { key: 'id', label: 'Order', isRowHeader: true },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total', className: 'text-right', cellClassName: 'text-right' },
]

const orders = [
  { id: 'ORD-1048', customer: 'Northwind', status: 'Packed', total: '$1,240' },
  { id: 'ORD-1047', customer: 'Acme Foods', status: 'Shipped', total: '$860' },
  { id: 'ORD-1046', customer: 'Harbor Supply', status: 'Pending', total: '$2,015' },
  { id: 'ORD-1045', customer: 'Lumen Retail', status: 'Packed', total: '$430' },
  { id: 'ORD-1044', customer: 'Cedar Mills', status: 'Delivered', total: '$1,780' },
  { id: 'ORD-1043', customer: 'Brightline', status: 'Shipped', total: '$690' },
  { id: 'ORD-1042', customer: 'Oak & Co', status: 'Pending', total: '$955' },
  { id: 'ORD-1041', customer: 'Fieldstone', status: 'Delivered', total: '$1,120' },
]

function DashboardPage() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="max-w-xl text-zinc-600">
            React, JavaScript, and Tailwind are ready. HeroUI, routing, data
            fetching, and toasts are wired in so you can start building modules.
          </p>
        </div>
        <Button
          onPress={() => toast.success('Notifications are ready.')}
        >
          Test notification
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon

          return (
            <Card key={module.title}>
              <Card.Header>
                <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800">
                  <Icon size={18} />
                </span>
                <Card.Title>{module.title}</Card.Title>
                <Card.Description>{module.description}</Card.Description>
              </Card.Header>
            </Card>
          )
        })}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Recent orders</h2>
        <GlobalTable
          ariaLabel="Recent orders"
          columns={orderColumns}
          data={orders}
          pagination
          rowsPerPage={5}
        />
      </div>
    </motion.section>
  )
}

export default DashboardPage
