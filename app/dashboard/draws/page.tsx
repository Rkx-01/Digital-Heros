import { createClient } from "@/lib/supabase/server"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Trophy, 
  History, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Gift,
  ArrowUpRight,
  TrendingUp,
  Coins,
  Users
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, cn, tierLabel, tierColor } from "@/lib/utils"

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all published draws
  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .eq("status", "published")
    .order("draw_date", { ascending: false })

  // Fetch user's wins
  const { data: wins } = await supabase
    .from("draw_winners")
    .select("*, draws(draw_date, numbers)")
    .eq("user_id", user?.id)

  const winMap: Record<string, any> = {}
  wins?.forEach(win => {
    winMap[win.draw_id] = win
  })

  // Latest draw for hero section
  const latestDraw = draws?.[0]
  const userLatestWin = latestDraw ? winMap[latestDraw.id] : null

  return (
    <div className="space-y-12 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">Draw Results</h1>
          <p className="text-surface-500 font-medium leading-relaxed">Check the latest numbers and see if you've hit the jackpot.</p>
        </div>
      </div>

      {/* ── Latest Draw Hero ────────────────────────────────────────── */}
      {latestDraw && (
        <Card padding="none" className="overflow-hidden relative border-surface-200 bg-white shadow-2xl shadow-surface-900/5 rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50/50 to-transparent pointer-events-none" />
          <div className="relative z-10 p-10 md:p-14 overflow-hidden">
             {/* Decorative Background Numbers */}
             <div className="absolute -top-10 -right-10 text-[16rem] font-extrabold text-surface-900/[0.02] pointer-events-none select-none italic">
               {latestDraw.numbers[0]}
             </div>

             <div className="flex flex-col lg:flex-row gap-16 items-center">
               <div className="flex-1 space-y-6 text-center lg:text-left">
                 <Badge variant="accent" className="bg-surface-900 text-white border-0 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full mb-4">Latest Result: {formatDate(latestDraw.draw_date)}</Badge>
                 <h2 className="text-5xl md:text-6xl font-extrabold text-surface-900 leading-[1.1] tracking-tighter">
                   {userLatestWin ? (
                     <>Congratulations! <br /><span className="text-brand-600">You Won {formatCurrency(userLatestWin.prize_amount)}</span></>
                   ) : (
                     <>The Big Reveal. <br /><span className="text-surface-300">Did you win?</span></>
                   )}
                 </h2>
                 <p className="text-surface-500 font-medium text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                   The latest numbers are officially certified. Check your entry and claim prize notification in your holdings.
                 </p>
               </div>

               <div className="flex-1 w-full max-w-xl">
                 <div className="flex flex-wrap justify-center gap-4 md:gap-5">
                   {latestDraw.numbers.map((num, i) => {
                     const isMatched = userLatestWin?.matched_numbers?.includes(num)
                     return (
                       <div 
                         key={i} 
                         className={cn(
                           "w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl font-extrabold transition-all duration-700 shadow-sm",
                           isMatched 
                             ? "bg-brand-600 text-white shadow-xl shadow-brand-500/30 scale-105 ring-4 ring-brand-50" 
                             : "bg-white text-surface-900 border border-surface-200"
                         )}
                       >
                         {num}
                       </div>
                     )
                   })}
                 </div>
                 
                 {userLatestWin && (
                   <div className="mt-12 flex justify-center">
                     <Link href={`/dashboard/draws/${latestDraw.id}`}>
                       <Button size="lg" className="px-12 h-16 text-sm font-extrabold rounded-2xl shadow-xl shadow-brand-500/20">
                         Claim Your Prize <Gift className="ml-3 w-5 h-5" />
                       </Button>
                     </Link>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </Card>
      )}

      {/* ── Prize Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-white border-surface-100 p-8 flex items-center gap-6 shadow-xl shadow-surface-900/5 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <Coins className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Guaranteed Jackpot</p>
            <p className="text-2xl font-extrabold text-surface-900 leading-none">{formatCurrency(latestDraw?.jackpot_amount || 0)}</p>
          </div>
        </Card>
        <Card className="bg-white border-surface-100 p-8 flex items-center gap-6 shadow-xl shadow-surface-900/5 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center text-surface-900">
            <Users className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Active Entrants</p>
            <p className="text-2xl font-extrabold text-surface-900 leading-none">{latestDraw?.total_participants || 0}</p>
          </div>
        </Card>
        <Card className="bg-white border-surface-100 p-8 flex items-center gap-6 shadow-xl shadow-surface-900/5 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Rollover Multiplier</p>
            <p className="text-2xl font-extrabold text-surface-900 leading-none">{formatCurrency(latestDraw?.rollover_amount || 0)}</p>
          </div>
        </Card>
      </div>

      {/* ── Draw History Table ────────────────────────────────────────── */}
      <div className="space-y-8 pt-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 flex items-center gap-3">
          <History className="w-4 h-4" /> Global Draw Registry
        </h2>

        <Card padding="none" className="overflow-hidden border-surface-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-surface-400 uppercase tracking-widest">Draw Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-surface-400 uppercase tracking-widest">Winning Sequence</th>
                  <th className="px-8 py-5 text-[10px] font-black text-surface-400 uppercase tracking-widest">User Outcome</th>
                  <th className="px-8 py-5 text-[10px] font-black text-surface-400 uppercase tracking-widest">Prize Allocated</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {draws?.map((draw) => {
                  const win = winMap[draw.id]
                  return (
                    <tr key={draw.id} className="hover:bg-surface-50 transition-colors group">
                      <td className="px-8 py-6 font-bold text-sm text-surface-900">{formatDate(draw.draw_date)}</td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          {draw.numbers.map((n, i) => (
                            <span 
                              key={i} 
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold transition-all group-hover:scale-105",
                                win?.matched_numbers?.includes(n) ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20" : "bg-surface-100 text-surface-500 border border-surface-200"
                              )}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {win ? (
                          <Badge variant="success" className="bg-emerald-100 text-emerald-700 font-extrabold uppercase text-[10px] tracking-widest py-1 border border-emerald-200">Winner</Badge>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-surface-300 tracking-widest">No Match</span>
                        )}
                      </td>
                      <td className="px-8 py-6 font-extrabold text-surface-900">
                        {win ? <span className="text-brand-600">{formatCurrency(win.prize_amount)}</span> : "-"}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/dashboard/draws/${draw.id}`}>
                          <Button variant="ghost" size="sm" className="h-10 px-4 group hover:bg-white text-xs font-bold rounded-xl text-surface-400 hover:text-surface-900 border-transparent hover:border-surface-200">
                            Details <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {!draws?.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm italic">
                      No draws have been published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
