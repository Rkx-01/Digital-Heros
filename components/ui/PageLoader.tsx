import { Loader2 } from "lucide-react"

export function PageLoader({ text = "Synchronizing Data..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-brand-100 rounded-[2rem] shadow-inner" />
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin relative z-10" />
      </div>
      <div className="flex flex-col items-center">
        <p className="text-[11px] font-black text-surface-900 uppercase tracking-[0.2em] animate-pulse">{text}</p>
        <p className="text-xs text-surface-400 font-medium mt-2">Connecting securely</p>
      </div>
    </div>
  )
}
