"use client"


import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Trophy, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { loginSchema } from "@/lib/validations"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Validation
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid credentials")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(13,148,136,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-14 h-14 bg-surface-900 rounded-[1.25rem] flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
              <Trophy className="text-white w-8 h-8" />
            </div>
          </Link>
          <h1 className="text-4xl font-extrabold text-surface-900 mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-surface-500 font-medium">Sign in to manage your scores and draws.</p>
        </div>

        <Card className="p-10 border-surface-200 shadow-2xl bg-white rounded-[2rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-surface-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input 
                  type="email" 
                  name="email" 
                  required
                  placeholder="name@example.com" 
                  className="w-full bg-white border border-surface-200 rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-surface-900 font-medium placeholder:text-surface-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-surface-400 uppercase tracking-widest">Password</label>
                <Link href="/reset-password" title="Coming soon" className="text-[10px] font-black uppercase tracking-wider text-brand-600 hover:text-brand-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input 
                  type="password" 
                  name="password" 
                  required
                  placeholder="••••••••" 
                  className="w-full bg-white border border-surface-200 rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-surface-900 font-medium placeholder:text-surface-300"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 text-sm font-extrabold shadow-lg shadow-brand-500/20" isLoading={loading}>
              Sign In <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="mt-10 text-center text-sm font-medium">
            <span className="text-surface-500 text-xs">New to GolfDraw?</span>{" "}
            <Link href="/signup" className="text-brand-600 font-extrabold ml-1 hover:text-brand-700 underline underline-offset-4">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
