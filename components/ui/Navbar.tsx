"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Trophy, Menu, X, Rocket, Heart, HelpCircle, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

const navLinks = [
  { name: "How it Works", href: "/#how-it-works", icon: HelpCircle },
  { name: "Charities", href: "/charities", icon: Heart },
  { name: "Prizes", href: "/#prizes", icon: Trophy },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-md py-3 border-b border-surface-100 shadow-sm" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-surface-900 rounded-lg flex items-center justify-center transition-colors shadow-sm">
            <Trophy className="text-white w-5 h-5" />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight text-surface-900">
            Golf<span className="text-brand-500">Draw</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-surface-500 hover:text-surface-900 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Join Now</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-surface-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-b border-surface-100 p-6 md:hidden shadow-xl"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-lg font-bold text-surface-900"
              >
                <link.icon className="w-5 h-5 text-brand-500" />
                {link.name}
              </Link>
            ))}
            <hr className="border-surface-100" />
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full">Login</Button>
            </Link>
            <Link href="/signup" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Join Now</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
