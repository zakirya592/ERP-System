import { useState } from 'react'
import { Button, FieldError, Form, Input, Label, TextField } from '@heroui/react'
import { motion } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import loginVisual from '../../assets/login-visual.jpg'

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    toast.success('Signed in')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <section className="relative h-72 overflow-hidden lg:h-auto lg:min-h-screen">
        <img
          src={loginVisual}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20" />
        <div className="relative flex h-full flex-col justify-between p-6 text-white sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <LayoutDashboard size={18} />
            </span>
            <p className="text-sm font-semibold tracking-tight">ERP System</p>
          </div>
          <div className="max-w-md space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              One workspace for the work that keeps the business moving.
            </h1>
            <p className="text-sm text-white/80 sm:text-base">
              Inventory, orders, and people, kept in the same place.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">Sign in</h2>
            <p className="text-zinc-500">
              Enter your work email and password to continue.
            </p>
          </div>

          <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <TextField name="email" type="email" isRequired fullWidth>
              <Label>Email</Label>
              <Input placeholder="you@company.com" autoComplete="email" />
              <FieldError />
            </TextField>

            <TextField
              name="password"
              type={showPassword ? 'text' : 'password'}
              isRequired
              minLength={6}
              fullWidth
            >
              <div className="flex items-center justify-between gap-3">
                <Label>Password</Label>
                <button
                  type="button"
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <Input
                placeholder="At least 6 characters"
                autoComplete="current-password"
              />
              <FieldError />
            </TextField>

            <Button type="submit" fullWidth>
              Sign in
            </Button>
          </Form>
        </motion.div>
      </section>
    </div>
  )
}

export default LoginPage
