import Image from "next/image"
import Link from "next/link"
import { Trophy, Target, Heart, ArrowRight, ShieldCheck, Users, TrendingUp, Sparkles, Info, Search, Globe } from "lucide-react"
import { Navbar } from "@/components/ui/Navbar"
import { Button } from "@/components/ui/Button"
import { Card, Badge } from "@/components/ui/Card"
import { cn } from "@/lib/utils"
import { CountUp } from "@/components/ui/CountUp"

import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: featuredCharities } = await supabase
    .from('charities')
    .select('*')
    .eq('featured', true)
    .limit(3)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="accent" className="mb-8 py-2 px-6 rounded-full bg-surface-900 text-white border-0 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">
              <Sparkles className="w-4 h-4 mr-2 text-brand-400 inline-block" /> Over £<CountUp to={52450} duration={2} /> Donated This Month
            </Badge>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-10 leading-[0.95] tracking-tighter text-surface-900">
              Elevate Your Game. <br />
              <span className="text-brand-600">Transform Global</span> Lives.
            </h1>
            <p className="text-lg md:text-2xl text-surface-500 mb-14 max-w-3xl mx-auto leading-relaxed font-semibold tracking-tight">
              The premier platform where pure performance authorizes life-changing impact. Every score you certify scales the missions you love, while entering you into premium monthly rewards draws.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto h-20 px-16 text-sm font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-brand-500/20 hover:shadow-brand-500/40 transition-all active:scale-95">
                  Get Started Now <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link href="/charities">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-20 px-16 text-sm font-black uppercase tracking-widest rounded-2xl border-surface-200 hover:border-surface-900 hover:bg-white">
                  Explore Charities
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-32 px-6 max-w-7xl mx-auto">
          <div className="relative group">
            <div className="relative overflow-hidden border-surface-100 rounded-[3rem] shadow-2xl bg-white p-4">
              <div className="relative aspect-[21/9] overflow-hidden rounded-[2.5rem]">
                <Image 
                  src="/impact-hero.png" 
                  alt="GolfDraw Impact Future" 
                  width={1200} 
                  height={600} 
                  className="w-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-900/90 via-surface-900/40 to-transparent h-full flex items-end p-10 md:p-20">
                  <div className="flex flex-wrap gap-12 md:gap-32 w-full justify-center md:justify-start">
                    <div className="flex flex-col">
                      <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">4.8/5</span>
                      <span className="text-[10px] text-brand-400 font-black uppercase tracking-[0.3em] mt-3">Golfer Trust Rating</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
                        <CountUp to={1.2} duration={2.5} decimals={1} suffix="M+" />
                      </span>
                      <span className="text-[10px] text-brand-400 font-black uppercase tracking-[0.3em] mt-3">Verified Impact Payouts</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
                        <CountUp to={128} duration={2} />
                      </span>
                      <span className="text-[10px] text-brand-400 font-black uppercase tracking-[0.3em] mt-3">Scrutinized Charities</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-32 relative bg-surface-50/50 border-y border-surface-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-full mb-6">Operational Protocol</Badge>
            <h2 className="text-5xl md:text-7xl font-extrabold mb-8 text-surface-900 tracking-tighter">Experience the Impact</h2>
            <p className="text-surface-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">The architecture is simple. The impact is profound. Join our registry in three steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Initialize Registry",
                desc: "Select your membership tier and pick a mission close to your heart.",
                icon: Users,
                color: "text-brand-600",
                bg: "bg-white"
              },
              {
                step: "02",
                title: "Certify Performance",
                desc: "Log your latest 5 rounds. Our algorithm processes your data for weighted draws.",
                icon: Target,
                color: "text-brand-600",
                bg: "bg-white"
              },
              {
                step: "03",
                title: "Authorize Impact",
                desc: "Win certified prizes while your participation directly funds world-changing missions.",
                icon: Heart,
                color: "text-brand-600",
                bg: "bg-white"
              }
            ].map((item, idx) => (
              <Card key={idx} padding="none" className="relative group overflow-hidden border-surface-200 bg-white p-12 rounded-[3rem] transition-all duration-500 hover:shadow-2xl hover:border-brand-500/20" hover>
                <div className="absolute top-8 right-10 text-8xl font-black text-surface-900 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity italic">
                  {item.step}
                </div>
                <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-10 shadow-xl shadow-surface-900/5 bg-surface-50 border border-surface-100", item.color)}>
                  <item.icon className="w-10 h-10" strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-extrabold mb-6 text-surface-900 tracking-tight">{item.title}</h3>
                <p className="text-surface-500 font-medium leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PRIZE POOL ────────────────────────────────────────── */}
      <section id="prizes" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <Card padding="none" className="overflow-hidden relative shadow-2xl rounded-[4rem] border-surface-200 bg-white group" hover={false}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-24 flex flex-col justify-center">
                <Badge className="bg-surface-900 text-white border-0 w-fit mb-8 px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest">Active Draw Cycle: April 2024</Badge>
                <h2 className="text-5xl md:text-7xl font-extrabold mb-10 text-surface-900 tracking-tighter leading-[1.1]">The Jackpot is <br /><span className="text-brand-600 tracking-tight">£<CountUp to={42500} duration={3} /></span></h2>
                <p className="text-xl text-surface-500 mb-12 leading-relaxed font-medium">
                  Experience the ripple effect of every successful certification. Our community-driven prize pool grows alongside our charitable footprint.
                </p>
                <div className="flex flex-wrap gap-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                      <ShieldCheck className="text-emerald-600 w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-surface-900 text-[10px] uppercase tracking-widest">Verified Infrastructure</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shadow-sm">
                      <TrendingUp className="text-brand-600 w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-surface-900 text-[10px] uppercase tracking-widest">Scalable Registry</span>
                  </div>
                </div>
                <div className="mt-16">
                  <Link href="/signup">
                    <Button className="px-16 h-20 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-brand-500/20 active:scale-95 transition-all">Participate in Registry</Button>
                  </Link>
                </div>
              </div>
              <div className="bg-surface-900 p-12 md:p-24 flex items-center justify-center relative overflow-hidden min-h-[600px]">
                <div className="absolute inset-0 bg-brand-500/[0.03] pointer-events-none" />
                <div className="grid grid-cols-2 gap-8 relative z-10 w-full max-w-md">
                  {[
                    { val: "12", label: "Days Remaining" },
                    { val: "08", label: "Hours" },
                    { val: "42", label: "Minutes" },
                    { val: "15", label: "Seconds" }
                  ].map((unit, i) => (
                    <div key={i} className="aspect-square bg-white/[0.03] border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:-translate-y-1">
                      <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter">{unit.val}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-surface-400 font-black mt-3 transition-colors group-hover:text-brand-400">{unit.label}</span>
                    </div>
                  ))}
                  <div className="col-span-2 mt-8 text-center">
                    <span className="text-[10px] font-black text-surface-600 uppercase tracking-[0.4em]">Official Draw Cycle Counter</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── DRAW MECHANICS DEEP DIVE ────────────────────────────────────────── */}
      <section className="py-32 bg-surface-50/50 border-y border-surface-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col xl:flex-row gap-24 lg:items-center">
            <div className="flex-1 space-y-12">
              <Badge className="bg-white border-surface-200 text-surface-400 font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-full">Fairness & Transparency Architecture</Badge>
              <h2 className="text-5xl md:text-7xl font-extrabold leading-[1.05] text-surface-900 tracking-tighter">
                Performance Weighted. <br />
                <span className="text-brand-600 tracking-tight">Algorithmic Precision.</span>
              </h2>
              <p className="text-xl text-surface-500 leading-relaxed font-semibold tracking-tight">
                Unlike random lotteries, GolfDraw rewards elite performance. Our custom-built verification engine uses your performance data to optimize your probability.
              </p>
              
              <div className="space-y-10">
                 <div className="flex gap-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-xl shadow-surface-900/5 border border-surface-100 flex items-center justify-center shrink-0">
                     <Users className="text-brand-600 w-8 h-8" strokeWidth={2.5} />
                   </div>
                   <div>
                     <h4 className="text-xl font-extrabold mb-2 text-surface-900 tracking-tight leading-none">Standard Registry Pool</h4>
                     <p className="text-md text-surface-500 font-medium leading-relaxed">Every certified golfer maintains a baseline probability in the monthly cycle.</p>
                   </div>
                 </div>
                 <div className="flex gap-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-xl shadow-surface-900/5 border border-surface-100 flex items-center justify-center shrink-0 text-amber-500">
                     <TrendingUp className="w-8 h-8" strokeWidth={2.5} />
                   </div>
                   <div>
                     <h4 className="text-xl font-extrabold mb-2 text-surface-900 tracking-tight leading-none">Algorithmic Boost protocol</h4>
                     <p className="text-md text-surface-500 font-medium leading-relaxed">Top-tier performers receive an optimized probability weight in our proprietary draws.</p>
                   </div>
                 </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <Card className="p-12 md:p-20 border-surface-200 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.05)] rounded-[4rem] relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 p-12 opacity-[0.02] text-surface-900 transition-transform duration-1000 group-hover:scale-125">
                   <Sparkles className="w-64 h-64" />
                 </div>
                <h3 className="text-3xl font-extrabold mb-12 text-surface-900 tracking-tighter leading-none">Simulation Interface</h3>
                <div className="space-y-10">
                   {[
                     { label: "Standard Participation", weight: "1x", pct: 100, color: "bg-surface-100" },
                     { label: "Advanced Analytics (36+ Pts)", weight: "1.2x", pct: 120, color: "bg-brand-600" },
                     { label: "Elite Performance (40+ Pts)", weight: "1.5x", pct: 150, color: "bg-surface-900" }
                   ].map((sim, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">{sim.label}</span>
                          <span className="text-sm font-black text-surface-900">{sim.weight} OPS</span>
                        </div>
                        <div className="h-2.5 w-full bg-surface-50 rounded-full overflow-hidden p-0.5 border border-surface-100/50">
                          <div className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-sm", sim.color)} style={{ width: `${(sim.pct / 150) * 100}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-16 p-8 bg-surface-50 rounded-[2.5rem] border border-surface-100 flex items-center gap-6">
                   <Info className="w-6 h-6 text-brand-600 shrink-0" />
                   <p className="text-[11px] text-surface-400 leading-relaxed font-bold tracking-tight">
                     Weight calculations are finalized 24h prior to draw execution and are subject to audit. Simulation data for demonstration only.
                   </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED CHARITIES SPOTLIGHT ────────────────────────────────────────── */}
      <section id="charities" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-3xl">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-extrabold text-[10px] px-6 py-2 rounded-full mb-8 uppercase tracking-widest">Philanthropic Network</Badge>
              <h2 className="text-5xl md:text-7xl font-extrabold mb-8 text-surface-900 tracking-tighter leading-none">Missions in Motion</h2>
              <p className="text-xl text-surface-500 font-medium leading-relaxed max-w-2xl">
                The world-class organizations we empower. Choose from over 120+ scrutinized missions when you register.
              </p>
            </div>
            <Link href="/charities">
              <Button variant="outline" className="h-16 px-12 rounded-2xl font-black uppercase text-xs tracking-widest border-surface-200 hover:border-surface-900 transition-all">
                Registry Directory <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {featuredCharities?.map((charity, idx) => (
              <Card key={idx} padding="none" className="flex flex-col h-full group bg-white border-surface-200 shadow-xl shadow-surface-900/[0.03] rounded-[3rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-brand-500/20" hover>
                <div className="relative aspect-[16/11] w-full overflow-hidden">
                  <Image 
                    src={charity.image_url || "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800"} 
                    alt={charity.name}
                    fill
                    className="object-cover transform transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900/40 to-transparent" />
                  <Badge className="absolute top-6 right-6 bg-surface-900 text-white border-0 shadow-xl font-black uppercase text-[9px] tracking-widest px-4 py-1.5 rounded-full">
                    {charity.category}
                  </Badge>
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <h3 className="text-3xl font-extrabold mb-4 group-hover:text-brand-600 transition-colors text-surface-900 tracking-tight leading-tight">{charity.name}</h3>
                  <p className="text-surface-500 font-medium text-sm mb-10 line-clamp-3 leading-relaxed">
                    {charity.description}
                  </p>
                  <Link href={`/charities`}>
                    <Button variant="ghost" className="w-full justify-between group/btn text-[10px] font-black uppercase tracking-widest p-0 h-auto hover:bg-transparent hover:text-brand-600 pr-2">
                      Registry Details <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" strokeWidth={3} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-24 p-12 md:p-20 bg-surface-50 rounded-[4rem] border border-surface-100 flex flex-col md:flex-row items-center gap-12 text-center md:text-left transition-all hover:bg-surface-50/80">
             <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl shadow-brand-500/10 flex items-center justify-center shrink-0 border border-brand-50 transition-transform hover:rotate-12 duration-500">
               <Heart className="w-12 h-12 text-brand-600 fill-brand-600" />
             </div>
             <div>
               <h4 className="text-3xl font-extrabold text-surface-900 tracking-tight leading-none mb-4">Direct Impact Protocol.</h4>
               <p className="text-xl font-medium max-w-3xl text-surface-500 leading-relaxed">
                 The philanthropic core of GolfDraw. 20% of all platform fees are deployed directly to your choice of mission. Zero overhead. Pure impact.
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="py-24 border-t border-surface-100 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-20">
            <div className="space-y-10 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-surface-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-surface-900/20">
                  <Trophy className="text-white w-6 h-6" />
                </div>
                <span className="text-3xl font-extrabold text-surface-900 tracking-tighter">GolfDraw</span>
              </div>
              <p className="text-lg text-surface-500 font-medium leading-relaxed tracking-tight">
                The leading infrastructure for global golfers to certify performance and authorize social impact. Join thousands of athletes building a better world.
              </p>
              <div className="flex gap-4">
                 {/* Social placeholders could go here */}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16 md:gap-32">
              <div className="space-y-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-surface-400">Platform Registry</h4>
                <ul className="space-y-4 text-sm font-bold text-surface-500">
                  <li><Link href="#how-it-works" className="hover:text-brand-600 transition-colors">How it Works</Link></li>
                  <li><Link href="/charities" className="hover:text-brand-600 transition-colors">Partner Directory</Link></li>
                  <li><Link href="#prizes" className="hover:text-brand-600 transition-colors">Economic Model</Link></li>
                </ul>
              </div>
              <div className="space-y-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-surface-400">Governance</h4>
                <ul className="space-y-4 text-sm font-bold text-surface-500">
                  <li><Link href="#" className="hover:text-brand-600 transition-colors">Privacy Protocol</Link></li>
                  <li><Link href="#" className="hover:text-brand-600 transition-colors">Service Level Agreement</Link></li>
                  <li><Link href="#" className="hover:text-brand-600 transition-colors">Compliance</Link></li>
                </ul>
              </div>
              <div className="space-y-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-surface-400">Authorized Support</h4>
                <ul className="space-y-4 text-sm font-bold text-surface-500">
                  <li><Link href="#" className="hover:text-brand-600 transition-colors">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-brand-600 transition-colors">FAQ</Link></li>
                  <li><Link href="#" className="hover:text-brand-600 transition-colors">System Status</Link></li>
                  <li><Link href="#" className="hover:text-brand-600 transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-32 pt-12 border-t border-surface-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[9px] font-black text-surface-300 uppercase tracking-[0.5em] text-center md:text-left">
              © 2026 GolfDraw Core Infrastructure. Optimized for Excellence.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
