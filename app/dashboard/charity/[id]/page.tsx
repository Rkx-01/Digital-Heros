export const dynamic = 'force-dynamic';
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Heart, 
  ArrowLeft, 
  Calendar, 
  Globe, 
  TrendingUp, 
  Award, 
  DollarSign,
  Share2,
  ExternalLink,
  Info
} from "lucide-react"
import Image from "next/image"
import { formatDate, formatCurrency, cn } from "@/lib/utils"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

export default function CharityProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [charity, setCharity] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [isDonating, setIsDonating] = React.useState(false)
  const [donationAmount, setDonationAmount] = React.useState(25)

  const fetchCharity = React.useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', id)
      .single()

    if (data) setCharity(data)
    setLoading(false)
  }, [id])

  React.useEffect(() => {
    fetchCharity()
  }, [fetchCharity])

  async function handleOneOffDonation() {
    setIsDonating(true)
    const response = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        charity_id: id,
        amount: donationAmount
      })
    })

    if (response.ok) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#ffffff']
      })
      await fetchCharity()
      alert(`Thank you! Your £${donationAmount} donation has been processed.`)
    }
    setIsDonating(false)
  }

  if (loading) return <div className="pt-20 text-center animate-pulse text-gray-500">Retrieving mission data...</div>
  if (!charity) return <div className="pt-20 text-center text-gray-500">Charity not found.</div>

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Navigation */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group mb-4"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </button>

      {/* Hero Header */}
      <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
        <Image 
          src={charity.image_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1000"}
          alt={charity.name}
          fill
          className="object-cover opacity-60 scale-105 group-hover:scale-100 transition-transform duration-[3s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 md:p-14 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <Badge variant="accent" className="bg-brand-500 text-white border-0 uppercase font-black tracking-widest px-4 py-1">
              Partly-Partnered
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              {charity.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300 font-bold">
              <span className="flex items-center gap-2 text-brand-400">
                <Globe className="w-5 h-5" /> {charity.category}
              </span>
              <span className="opacity-20">|</span>
              <span className="flex items-center gap-2">
                < Award className="w-5 h-5 text-yellow-500" /> Platinum Verified cause
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="h-14 px-8 rounded-2xl gap-2 font-black shadow-xl" onClick={() => window.open(charity.website_url, '_blank')}>
              <ExternalLink className="w-4 h-4" /> Visit Website
            </Button>
            <Button variant="outline" className="h-14 w-14 rounded-2xl p-0">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <Card className="rounded-[2rem] p-10 bg-surface-800/20">
            <h2 className="text-2xl font-black mb-6">Our Mission</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 text-lg leading-relaxed">
                {charity.description || "No detailed description available."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
               <div className="bg-surface-900/50 p-6 rounded-2xl border border-surface-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-success-500/10 rounded-xl flex items-center justify-center text-success-500 font-black">
                     <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-black text-gray-500 tracking-widest">Total Impact</span>
                    <span className="text-2xl font-black tracking-tight">{formatCurrency(charity.total_donated || 0)}</span>
                  </div>
               </div>
               <div className="bg-surface-900/50 p-6 rounded-2xl border border-surface-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500 font-black">
                     <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-black text-gray-500 tracking-widest">Lives Touched</span>
                    <span className="text-2xl font-black tracking-tight">~{(Number(charity.total_donated || 0) * 1.5).toFixed(0)}</span>
                  </div>
               </div>
            </div>
          </Card>

          {/* Events Section */}
          <Card className="rounded-[2rem] p-10 bg-surface-900 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5">
                <Calendar className="w-32 h-32" />
             </div>
             <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
               <Calendar className="text-brand-500" /> Upcoming Events
             </h2>
             
             {charity.upcoming_events ? (
               <div className="space-y-6">
                 {charity.upcoming_events.split('
').map((event: string, i: number) => (
                   <div key={i} className="flex gap-6 p-6 bg-surface-800 rounded-3xl group hover:bg-surface-700 transition-colors">
                      <div className="w-2 rounded-full bg-brand-500" />
                      <div>
                        <p className="text-lg font-bold text-white mb-1">{event}</p>
                        <p className="text-sm text-gray-500 font-medium">Virtual Fundraiser • Multiple Venues</p>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-12 flex flex-col items-center justify-center bg-surface-800/30 rounded-3xl border-dashed border-2 border-surface-700">
                  <Info className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-gray-500 font-medium">No upcoming events scheduled.</p>
               </div>
             )}
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] p-10 bg-gradient-to-br from-brand-600/20 to-surface-800 border-brand-500/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <DollarSign className="w-6 h-6 text-brand-500" />
              <h3 className="text-xl font-black tracking-tight">Make an Impact</h3>
            </div>
            
            <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">
              Want to do more? Make a one-off donation directly to <span className="text-white font-bold">{charity.name}</span>. 100% of these funds are transferred immediately.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-8">
              {[10, 25, 50].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setDonationAmount(amt)}
                  className={cn(
                    "py-3 rounded-xl font-black transition-all border-2",
                    donationAmount === amt 
                      ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20" 
                      : "bg-surface-800 text-gray-500 border-surface-700 hover:border-gray-600"
                  )}
                >
                  £{amt}
                </button>
              ))}
            </div>

            <div className="relative mb-8">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">£</span>
               <input 
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                className="w-full h-14 bg-surface-900 border-2 border-surface-800 rounded-2xl pl-8 pr-4 font-black focus:border-brand-500 outline-none transition-all"
               />
            </div>

            <Button className="w-full h-16 rounded-2xl gap-3 text-lg font-black shadow-xl" onClick={handleOneOffDonation} isLoading={isDonating}>
              <Heart className="w-5 h-5" /> Process Donation
            </Button>
          </Card>

          <Card className="rounded-[2rem] p-8 border-dashed border-2 bg-surface-900 border-surface-800">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4">Financial Ethics</h4>
             <ul className="space-y-3">
               {[
                "Instant ledger verification",
                "Automated tax receipts",
                "Zero platform overhead"
               ].map((text, i) => (
                 <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    {text}
                 </li>
               ))}
             </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
