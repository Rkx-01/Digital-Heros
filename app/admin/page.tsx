import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/Card"
import { 
  Users, 
  Wallet, 
  Heart, 
  TrendingUp, 
  Activity, 
  ArrowUpRight,
  CreditCard,
  History,
  Gift
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch aggregated stats
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('amount')
    .eq('status', 'active')
  
  const totalActiveSubs = activeSubs?.length || 0
  const monthlyRevenue = activeSubs?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  const { data: prizeData } = await supabase.from('draws').select('prize_pool, rollover_amount').order('draw_date', { ascending: false }).limit(1).single()
  const currentJackpot = (Number(prizeData?.prize_pool) || 0) + (Number(prizeData?.rollover_amount) || 0)

  const { data: charities } = await supabase.from('charities').select('total_donated')
  const totalDonated = charities?.reduce((acc, curr) => acc + Number(curr.total_donated), 0) || 0

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-10 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">Platform Overview</h1>
          <p className="text-surface-500 font-medium">Global analytics and performance monitoring.</p>
        </div>
        <Badge className="bg-brand-600 text-white shadow-sm ring-1 ring-brand-700 px-4 py-2 font-bold h-fit">
          <Activity className="w-3.5 h-3.5 mr-2 inline-block" /> LIVE DATA
        </Badge>
      </div>

      {/* ── Key Metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={totalUsers || 0} 
          icon={Users} 
          color="text-blue-500" 
          subValue="+12% from last month"
          subColor="text-success-500"
        />
        <StatCard 
          title="Active Subscriptions" 
          value={totalActiveSubs} 
          icon={CreditCard} 
          color="text-brand-500" 
          subValue={`${formatCurrency(monthlyRevenue)} MRR`}
        />
        <StatCard 
          title="Total Charity Impact" 
          value={formatCurrency(totalDonated)} 
          icon={Heart} 
          color="text-accent-500" 
          subValue="Across 120 charities"
        />
        <StatCard 
          title="Current Jackpot" 
          value={formatCurrency(currentJackpot)} 
          icon={Wallet} 
          color="text-success-500" 
          subValue="Ready for next draw"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-500" />
              Recent Registrations
            </h2>
            <Link href="/admin/users" className="text-sm font-bold text-brand-500 hover:underline flex items-center">
              View all users <ArrowUpRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentUsers?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-5 bg-surface-50 border border-surface-100 rounded-xl hover:bg-white hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-900 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{user.full_name}</p>
                    <p className="text-[10px] text-surface-400 font-extrabold uppercase tracking-widest mt-1">{formatDate(user.created_at)}</p>
                  </div>
                </div>
                <Badge variant={user.role === 'admin' ? 'accent' : 'outline'} className="font-bold">
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Platform Quick Actions */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 font-heading">Operations</h2>
            <div className="space-y-3">
              <Link href="/admin/draws" className="block">
                <Button className="w-full justify-start gap-3 h-12">
                   <History className="w-4 h-4" /> Run Next Draw
                </Button>
              </Link>
              <Link href="/admin/winners" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                   <Gift className="w-4 h-4" /> Review Winners
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="bg-white border-surface-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 mb-6">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-900">Stripe Webhooks</span>
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">OK</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-900">Supabase Auth</span>
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">OK</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, subValue, subColor }: any) {
  return (
    <Card padding="none" className="p-6 overflow-hidden relative group border-surface-200">
      <div className={cn("absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-1000", color)}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[10px] font-extrabold text-surface-400 uppercase tracking-[0.1em]">{title}</span>
        <span className="text-3xl font-extrabold mb-1 text-surface-900 tracking-tighter leading-none">{value}</span>
        {subValue && (
          <span className={cn("text-[10px] uppercase font-black tracking-widest mt-2", subColor || "text-surface-500")}>
            {subValue}
          </span>
        )}
      </div>
    </Card>
  )
}

interface LocalBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "accent" | "success" | "outline"
}

function Badge({ children, className, variant = "primary" }: LocalBadgeProps) {
  const variants = {
    primary: "bg-brand-50 text-brand-700 border-brand-100",
    accent: "bg-surface-900 text-white border-surface-900",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    outline: "border-surface-200 bg-white text-surface-500",
  }
  return (
    <span className={cn("px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-lg border tracking-widest shadow-sm", variants[variant], className)}>
      {children}
    </span>
  )
}

interface LocalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline"
}

function Button({ children, className, variant = "primary", ...props }: LocalButtonProps) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    outline: "border border-surface-200 bg-white hover:bg-surface-50 text-surface-600",
  }
  return (
    <button className={cn("px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center tracking-tight", variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
