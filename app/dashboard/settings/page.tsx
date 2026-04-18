"use client"


import { PageLoader } from "@/components/ui/PageLoader"
import * as React from "react"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { CreditCard, ShieldCheck, Mail, User, Wallet, ArrowRight, Zap, CheckCircle2, Settings, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { stripe, PLANS } from '@/lib/stripe'

export default function SettingsPage() {
  const [profile, setProfile] = React.useState<any>(null)
  const [subscription, setSubscription] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [charityPct, setCharityPct] = React.useState(10)
  const [isSavingCharity, setIsSavingCharity] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const [profRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
      ])
      setProfile(profRes.data)
      setSubscription(subRes.data)
      if (profRes.data?.charity_contribution_pct) {
        setCharityPct(profRes.data.charity_contribution_pct)
      }
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleCheckout(planKey: string) {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey })
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        alert('Payment setup error: ' + (data.error || 'Unknown error occurred'))
        setIsProcessing(false)
      }
    } catch (e: any) {
      alert('Network error: ' + e.message)
      setIsProcessing(false)
    }
  }

  async function handlePortal() {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        alert('Billing portal error: ' + (data.error || 'Unknown error occurred'))
        setIsProcessing(false)
      }
    } catch (e: any) {
      alert('Network error: ' + e.message)
      setIsProcessing(false)
    }
  }

  async function handleUpdateCharity() {
    setIsSavingCharity(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ charity_contribution_pct: charityPct })
      .eq('id', profile.id)
    
    if (!error) {
      setProfile({ ...profile, charity_contribution_pct: charityPct })
      alert('Charity contribution updated successfully!')
    } else {
      alert('Error updating contribution: ' + error.message)
    }
    setIsSavingCharity(false)
  }

  if (loading) return <PageLoader text="Loading your settings..." />

  const isSubscribed = subscription?.status === 'active'

  return (
    <div className="space-y-12 pt-4 pb-20 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">Account Settings</h1>
          <p className="text-surface-500 font-medium leading-relaxed">Manage your subscription, billing, and profile information.</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* ── Subscription Status ────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 ml-1">Current Membership</h2>
          <Card padding="none" className={cn(
            "relative overflow-hidden transition-all bg-white border-surface-200 shadow-xl shadow-surface-900/5 rounded-[2.5rem]",
            isSubscribed && "border-brand-100 ring-1 ring-brand-50"
          )}>
            <div className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
              <div className="flex items-center gap-8">
                <div className={cn(
                  "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform hover:scale-105",
                  isSubscribed ? "bg-surface-900 text-white" : "bg-surface-50 text-surface-300 border border-surface-100"
                )}>
                  <Zap className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">{isSubscribed ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Pro` : 'Standard Tier'}</h3>
                    {isSubscribed && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 uppercase text-[9px] font-black tracking-widest px-3 py-1">Active</Badge>}
                  </div>
                  <p className="text-surface-500 font-medium text-sm">
                    {isSubscribed 
                      ? `Certified Pro access enabled — Next cycle: ${formatDate(subscription.current_period_end)}` 
                      : 'You are currently in spectator mode. Join a plan to enter monthly draws.'}
                  </p>
                </div>
              </div>

              {isSubscribed ? (
                <Button variant="outline" onClick={handlePortal} isLoading={isProcessing} className="h-12 px-8 rounded-xl font-extrabold border-surface-200 hover:bg-surface-50">
                  Billing & Invoices
                </Button>
              ) : (
                <Badge variant="outline" className="text-xs py-3 px-8 border-dashed border-2 rounded-xl text-surface-400 font-black uppercase tracking-widest">No Active Subscription</Badge>
              )}
            </div>

            {isSubscribed && (
              <div className="px-10 py-5 bg-emerald-50/50 border-t border-emerald-100 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">All Draw privileges and Charity contributions are verified and active.</span>
              </div>
            )}
          </Card>
        </section>

        {/* ── Pricing Grid (if not subscribed) ────────────────────────────────────────── */}
        {!isSubscribed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Card key={key} padding="none" className={cn(
                "relative transition-all duration-500 bg-white border-surface-200 shadow-xl shadow-surface-900/5 rounded-[2.5rem] overflow-hidden group",
                key === 'yearly' && "border-brand-500 ring-4 ring-brand-50"
              )} hover>
                {key === 'yearly' && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-brand-600 text-white text-[10px] font-black px-6 py-2 rounded-bl-[1.5rem] uppercase tracking-widest shadow-xl">
                      Recommended
                    </div>
                  </div>
                )}
                <div className="p-10">
                  <h3 className="text-[10px] font-black uppercase text-surface-400 tracking-[0.2em] mb-4">{plan.label}</h3>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-extrabold text-surface-900 tracking-tighter">{plan.description.split('/')[0]}</span>
                    <span className="text-sm font-bold text-surface-400">/ {plan.interval}</span>
                  </div>
                  <ul className="space-y-5 mb-10 pl-1">
                    {[
                      "Unlimited score tracking ledgers",
                      "Priority entry to all monthly draws",
                      "Full Choice of 25+ verified charities",
                      "Verified athlete certification badge",
                      key === 'yearly' ? plan.savings : "High-impact performance analysis"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-4 text-sm font-bold text-surface-500">
                        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(13,148,136,0.4)]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={key === 'yearly' ? "primary" : "outline"} 
                    className="w-full h-16 rounded-2xl font-extrabold text-sm shadow-xl shadow-brand-500/10 transition-transform group-active:scale-95"
                    onClick={() => handleCheckout(key)}
                    isLoading={isProcessing}
                  >
                    Authorize Membership <ArrowRight className="ml-3 w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Profile Information ────────────────────────────────────────── */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 ml-1">Identity Profile</h2>
            <Card padding="none" className="bg-white border-surface-200 shadow-xl shadow-surface-900/5 rounded-[2.5rem] overflow-hidden">
              <div className="divide-y divide-surface-100">
                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center text-surface-400">
                       <User className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest mb-1">Full Name</p>
                       <p className="font-extrabold text-surface-900 text-lg leading-none">{profile?.full_name}</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-surface-900 h-10 px-4" disabled>Immutable</Button>
                </div>

                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center text-surface-400">
                       <Mail className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest mb-1">Registered Email</p>
                       <p className="font-extrabold text-surface-900 text-lg leading-none">{profile?.email || '••••••@•••••••.com'}</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-surface-900 h-10 px-4" disabled>Secure Link</Button>
                </div>

                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                       <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest mb-1">Credential Security</p>
                       <p className="font-extrabold text-surface-900 text-lg leading-none">Standard Tier Verified</p>
                     </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold text-[10px] px-4 py-1.5 rounded-full">Secure</Badge>
                </div>
              </div>
            </Card>
          </section>

          {/* ── Charity Contribution ────────────────────────────────────────── */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 ml-1">Philanthropic Protocol</h2>
            <Card className="p-10 bg-white border-surface-200 shadow-xl shadow-surface-900/5 rounded-[2.5rem]">
              <div className="space-y-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <Heart className="w-7 h-7" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-surface-900 tracking-tight leading-none mb-1">Impact Scaling</h3>
                    <p className="text-sm font-medium text-surface-500">Direct membership fees to your chosen mission.</p>
                  </div>
                </div>
                
                <div className="space-y-8 pl-1">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">Current Distribution</span>
                    <span className="text-5xl font-extrabold text-brand-600 tracking-tighter leading-none">{charityPct}%</span>
                  </div>
                  <div className="space-y-6">
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
                      value={charityPct}
                      onChange={(e) => setCharityPct(parseInt(e.target.value))}
                      className="w-full h-2.5 bg-surface-100 rounded-full appearance-none cursor-pointer accent-brand-600 outline-none transition-all hover:bg-surface-200 ring-4 ring-surface-50"
                    />
                    <div className="flex justify-between text-[10px] font-black text-surface-300 uppercase tracking-widest px-1">
                      <span>10% Minimum</span>
                      <span>Maximum Impact (100%)</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleUpdateCharity} 
                  isLoading={isSavingCharity}
                  disabled={charityPct === profile?.charity_contribution_pct}
                  className="w-full h-14 rounded-2xl font-extrabold text-sm shadow-lg shadow-brand-500/10"
                >
                  Commit Allocation Changes
                </Button>
              </div>
            </Card>
          </section>
        </div>

        {/* ── Security ────────────────────────────────────────── */}
        <section className="pt-4">
          <Card className="bg-red-50/50 border-red-100 border-[1.5px] rounded-[2rem] p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-extrabold text-red-600 mb-2 leading-none">Security Override: Account Deletion</h3>
                <p className="text-sm font-medium text-red-500/70 max-w-md">This action is permanent and irreversible. All performance history, draw eligibility, and authenticated credentials will be purged from our registry.</p>
              </div>
              <Button variant="danger" size="lg" className="h-14 px-10 rounded-2xl font-extrabold shadow-xl shadow-red-500/10" disabled>Deactivate Registry</Button>
            </div>
          </Card>
        </section>
      </div>

      <footer className="pt-24 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="h-[1px] w-12 bg-surface-100" />
          <p className="text-surface-300 text-[10px] uppercase tracking-[0.3em] font-black">Authorized Operations Only</p>
          <div className="h-[1px] w-12 bg-surface-100" />
        </div>
        <p className="text-surface-200 text-[8px] font-black uppercase tracking-widest">Secure billing protocols powered by Stripe Architecture.</p>
      </footer>
    </div>
  )
}
