import type React from "react"
import Link from "next/link"
import { Calendar } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  showBackLink?: boolean
}

export function AuthLayout({ children, title, description, showBackLink = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-card relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(8,203,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,203,0,0.03)_1px,transparent_1px)] bg-size:64px_64px" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">EventFlow</span>
          </Link>

          {/* Testimonial */}
          <div className="max-w-md">
            <blockquote className="text-2xl font-medium text-foreground leading-relaxed mb-6">
              "EventFlow made managing our annual tech conference effortless. The platform is intuitive and the support
              team is incredible."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                <img src="/professional-headshot.png" alt="Testimonial author" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Alex Chen</div>
                <div className="text-sm text-muted-foreground">Head of Events, TechCorp</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-12">
            <div>
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Events Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">2M+</div>
              <div className="text-sm text-muted-foreground">Tickets Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EventFlow</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {showBackLink && (
              <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to home
              </Link>
            )}

            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
