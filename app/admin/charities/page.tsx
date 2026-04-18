"use client"

import * as React from "react"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  Heart, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Globe, 
  Activity,
  Image as ImageIcon
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { CharityForm } from "@/components/admin/CharityForm"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminCharitiesPage() {
  const [charities, setCharities] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingCharity, setEditingCharity] = React.useState<any>(null)

  const fetchCharities = React.useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('charities')
      .select('*')
      .order('featured', { ascending: false })
      .order('name', { ascending: true })
    
    if (data) setCharities(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchCharities()
  }, [fetchCharities])

  async function toggleFeatured(id: string, current: boolean) {
    setIsProcessing(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('charities')
      .update({ featured: !current })
      .eq('id', id)
    
    if (!error) fetchCharities()
    setIsProcessing(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this charity?')) return
    setIsProcessing(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('charities')
      .delete()
      .eq('id', id)
    
    if (!error) fetchCharities()
    setIsProcessing(false)
  }

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="pt-20 text-center animate-pulse text-gray-500">Loading charities...</div>

  return (
    <div className="space-y-10 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 leading-tight">Charity Management</h1>
          <p className="text-surface-500 font-medium">Manage the global list of charitable organizations on the platform.</p>
        </div>
        <Button className="gap-2 h-11 px-8 font-bold shadow-lg shadow-brand-500/10" onClick={() => { setEditingCharity(null); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4" /> Add Charity
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-8 shadow-2xl border-surface-200 bg-white">
                <CharityForm 
                  charity={editingCharity}
                  onSuccess={() => { setIsFormOpen(false); fetchCharities(); }}
                  onCancel={() => setIsFormOpen(false)}
                />
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search & Filter ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
           <input 
             type="text" 
             placeholder="Search by name or category..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white border border-surface-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredCharities.map((charity) => (
          <Card key={charity.id} padding="none" className="p-5 flex items-center justify-between group border-surface-200 bg-white" hover>
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-50 shrink-0 relative border border-surface-100 shadow-inner">
                {charity.image_url ? (
                  <Image src={charity.image_url} alt={charity.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-surface-200">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-extrabold text-surface-900">{charity.name}</h3>
                  {charity.featured && <Badge variant="accent" className="text-[9px] font-bold">Featured Partner</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wider text-surface-400">
                  <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-surface-300" /> {charity.category}</span>
                  <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-emerald-500" /> Verified Active</span>
                  <span className="text-brand-600 font-extrabold">£{charity.total_donated || 0} Total Impact</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-11 w-11 p-0 rounded-xl transition-all", charity.featured ? "text-amber-500 bg-amber-50 border-amber-100" : "text-surface-400 hover:bg-surface-50 border-transparent")}
                onClick={() => toggleFeatured(charity.id, charity.featured)}
                disabled={isProcessing}
                title={charity.featured ? "Unfeature" : "Feature"}
              >
                <Heart className={cn("w-5 h-5", charity.featured && "fill-current")} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-11 w-11 p-0 text-surface-400 hover:text-surface-900 border-transparent hover:bg-surface-50 rounded-xl"
                onClick={() => { setEditingCharity(charity); setIsFormOpen(true); }}
              >
                <Edit2 className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-11 w-11 p-0 text-surface-400 hover:text-red-600 border-transparent hover:bg-red-50 rounded-xl"
                onClick={() => handleDelete(charity.id)}
                disabled={isProcessing}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        ))}

        {!filteredCharities.length && (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-surface-200">
            <Heart className="w-16 h-16 text-surface-100 mx-auto mb-6" />
            <p className="text-surface-500 font-bold">No charities found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
