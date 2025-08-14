"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      variant="outline"
      size="icon"
      className={`fixed bottom-6 left-6 z-50 rounded-full transition-all duration-300 ${
        theme === "light"
          ? "bg-white border-gray-300 hover:bg-gray-100 shadow-lg"
          : "bg-black/80 border-bright-aqua/50 hover:bg-bright-aqua/10 neon-border"
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUp className={`h-5 w-5 ${
        theme === "light" ? "text-gray-600" : "text-bright-aqua"
      }`} />
    </Button>
  )
}