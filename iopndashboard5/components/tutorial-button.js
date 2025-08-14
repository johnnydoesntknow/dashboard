"use client"

import { Button } from "@/components/ui/button"
import { useTutorial } from "@/hooks/use-tutorial"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function TutorialButton({ pageId }) {
  const { showTutorial } = useTutorial()
  const { theme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't render on auth pages or if not mounted
  if (!mounted || pathname === '/auth' || pathname === '/login') {
    return null
  }
  
  const handleClick = () => {
    // Use pageId if provided, otherwise showTutorial will use current pathname
    showTutorial(pageId)
  }
  
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="icon"
      className={`fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-200 ${
        theme === "light"
          ? "bg-purple-600 hover:bg-purple-700 border-0 text-white"
          : "bg-purple-600 hover:bg-purple-700 border-0 text-white"
      }`}
      title="Show tutorial"
    >
      <span className="text-sm font-bold">?</span>
    </Button>
  )
}