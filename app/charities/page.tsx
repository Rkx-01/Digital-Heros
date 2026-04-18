import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/ui/Navbar"
import { Card, Badge } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Search, Heart, Globe, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  const supabase = await createClient()
  const query = (await searchParams).q || ""
  const category = (await searchParams).category || ""

  let dbQuery = supabase
    .from("charities")
    .select("*")
    .eq("active", true)

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`)
  }

  if (category && category !== "all") {
    dbQuery = dbQuery.eq("category", category)
  }

  const { data: charities } = await dbQuery.order("featured", { ascending: false })

  const { data: categories } = await supabase
    .from("charities")
    .select("category")
    .eq("active", true)

  const uniqueCategories = ["all", ...new Set(categories?.map((c) => c.category).filter(Boolean))]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-white border-b border-surface-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-extrabold text-surface-900 mb-8 tracking-tighter leading-[1.1]">
              Impact <span className="text-brand-600">Starts Here.</span>
            </h1>
            <p className="text-surface-500 text-xl font-medium leading-relaxed max-w-xl">
              Discover dedicated partner charities. Every membership contribution is deployed directly to fuel their global mission.
            </p>
          </div>
        </div>
      </section>

      {/* ── Filters & Search ────────────────────────────────────────── */}
      <section className="py-12 bg-surface-50/30 flex-1">
        <div className="container mx-auto px-6">
          <div className="flex flex-col xl:flex-row gap-8 items-start justify-between mb-16">
            <form className="relative w-full xl:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-300 w-5 h-5" />
              <input 
                type="text" 
                name="q"
                defaultValue={query}
                placeholder="Search by mission or keyword..." 
                className="w-full bg-white border border-surface-200 rounded-2xl py-4.5 pl-14 pr-6 text-surface-900 font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-surface-200 shadow-sm"
              />
            </form>
            
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 w-full xl:w-auto">
              {uniqueCategories.map((cat) => (
                <Link 
                  key={cat} 
                  href={`/charities${cat === "all" ? "" : `?category=${cat}`}`}
                >
                  <Button 
                    variant={category === cat || (!category && cat === "all") ? "primary" : "outline"}
                    className={cn(
                      "whitespace-nowrap rounded-xl px-6 py-2 h-auto text-[10px] font-black uppercase tracking-widest",
                      (category === cat || (!category && cat === "all")) 
                        ? "shadow-lg shadow-brand-500/20" 
                        : "bg-white border-surface-200 text-surface-400 hover:text-surface-900 hover:border-surface-900"
                    )}
                  >
                    {cat}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Charity Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {charities?.map((charity) => (
              <Card key={charity.id} padding="none" className="flex flex-col h-full group bg-white border-surface-200 shadow-xl shadow-surface-900/[0.03] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-brand-500/30" hover>
                <div className="relative aspect-[16/10] overflow-hidden">
                  {charity.featured && (
                    <div className="absolute top-5 left-5 z-10">
                      <Badge variant="accent" className="flex items-center gap-2 shadow-xl bg-surface-900 text-white border-0 font-black uppercase text-[9px] px-4 py-1.5 rounded-full">
                        <Heart className="w-3 h-3 fill-emerald-400 text-emerald-400" /> Spotlight
                      </Badge>
                    </div>
                  )}
                  <Image 
                    src={charity.image_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600"} 
                    alt={charity.name}
                    fill
                    className="object-cover transform transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-emerald-700 font-extrabold uppercase text-[9px] px-3 py-1 rounded-lg">{charity.category}</Badge>
                  </div>
                  <h3 className="text-2xl font-extrabold text-surface-900 mb-4 tracking-tight leading-tight group-hover:text-brand-600 transition-colors">{charity.name}</h3>
                  <p className="text-surface-500 font-medium text-sm mb-8 line-clamp-3 leading-relaxed">
                    {charity.description}
                  </p>
                  <div className="mt-auto pt-8 border-t border-surface-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-surface-300 tracking-widest">
                      <Globe className="w-3.5 h-3.5" />
                      Certified NGO
                    </div>
                    <Link href={`/signup?charity=${charity.id}`}>
                      <Button className="h-11 px-6 rounded-xl font-extrabold text-xs shadow-lg shadow-brand-500/10">
                        Adopt Mission <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {!charities?.length && (
            <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-surface-100">
               <div className="w-24 h-24 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-surface-100">
                 <Search className="w-10 h-10 text-surface-200" />
               </div>
              <h2 className="text-3xl font-extrabold text-surface-900 mb-3 tracking-tight">No charities matched.</h2>
              <p className="text-surface-400 font-medium max-w-xs mx-auto mb-10">Try adjusting your filters or search keywords to find the right cause.</p>
              <Link href="/charities">
                <Button variant="outline" className="px-10 h-14 rounded-2xl font-extrabold border-surface-200">Reset Directory View</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="py-20 bg-white border-t border-surface-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-surface-300 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Official Charitable Registry</p>
          <p className="text-surface-200 text-[8px] font-bold uppercase tracking-widest">© 2026 GolfDraw Platforms Infrastructure. Verified for high-impact transparency.</p>
        </div>
      </footer>
    </div>
  )
}
