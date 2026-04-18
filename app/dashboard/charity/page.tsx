"use client"


import { PageLoader } from "@/components/ui/PageLoader"
import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Heart, Search, TrendingUp, Globe, CheckCircle2, ChevronRight, Share2, Info, Sparkles, Filter, ExternalLink } from "lucide-react"
import Image from "next/image"
import { cn, formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function CharityDashboard() {
  const router = useRouter()
  const [profile, setProfile] = React.useState<any>(null)
  const [preferences, setPreferences] = React.useState<any>(null)
  const [charities, setCharities] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")
  const [selectedContribution, setSelectedContribution] = React.useState<number>(10)

  const fetchData = React.useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Fetch Charity List
      const { data: charitiesData } = await supabase.from('charities').select('*').eq('active', true)
      if (charitiesData) setCharities(charitiesData)

      // Fetch Profile & Preferences
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: prefsData } = await supabase.from('user_charity_preferences').select('*, charities(*)').eq('user_id', user.id).single()
      
      setProfile(profileData)
      setPreferences(prefsData)
      if (prefsData) setSelectedContribution(Number(prefsData.charity_contribution_pct))
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleUpdateCharity(charityId: string) {
    setIsUpdating(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('user_charity_preferences')
      .update({ charity_id: charityId })
      .eq('user_id', profile.id)
    
    if (!error) await fetchData()
    setIsUpdating(false)
  }

  async function handleUpdateContribution() {
    if (selectedContribution < 10) {
      alert("Minimum contribution is 10%")
      return
    }
    setIsUpdating(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('user_charity_preferences')
      .update({ charity_contribution_pct: selectedContribution })
      .eq('user_id', profile.id)
    
    if (!error) await fetchData()
    setIsUpdating(false)
  }

  const categories = ["All", ...Array.from(new Set(charities.map(c => c.category)))]

  const filteredCharities = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredCharities = charities.filter(c => c.featured)

  if (loading) return <PageLoader text="Synchronizing Mission Data..." />

  return (
    <div className="space-y-12 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-surface-900 leading-tight">Charity Impact</h1>
          <p className="text-surface-500 font-medium leading-relaxed">Direct your scores toward a legacy that matters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Left Column: Active Cause & Search ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-12">
          {/* Current Selection HERO */}
          <AnimatePresence mode="wait">
            {preferences?.charities ? (
              <motion.div
                key={preferences.charity_id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-0 border-surface-200 overflow-hidden shadow-2xl bg-white rounded-[2.5rem]">
                  <div className="relative h-72">
                    <motion.div
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                      className="absolute inset-0"
                    >
                      <Image 
                        src={preferences.charities.image_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600"}
                        alt={preferences.charities.name}
                        fill
                        className="object-cover opacity-100 transition-all duration-1000"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 via-surface-900/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-10">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="accent" className="bg-brand-600 text-white border-0 shadow-lg px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                          Active Mission
                        </Badge>
                        <Link href={`/dashboard/charity/${preferences.charity_id}`}>
                          <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors uppercase text-[9px] font-black px-4 py-1.5 cursor-pointer flex items-center gap-2">
                            View Profile <ChevronRight className="w-3.5 h-3.5" />
                          </Badge>
                        </Link>
                      </div>
                      <h2 className="text-5xl font-extrabold text-white mb-2 tracking-tighter leading-tight">{preferences.charities.name}</h2>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                          <Globe className="w-4 h-4 text-brand-400" /> {preferences.charities.category}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-10 bg-white border-t border-surface-100 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm transition-transform hover:scale-105">
                          <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-black text-surface-400 tracking-[0.2em] mb-1">Impact Ledger</span>
                          <p className="text-3xl font-extrabold text-surface-900 leading-none">{formatCurrency(preferences.charities.total_donated || 0)} <span className="text-xs font-bold text-surface-400 uppercase ml-1">Raised</span></p>
                        </div>
                     </div>
                     <Link href={`/dashboard/charity/${preferences.charity_id}`} className="w-full md:w-auto">
                        <Button className="w-full h-14 px-10 rounded-2xl font-extrabold gap-3 text-sm shadow-xl shadow-brand-500/10">
                           Full Performance Analytics <ChevronRight className="w-4 h-4" />
                        </Button>
                     </Link>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="py-24 flex flex-col items-center justify-center border-dashed border-2 border-surface-200 bg-white rounded-[2.5rem]">
                 <div className="w-20 h-20 bg-surface-50 rounded-[1.5rem] flex items-center justify-center mb-6 border border-surface-100">
                    <Heart className="w-10 h-10 text-surface-200" />
                 </div>
                 <h3 className="text-2xl font-extrabold text-surface-900 mb-3 tracking-tight">Select your primary cause.</h3>
                 <p className="text-surface-500 mb-10 max-w-sm text-center font-medium leading-relaxed">Transform your scores into real-world impact by supporting one of our verified partners.</p>
              </Card>
            )}
          </AnimatePresence>

          {/* Featured Spotlight */}
          {featuredCharities.length > 0 && searchTerm === "" && (
            <div className="space-y-8">
              <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-surface-400 flex items-center gap-3">
                <Sparkles className="text-amber-500 w-4 h-4" /> Featured Impact Partners
              </h2>
              <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide px-1">
                {featuredCharities.map(charity => (
                  <Link key={charity.id} href={`/dashboard/charity/${charity.id}`} className="min-w-[300px] group">
                    <Card padding="none" className="overflow-hidden relative h-56 rounded-[2rem] border-surface-200 group-hover:border-brand-500/50 group-hover:shadow-2xl transition-all duration-500 bg-white">
                      <Image 
                        src={charity.image_url} 
                        alt={charity.name} 
                        fill 
                        className="object-cover opacity-100 transition-transform duration-1000 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 p-6 w-full">
                        <span className="text-[9px] font-black uppercase text-brand-400 tracking-widest mb-2 block">{charity.category}</span>
                        <h4 className="text-xl font-extrabold text-white tracking-tight leading-tight">{charity.name}</h4>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Discovery Console */}
          <div className="space-y-10 pt-10 border-t border-surface-100">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
               <div className="space-y-6 flex-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-surface-900 leading-none">Partner Directory</h2>
                  <div className="flex flex-wrap gap-2.5">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all border shadow-sm",
                          selectedCategory === cat 
                            ? "bg-surface-900 text-white border-surface-900" 
                            : "bg-white text-surface-400 hover:text-surface-900 border-surface-200"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="relative w-full xl:max-w-xs pt-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Filter by name or mission..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-surface-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-surface-300"
                />
              </div>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {filteredCharities.map((charity) => {
                  const isCurrent = preferences?.charity_id === charity.id
                  return (
                    <motion.div key={charity.id} variants={item} layout>
                      <Card 
                        padding="none" 
                        className={cn(
                          "p-5 flex items-center justify-between group overflow-hidden relative rounded-2xl transition-all duration-500 border-surface-200",
                          isCurrent 
                            ? "bg-brand-50 border-brand-200 shadow-xl shadow-brand-500/5 ring-1 ring-brand-500/10" 
                            : "bg-white hover:bg-surface-50 hover:shadow-xl hover:border-surface-300"
                        )}
                      >
                        <div className="flex items-center gap-5 relative z-10">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-surface-100 bg-white">
                            <Image src={charity.image_url} alt={charity.name} width={56} height={56} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={cn("text-sm font-extrabold truncate tracking-tight transition-colors", isCurrent ? "text-brand-700" : "text-surface-900 group-hover:text-brand-600")}>{charity.name}</span>
                            <span className="text-[9px] text-surface-400 uppercase font-black tracking-widest mt-0.5">{charity.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 relative z-10 px-1">
                          <Link href={`/dashboard/charity/${charity.id}`} className="w-9 h-9 flex items-center justify-center rounded-lg text-surface-300 hover:text-brand-600 hover:bg-brand-50 transition-all border border-transparent hover:border-brand-100">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          {isCurrent ? (
                            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-4 ring-white">
                              <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleUpdateCharity(charity.id)}
                              isLoading={isUpdating}
                              className="rounded-xl border-surface-200 bg-white hover:bg-white hover:text-brand-600 hover:border-brand-500 h-9 transition-all font-bold px-4"
                            >
                              Select
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* ── Right Panel: Precision Controls ────────────────────────────────────────── */}
        <div className="space-y-8 lg:sticky lg:top-10">
          <motion.div variants={item}>
            <Card className="rounded-[2.5rem] p-10 bg-white border-surface-200 shadow-2xl relative overflow-hidden group">
              <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-10 relative">
                 <div className="w-9 h-9 bg-surface-900 shadow-xl rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-white w-4 h-4" strokeWidth={3} />
                 </div>
                 <h3 className="text-xl font-extrabold text-surface-900 tracking-tight">Mission Split</h3>
              </div>
              
              <div className="space-y-10 relative">
                 <div className="text-center">
                   <motion.div 
                     key={selectedContribution}
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="text-7xl font-extrabold text-surface-900 mb-2 leading-none tracking-tighter"
                   >
                     {selectedContribution}%
                   </motion.div>
                   <p className="text-[10px] text-brand-600 uppercase tracking-[0.2em] font-black">Subscription Allocation</p>
                 </div>

                 <div className="space-y-5">
                   <input 
                     type="range" 
                     min="10" 
                     max="100" 
                     step="5"
                     value={selectedContribution}
                     onChange={(e) => setSelectedContribution(Number(e.target.value))}
                     className="w-full h-2.5 bg-surface-100 rounded-full appearance-none cursor-pointer accent-brand-600 outline-none transition-all hover:bg-surface-200 ring-4 ring-surface-50"
                   />
                   <div className="flex justify-between text-[10px] font-extrabold text-surface-400 uppercase tracking-widest px-1">
                     <span>Min (10%)</span>
                     <span>Max (100%)</span>
                   </div>
                 </div>

                 <div className="p-6 bg-brand-50 rounded-[1.5rem] border border-brand-100 flex items-start gap-4 shadow-inner">
                   <Info className="text-brand-600 w-5 h-5 mt-0.5 shrink-0" />
                   <div className="space-y-1">
                     <p className="text-sm text-surface-700 leading-relaxed font-bold">
                       Current deploy: <span className="text-brand-700 font-extrabold">£{(selectedContribution / 10).toFixed(2)}</span> per cycle.
                     </p>
                     <p className="text-[9px] text-brand-600/50 uppercase font-black tracking-wider">Dynamic allocation tracking</p>
                   </div>
                 </div>

                 <Button 
                   className="w-full h-16 rounded-2xl shadow-xl shadow-brand-500/10 group overflow-hidden relative transition-all text-sm font-extrabold" 
                   disabled={selectedContribution === Number(preferences?.charity_contribution_pct)}
                   onClick={handleUpdateContribution}
                   isLoading={isUpdating}
                 >
                   <span className="relative z-10 flex items-center justify-center gap-3">
                     <Share2 className="w-5 h-5" /> 
                     Redeploy Assets
                   </span>
                   <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="rounded-[2.5rem] bg-surface-900 border-surface-900 p-10 shadow-2xl">
               <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-surface-500 mb-8 border-b border-white/10 pb-4">Operational Protocol</h4>
               <ul className="space-y-5">
                 {[
                   "Zero intermediary processing fees",
                   "Verified charitable status partners",
                   "Real-time ledger transparency",
                   "Impact-weighted scores algorithm"
                 ].map((fact, i) => (
                   <li key={i} className="flex items-center gap-4 text-xs font-bold text-surface-400">
                     <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(13,148,136,0.6)]" />
                     {fact}
                   </li>
                 ))}
               </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
