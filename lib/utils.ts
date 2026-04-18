import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Downloads data as a CSV file
 */
export function downloadAsCSV(data: any[], filename: string) {
  if (!data.length) return

  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(obj => 
    Object.values(obj)
      .map(val => (typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val))
      .join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function getNextDrawDate(): Date {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth
}

export function getDaysUntilDraw(): number {
  const now = new Date()
  const nextDraw = getNextDrawDate()
  const diff = nextDraw.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function tierLabel(tier: number): string {
  switch (tier) {
    case 1: return 'Jackpot 🏆'
    case 2: return 'Tier 2 – 4 Matches'
    case 3: return 'Tier 3 – 3 Matches'
    default: return 'No Match'
  }
}

export function tierColor(tier: number): string {
  switch (tier) {
    case 1: return 'from-yellow-400 to-orange-500'
    case 2: return 'from-indigo-400 to-purple-500'
    case 3: return 'from-emerald-400 to-teal-500'
    default: return 'from-gray-400 to-gray-500'
  }
}

export function subscriptionStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-emerald-400'
    case 'trialing': return 'text-blue-400'
    case 'past_due': return 'text-yellow-400'
    case 'cancelled':
    case 'inactive': return 'text-red-400'
    default: return 'text-gray-400'
  }
}
