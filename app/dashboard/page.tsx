"use client"


import { PageLoader } from "@/components/ui/PageLoader"
import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Trophy, 
  Target, 
  Heart, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const [data, setData] = React.useState<any>({
    profile: null,
    scores: [],
    subscription: null,
    totalWinnings: 0,
    nextDraw: null,
    participation: []
  })
  const [loading, setLoading] = React.useState(true)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const fetchData = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profRes, scoreRes, subRes, winRes, nextDrawRes, partRes] = await Promise.all([
      supabase.from("profiles").select("*, charities(id, name)").eq("id", user.id).single(),
      supabase.from("scores").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
      supabase.from("draw_winners").select("prize_amount").eq("user_id", user.id),
      supabase.from("draws").select("*").in("status", ["draft", "simulated"]).order("draw_date", { ascending: true }).limit(1).single(),
      supabase.from("draw_winners").select("*, draws(draw_date, status)").eq("user_id", user.id).limit(3)
    ])

    setData({
      profile: profRes.data,
      scores: scoreRes.data || [],
      subscription: subRes.data,
      totalWinnings: (winRes.data as any[])?.reduce((acc: number, curr: any) => acc + Number(curr.prize_amount), 0) || 0,
      nextDraw: nextDrawRes.data,
      participation: partRes.data || []
    })
    setLoading(false)
  }, [])

  React.useEffect(() => {
    async function verifyAndFetch() {
      // 1. Initial fetch
      await fetchData()

      // 2. If returning from Stripe, force a direct verification sync
      if (sessionId) {
        setShowSuccess(true)
        try {
          const res = await fetch(`/api/subscription/verify?session_id=${sessionId}`)
          const verifyData = await res.json()
          
          if (verifyData.status === 'active') {
             // Re-fetch now that we know DB is updated
             await fetchData()
          }
        } catch (e) {
          console.error('Manual verification failed:', e)
        }

        // Hide success banner after 8s
        const hideTimer = setTimeout(() => setShowSuccess(false), 8000)
        return () => clearTimeout(hideTimer)
      }
    }

    verifyAndFetch()
  }, [fetchData, sessionId])

  if (loading) return <PageLoader text="Synchronizing your stats..." />

  const { profile, scores, subscription, totalWinnings, nextDraw, participation } = data
  const isSubscribed = subscription?.status === 'active'
  const hasFiveScores = scores.length >= 5

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* ── Header ────────────────────────────────────────── */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-surface-900 leading-tight">
            Hi, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-surface-500 font-medium">Ready to hit the links and make an impact today?</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/scores">
            <Button variant="outline" size="lg" className="rounded-xl px-8 h-12 font-bold">Add Score</Button>
          </Link>
          <Link href="/dashboard/draws">
            <Button size="lg" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-brand-500/10">View Draws</Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Status Banners ────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-emerald-50 border-emerald-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl shadow-lg shadow-emerald-600/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Trophy className="text-emerald-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-900 leading-none">Membership Successfully Activated!</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Your access is confirmed and your impact metrics are synchronizing.</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="bg-white border-emerald-100 text-emerald-700 font-bold" onClick={() => setShowSuccess(false)}>Dismiss</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSubscribed && !showSuccess && (
        <motion.div variants={item}>
          <Card className="bg-brand-50 border-brand-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <AlertCircle className="text-brand-600 w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-brand-900">Your subscription is inactive. You won't be entered in the next draw.</p>
            </div>
            <Link href="/dashboard/settings">
              <Button size="sm" className="whitespace-nowrap px-8 h-12 font-bold">Upgrade Now</Button>
            </Link>
          </Card>
        </motion.div>
      )}

      {/* ── Top Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Total Winnings", 
            val: formatCurrency(totalWinnings), 
            icon: Wallet, 
            color: "text-brand-600", 
            bg: "bg-brand-50",
            sub: "Verified Payouts"
          },
          { 
            label: "Scores Logged", 
            val: `${scores.length} / 5`, 
            icon: Target, 
            color: "text-amber-600", 
            bg: "bg-amber-50",
            progress: true
          },
          { 
            label: "Your Charity", 
            val: profile?.charities?.name || 'Not Selected', 
            icon: Heart, 
            color: "text-emerald-600", 
            bg: "bg-emerald-50",
            sub: `${profile?.charity_contribution_pct || 10}% Contribution`
          },
          { 
            label: "Next Draw", 
            val: nextDraw ? new Date(nextDraw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "TBA", 
            icon: Calendar, 
            color: "text-indigo-600", 
            bg: "bg-indigo-50",
            badge: (hasFiveScores && isSubscribed) ? "Entry Confirmed" : "Action Needed"
          }
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card hover padding="none" className="p-6 relative group overflow-hidden border-surface-200">
              <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity text-surface-900">
                <stat.icon className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] uppercase font-black text-surface-400 tracking-widest">{stat.label}</span>
                  <span className="text-2xl font-extrabold truncate text-surface-900 leading-tight">{stat.val}</span>
                </div>
              </div>
              
              {stat.progress ? (
                <div className="w-full bg-surface-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(scores.length * 20, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-brand-600 h-full rounded-full" 
                  />
                </div>
              ) : stat.badge ? (
                <Badge variant={hasFiveScores ? "success" : "outline"} className="w-fit text-[11px] font-bold px-3">
                  {stat.badge}
                </Badge>
              ) : (
                <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wide">{stat.sub}</span>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Main Content Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Scores */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Target className="w-6 h-6 text-brand-500" />
                Recent Scores
              </h2>
              <Link href="/dashboard/scores" className="text-sm font-bold text-brand-500 hover:text-brand-400 transition-colors flex items-center group">
                Manage all <ArrowUpRight className="ml-1 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              {scores.length > 0 ? (
                scores.map((score: any, idx: number) => (
                  <motion.div 
                    key={score.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-5 bg-surface-50 rounded-2xl group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all border border-transparent hover:border-surface-200"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-xl bg-surface-900 flex items-center justify-center font-extrabold text-2xl text-white shadow-sm">
                        {score.score}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-surface-400 uppercase tracking-widest leading-none mb-1">Stableford Score</span>
                        <span className="text-base font-bold text-surface-900">{new Date(score.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-bold border-surface-200">Full Stats</Badge>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center">
                    <Target className="w-10 h-10 text-gray-700" />
                  </div>
                  <p className="text-gray-500 font-medium">No scores logged yet. Start playing to qualify!</p>
                  <Link href="/dashboard/scores">
                    <Button size="sm" variant="outline">Add First Score</Button>
                  </Link>
                </div>
              )}
            </div>
            
            {hasFiveScores && isSubscribed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-10 p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                  <Trophy className="text-white w-7 h-7" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-emerald-900 leading-none">Entry Secured</p>
                  <p className="text-sm text-emerald-700 font-medium mt-1">Your latest stats are locked in for the next prize draw.</p>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Charity Impact / Side Panel */}
        <div className="space-y-8">
          <motion.div variants={item}>
            <Card className="bg-gradient-to-br from-surface-900 to-surface-800 text-white border-0 shadow-2xl shadow-surface-900/10 relative overflow-hidden group p-10 rounded-[3rem]">
               <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
               <div className="relative z-10">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                    <Heart className="w-7 h-7 fill-brand-500 text-brand-500" />
                 </div>
                 <h3 className="text-2xl font-extrabold mb-5 tracking-tight text-white leading-tight">Impact Driven</h3>
                 <p className="text-base text-surface-200 mb-10 leading-relaxed font-medium">
                   You've contributed <strong className="text-white">{formatCurrency((profile?.charity_contribution_pct || 10) / 100 * (subscription?.amount || 0))}</strong> this month. You're part of a community that has raised over £1.2M.
                 </p>
                 <Link href={profile?.charities?.id ? `/dashboard/charity/${profile.charities.id}` : "/dashboard/charity"}>
                   <Button className="w-full bg-white text-surface-900 hover:bg-surface-50 h-14 text-base font-bold">
                     View Mission Profile
                   </Button>
                 </Link>
               </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="rounded-[3rem] p-10 border-surface-200">
              <h3 className="text-[11px] uppercase font-black tracking-[0.2em] text-surface-400 mb-10">Draw History</h3>
              <div className="space-y-8">
                 {participation.length > 0 ? participation.map((part: any) => (
                   <div key={part.id} className="flex justify-between items-center border-b border-surface-50 pb-6 last:border-0 last:pb-0">
                     <div className="flex flex-col">
                       <span className="text-base font-bold text-surface-900">{new Date(part.draws.draw_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                       <span className="text-[10px] text-surface-400 font-extrabold uppercase tracking-widest mt-1">{part.draws.status}</span>
                     </div>
                     <Badge variant={part.tier === 1 ? 'accent' : 'outline'} className="font-bold">
                       {part.tier === 1 ? 'WINNER!' : 'PARTICIPATED'}
                     </Badge>
                   </div>
                 )) : (
                   <div className="py-4 text-center">
                     <p className="text-sm text-surface-400 font-bold italic">No recent draw history.</p>
                   </div>
                 )}
                 <Link href="/dashboard/winnings" className="block pt-6">
                   <Button variant="outline" className="w-full text-xs h-12 font-bold rounded-xl border-surface-200">My Winnings Portal</Button>
                 </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
