"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { 
  Heart, 
  Globe, 
  Image as ImageIcon,
  Save,
  X,
  Plus,
  Edit2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CharityFormProps {
  charity?: any
  onSuccess: () => void
  onCancel: () => void
}

export function CharityForm({ charity, onSuccess, onCancel }: CharityFormProps) {
  const [formData, setFormData] = React.useState({
    name: charity?.name || "",
    description: charity?.description || "",
    image_url: charity?.image_url || "",
    website_url: charity?.website_url || "",
    category: charity?.category || "Sports",
    upcoming_events: charity?.upcoming_events || ""
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    
    if (charity?.id) {
      // Update
      const { error } = await supabase
        .from('charities')
        .update(formData)
        .eq('id', charity.id)
      
      if (!error) onSuccess()
    } else {
      // Create
      const { error } = await supabase
        .from('charities')
        .insert([formData])
      
      if (!error) onSuccess()
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black flex items-center gap-2">
          {charity ? <Edit2 className="w-5 h-5 text-brand-500" /> : <Plus className="w-5 h-5 text-brand-500" />}
          {charity ? "Edit Charity" : "Register New Charity"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-surface-400 tracking-widest pl-1">Charity Name</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface-50 border border-surface-200 text-surface-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium"
              placeholder="e.g. World Wildlife Fund"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-surface-400 tracking-widest pl-1">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-surface-50 border border-surface-200 text-surface-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium"
            >
              <option value="Environmental">Environmental</option>
              <option value="Sports">Sports</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Community">Community</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-surface-400 tracking-widest pl-1">Description</label>
          <textarea 
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-surface-50 border border-surface-200 text-surface-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none font-medium"
            placeholder="Tell us about their mission..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-surface-400 tracking-widest pl-1">Image URL</label>
            <div className="relative">
               <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
               <input 
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 text-surface-900 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-surface-400 tracking-widest pl-1">Website</label>
            <div className="relative">
               <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
               <input 
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full bg-surface-50 border border-surface-200 text-surface-900 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium"
                placeholder="https://charity.org"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="submit" isLoading={isSubmitting} className="flex-1 gap-2 h-12 font-bold shadow-lg shadow-emerald-600/10 bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4" /> {charity ? "Save Changes" : "Register Charity"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="h-12 border-surface-200 font-bold">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
