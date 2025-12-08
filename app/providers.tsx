"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { WebSocketProvider } from "@/contexts/websocket-context"
import { Toaster } from "@/components/ui/toaster"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <WebSocketProvider>
        {children}
        <Toaster />
      </WebSocketProvider>
    </ThemeProvider>
  )
}
