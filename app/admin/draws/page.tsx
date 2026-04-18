"use client"


import * as React from "react"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Trophy, 
  Plus, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  Target,
  Calendar,
  Activity
} from "lucide-react"
import Link from "next/link"
import { formatDate, formatCurrency, cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminDrawsPage() {
  const [draws, setDraws] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [drawType, setDrawType] = React.useState<'random' | 'algorithmic'>('random')
  const [error, setError] = React.useState<string | null>(null)

  const fetchDraws = React.useCallback(async () => {
    try {
      const res = await fetch('/api/draws?admin=true')
      if (!res.ok) throw new Error('Failed to fetch draws')
      const data = await res.json()
      setDraws(data)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const hasActiveDraw = draws.some(d => d.status === 'draft' || d.status === 'simulated')

  React.useEffect(() => {
    fetchDraws()
  }, [fetchDraws])

  async function handleCreateDraw() {
    setIsProcessing(true)
    setError(null)
    const nextDrawDate = new Date()
    nextDrawDate.setDate(1) // Next month 1st
    nextDrawDate.setMonth(nextDrawDate.getMonth() + 1)
    
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draw_date: nextDrawDate.toISOString().split('T')[0],
          draw_type: drawType,
          notes: `Monthly ${drawType} draw`
        })
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to initialize draw')
      }
      
      fetchDraws()
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleSimulate(id: string) {
    setIsProcessing(true)
    setError(null)
    const res = await fetch(`/api/draws/${id}/simulate`, { method: 'POST' })
    if (!res.ok) {
      const err = await res.json()
      setError(err.error || 'Simulation failed')
    } else {
      fetchDraws()
    }
    setIsProcessing(false)
  }

  async function handlePublish(id: string) {
    console.log('Finalizing and publishing draw:', id)
    setIsProcessing(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/draws/${id}/publish`, { method: 'POST' })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Publication failed')
      }
      
      console.log('Publication successful:', data)
      fetchDraws()
    } catch (err: any) {
      setError(err.message)
      console.error('Publication error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return <div className="pt-20 text-center animate-pulse text-gray-500 font-bold uppercase tracking-widest">Opening Draw Vault...</div>

  return (
    <div className="space-y-10 pt-4">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">{error}</p>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">Draw Management</h1>
          <p className="text-surface-500 font-medium">Configure, simulate, and publish monthly reward draws.</p>
        </div>

        <Card className="p-6 border-surface-200 bg-white shadow-sm w-full md:min-w-[320px] md:w-auto rounded-2xl">
           <span className="text-[10px] uppercase font-black text-surface-400 tracking-[0.2em] block mb-4">Control Center</span>
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between gap-6 pb-4 border-b border-surface-100">
               <span className="text-xs font-bold text-surface-500">Logic Type</span>
               <div className="flex bg-surface-50 p-1 rounded-lg border border-surface-100">
                 <button 
                   onClick={() => setDrawType('random')}
                   disabled={hasActiveDraw}
                   className={cn("px-4 py-1.5 text-[10px] font-black rounded-md transition-all", drawType === 'random' ? "bg-surface-900 text-white shadow-sm" : "text-surface-400 hover:text-surface-900", hasActiveDraw && "opacity-50 cursor-not-allowed")}
                 >RANDOM</button>
                 <button 
                   onClick={() => setDrawType('algorithmic')}
                   disabled={hasActiveDraw}
                   className={cn("px-4 py-1.5 text-[10px] font-black rounded-md transition-all", drawType === 'algorithmic' ? "bg-surface-900 text-white shadow-sm" : "text-surface-400 hover:text-surface-900", hasActiveDraw && "opacity-50 cursor-not-allowed")}
                 >ALGO</button>
               </div>
             </div>
             <Button 
               onClick={handleCreateDraw} 
               isLoading={isProcessing} 
               disabled={hasActiveDraw}
               className="w-full text-xs h-11 gap-3 font-bold"
             >
               {hasActiveDraw ? (
                 <>Locked: Pending Cycle</>
               ) : (
                 <><Plus className="w-4 h-4" /> Initialize {drawType} Draw</>
               )}
             </Button>
             {hasActiveDraw && (
               <p className="text-[9px] text-surface-400 font-bold italic leading-tight text-center">
                 Complete or Publish the current active draw before initializing the next monthly cycle.
               </p>
             )}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {draws.map((draw) => {
          const isDraft = draw.status === 'draft'
          const isSimulated = draw.status === 'simulated'
          const isPublished = draw.status === 'published'

          return (
            <Card key={draw.id} className={cn(
              "p-0 overflow-hidden relative group transition-all border-surface-200 bg-white shadow-sm hover:shadow-xl hover:border-surface-300",
              !isPublished && "ring-1 ring-brand-500/10"
            )}>
              {isSimulated && (
                <div className="absolute top-0 right-0 h-full w-1.5 bg-brand-500 z-10" />
              )}
              
              <div className="p-10">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                  {/* Left: Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Badge variant={isPublished ? "outline" : "accent"} className={cn("px-4 py-1 font-bold", isPublished ? "border-surface-200" : "")}>
                        {draw.status}
                      </Badge>
                      <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none">ID: {draw.id.slice(0, 8)}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-surface-900 flex items-center gap-3">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-surface-300 shrink-0" />
                        {formatDate(draw.draw_date)}
                      </h3>
                      <p className="text-[11px] md:text-sm text-surface-500 font-medium mt-1 leading-relaxed">
                        Algorithm: <span className="text-brand-600 font-black uppercase tracking-widest text-[9px] md:text-[10px]">{draw.draw_type}</span>
                        {draw.notes && <span className="text-surface-300 mx-2">|</span>}
                        {draw.notes && <span className="italic line-clamp-1 md:line-clamp-none inline">{draw.notes}</span>}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-8 pt-2">
                       <div className="flex flex-col">
                         <span className="text-[10px] uppercase tracking-widest font-black text-surface-400 mb-1">Pool Value</span>
                         <span className="text-xl font-extrabold text-surface-900">{formatCurrency(draw.prize_pool)}</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] uppercase tracking-widest font-black text-surface-400 mb-1">Rollover</span>
                         <span className="text-xl font-extrabold text-amber-600">{formatCurrency(draw.rollover_amount)}</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] uppercase tracking-widest font-black text-surface-400 mb-1">Entrants</span>
                         <span className="text-xl font-extrabold text-surface-900">{draw.total_participants || 0}</span>
                       </div>
                    </div>
                  </div>

                  {/* Center: Numbers & Pre-analysis */}
                  <div className="flex-[1.5] space-y-8">
                    <div className="flex flex-col items-center justify-center space-y-5 bg-surface-50 rounded-[2rem] p-8 border border-surface-100">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black text-surface-400">
                        {isDraft ? "Awaiting Data Entry" : "Winning Sequence"}
                      </span>
                      <div className="flex gap-2 md:gap-3">
                        {(draw.numbers.length === 5 && draw.numbers[0] !== 0 ? draw.numbers : [0,0,0,0,0]).map((n: number, i: number) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl font-black transition-all",
                              n === 0 ? "bg-white text-surface-200 border-2 border-dashed border-surface-200" : "bg-surface-900 text-white shadow-xl scale-110 ring-4 ring-white"
                            )}
                          >
                            {n === 0 ? "" : n}
                          </div>
                        ))}
                      </div>
                    </div>

                    {isSimulated && draw.simulation_data && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <Badge variant="success" className="font-bold px-3">System Validated</Badge>
                           <span className="text-[10px] uppercase font-black text-surface-400 tracking-wider">Projected Distribution</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: "Tier 1", count: draw.simulation_data.tier1Count, share: draw.simulation_data.estimatedJackpotShare, accent: "brand" },
                            { label: "Tier 2", count: draw.simulation_data.tier2Count, share: draw.simulation_data.estimatedTier2Share, accent: "surface" },
                            { label: "Tier 3", count: draw.simulation_data.tier3Count, share: draw.simulation_data.estimatedTier3Share, accent: "surface" },
                          ].map((tier, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-surface-100 shadow-sm hover:border-brand-500/30 transition-all">
                              <span className="text-[9px] uppercase font-black text-surface-400 tracking-widest block mb-2">{tier.label}</span>
                              <div className="space-y-1">
                                <p className="text-xl font-extrabold text-surface-900 leading-none">{tier.count}</p>
                                <p className="text-[9px] font-bold text-surface-500 leading-none">{formatCurrency(tier.share)} avg</p>
                              </div>
                            </div>
                          ))}
                          <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 shadow-sm">
                            <span className="text-[9px] uppercase font-black text-brand-600 tracking-widest block mb-2">Next Rollover</span>
                            <p className="text-xl font-extrabold text-brand-700 leading-none">{formatCurrency(draw.simulation_data.rolloverResult)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col justify-center gap-4 min-w-[220px]">
                    {isDraft && (
                      <Button className="w-full gap-3 h-16 text-sm font-bold shadow-lg shadow-brand-500/20" onClick={() => handleSimulate(draw.id)} isLoading={isProcessing}>
                        <Play className="w-5 h-5" /> Simulate Results
                      </Button>
                    )}
                    
                    {isSimulated && (
                      <>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-3 h-16 text-sm font-bold shadow-xl shadow-emerald-600/10" onClick={() => handlePublish(draw.id)} isLoading={isProcessing}>
                          <CheckCircle2 className="w-5 h-5" /> Finalize & Publish
                        </Button>
                        <Button variant="outline" className="w-full h-12 text-xs font-bold border-surface-200" onClick={() => handleSimulate(draw.id)} isLoading={isProcessing}>
                          Refresh Simulation
                        </Button>
                      </>
                    )}

                    {isPublished && (
                      <div className="space-y-4 w-full">
                        <div className="flex items-center gap-2 text-emerald-600 font-extrabold justify-center bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-5 h-5 shadow-inner" /> Cycle Complete
                        </div>
                        <Link href="/admin/winners" className="block">
                          <Button variant="outline" className="w-full text-xs h-11 font-bold border-surface-200 hover:bg-surface-50">Manage Winners Feed</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isPublished && (
                <div className="px-10 py-5 bg-surface-50 border-t border-surface-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-brand-600" />
                    <p className="text-[11px] text-surface-500 font-bold uppercase tracking-[0.1em]">
                      Validation: <span className="text-surface-900">{(draw.prize_pool / 10).toFixed(0)}</span> candidate subscriptions ready for processing.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {draws.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-surface-200 flex flex-col items-center justify-center">
             <div className="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mb-8">
               <Trophy className="w-10 h-10 text-surface-200" />
             </div>
             <h3 className="text-2xl font-extrabold text-surface-900 mb-3">No Draws Initialized</h3>
             <p className="text-surface-500 mb-10 max-w-sm font-medium">Create your first draft draw to start the monthly reward cycle.</p>
             <Button onClick={handleCreateDraw} isLoading={isProcessing} size="lg" className="px-10 h-16 font-extrabold">Initialize First Draw</Button>
          </div>
        )}
      </div>
    </div>
  )
}
