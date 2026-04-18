import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout as DashboardLayoutClient } from "@/components/layout/DashboardLayout"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  )
}
