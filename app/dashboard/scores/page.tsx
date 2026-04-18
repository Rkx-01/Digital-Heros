"use client"


import * as React from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Card"
import { Trophy, Calendar, Target, Plus, Trash2, Info, AlertTriangle, Edit2, X, Check } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import confetti from "canvas-confetti"
import Link from "next/link"

export default function ScoresPage() {
  const router = useRouter()
  const [scores, setScores] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [subscription, setSubscription] = React.useState<any>(null)
  
  // Edit State
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState<number>(0)
  const [editDate, setEditDate] = React.useState<string>("")

  const fetchScores = React.useCallback(async () => {
    const response = await fetch('/api/scores')
    const data = await response.json()
    if (response.ok) setScores(data)
  }, [])

  const fetchStatus = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single()
      setSubscription(sub)
    }
  }, [])

  React.useEffect(() => {
    Promise.all([fetchScores(), fetchStatus()]).finally(() => setLoading(false))
  }, [fetchScores, fetchStatus])

  async function handleAddScore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const score = Number(formData.get('score'))
    const date = formData.get('date') as string

    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, date })
    })

    const result = await response.json()

    if (response.ok) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#10b981']
      })
      fetchScores()
      ;(e.target as HTMLFormElement).reset()
    } else {
      setError(result.error || 'Failed to add score')
    }
    setIsSubmitting(false)
  }

  async function handleUpdateScore(id: string) {
    setIsSubmitting(true)
    const response = await fetch(`/api/scores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: editValue, date: editDate })
    })

    if (response.ok) {
      setEditingId(null)
      fetchScores()
    } else {
      const result = await response.json()
      alert(result.error || "Failed to update score")
    }
    setIsSubmitting(false)
  }

  async function handleDeleteScore(id: string) {
    if (!confirm('Are you sure you want to delete this score?')) return

    const response = await fetch(`/api/scores/${id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      fetchScores()
    } else {
      const result = await response.json()
      alert(result.error || "Failed to delete score")
    }
  }

  const startEditing = (score: any) => {
    setEditingId(score.id)
    setEditValue(score.score)
    setEditDate(score.date)
  }

  const isSubscribed = subscription?.status === 'active'

  if (loading) return <div className="animate-pulse space-y-4 pt-10 text-center text-gray-500">Loading your profile...</div>

  return (
    <div className="space-y-12 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">My Scores</h1>
          <p className="text-surface-500 font-medium leading-relaxed">Manage your latest 5 Stableford scores for the monthly draw.</p>
        </div>
      </div>

      {!isSubscribed && (
        <Card className="bg-amber-50 border-amber-200 py-5 flex items-center gap-4 shadow-sm">
          <AlertTriangle className="text-amber-600 w-5 h-5 ml-2 shrink-0" />
          <p className="text-sm font-bold text-amber-800">
            You need an active subscription to be entered into the draw. 
            <Link href="/dashboard/settings" className="ml-2 underline font-black decoration-brand-400 decoration-2 underline-offset-4">Upgrade now</Link>
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* ── Score Intake ────────────────────────────────────────── */}
        <div className="xl:col-span-1 space-y-8">
          <Card className="relative overflow-hidden bg-white border-surface-200 shadow-xl shadow-surface-900/5 p-8 rounded-[2rem]">
            <div className="absolute top-4 right-4">
               <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
                 <Plus className="w-6 h-6" />
               </div>
            </div>
            
            <h2 className="text-xl font-extrabold text-surface-900 mb-8 leading-none">Log New Result</h2>
            <form onSubmit={handleAddScore} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none">Stableford Component (1-45)</label>
                <input 
                  type="number" 
                  name="score" 
                  min="1" 
                  max="45" 
                  required
                  placeholder="36"
                  className="w-full bg-white border border-surface-200 rounded-xl py-4 px-5 text-surface-900 font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-surface-200"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none">Performance Date</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-300 w-5 h-5" />
                  <input 
                    type="date" 
                    name="date" 
                    required 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white border border-surface-200 rounded-xl py-4 pl-14 pr-5 text-surface-900 font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>}

              <Button type="submit" className="w-full h-16 rounded-2xl font-extrabold text-sm shadow-xl shadow-brand-500/10" isLoading={isSubmitting}>
                Certify Score
              </Button>
            </form>
          </Card>

          <div className="p-8 bg-surface-50 rounded-[2rem] border border-surface-100 flex items-start gap-4 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-white border border-surface-100 flex items-center justify-center shrink-0 shadow-sm">
              <Info className="text-brand-500 w-5 h-5" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-extrabold text-surface-900 leading-none">Rolling Ledger System</p>
              <p className="text-xs text-surface-500 leading-relaxed font-medium">
                We maintain a ledger of your latest 5 rounds. New entries replace the oldest score to ensure fair algorithmic odds.
              </p>
            </div>
          </div>
        </div>

        {/* ── Score List ────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-8 pt-2">
          <div className="flex items-end justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 flex items-center gap-3 leading-none">
              <Target className="w-4 h-4" /> Active Entry Ledger
            </h2>
            <Badge className={cn("rounded-full px-5 py-1.5 font-black uppercase text-[10px] tracking-widest shadow-sm", scores.length === 5 ? "bg-emerald-600 text-white border-0" : "bg-white text-surface-400 border-surface-200")}>
              {scores.length} / 5 Validated
            </Badge>
          </div>

          <div className="space-y-4">
            {scores.length > 0 ? (
              scores.map((score, idx) => (
                <Card key={score.id} padding="none" className="p-5 flex items-center justify-between group overflow-hidden bg-white border-surface-200 transition-all duration-300 hover:shadow-xl hover:border-surface-300 rounded-2xl" hover>
                  <div className="flex items-center gap-8 pl-1">
                    {editingId === score.id ? (
                      <div className="flex items-center gap-6">
                        <input 
                          type="number" 
                          min="1" 
                          max="45"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-20 h-12 bg-white border border-brand-200 rounded-xl text-center text-xl font-extrabold text-brand-600 focus:ring-4 focus:ring-brand-500/10 outline-none"
                        />
                        <input 
                          type="date" 
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="h-12 bg-white border border-surface-200 rounded-xl px-4 text-sm font-extrabold text-surface-900 focus:ring-4 focus:ring-brand-500/10 outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold shadow-sm transition-transform group-hover:scale-110",
                          idx === 0 ? "bg-surface-900 text-white" : "bg-surface-50 text-surface-900 border border-surface-100"
                        )}>
                          {score.score}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-black text-surface-900 leading-tight">{formatDate(score.date)}</span>
                          <span className="text-[10px] uppercase font-bold text-surface-300 tracking-widest">Stableford Component</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 pr-2 relative z-10">
                    {editingId === score.id ? (
                      <>
                        <button 
                          onClick={() => handleUpdateScore(score.id)}
                          disabled={isSubmitting}
                          className="w-10 h-10 flex items-center justify-center text-emerald-600 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all"
                        >
                          <Check className="w-5 h-5" strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="w-10 h-10 flex items-center justify-center text-surface-400 border border-surface-100 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all"
                        >
                          <X className="w-5 h-5" strokeWidth={3} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startEditing(score)}
                          className="w-10 h-10 flex items-center justify-center text-surface-300 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteScore(score.id)}
                          className="w-10 h-10 flex items-center justify-center text-surface-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center bg-white border-2 border-dashed border-surface-200 rounded-[3rem]">
                <div className="w-20 h-20 bg-surface-50 rounded-[2rem] flex items-center justify-center mb-6">
                  <Target className="w-10 h-10 text-surface-200" />
                </div>
                <p className="text-surface-900 font-extrabold text-xl tracking-tight mb-2">No data in ledger.</p>
                <p className="text-surface-400 font-medium text-sm">Add your first round result to start your journey.</p>
              </div>
            )}
          </div>

          {scores.length === 5 && isSubscribed && (
            <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10 shrink-0 border-4 border-emerald-100">
                <Trophy className="text-emerald-600 w-10 h-10" strokeWidth={2} />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-extrabold text-emerald-900 tracking-tight leading-none">Certified Draw Eligible</h3>
                <p className="text-sm text-emerald-700/70 font-bold leading-relaxed">
                  Your entry is officially validated for the upcoming monthly draw. Continue certifying scores to optimize your standing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
