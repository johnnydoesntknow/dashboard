"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useTutorial } from "@/hooks/use-tutorial"
import { useTheme } from "next-themes"

export function TutorialPopup() {
  const {
    isVisible,
    currentTutorial,
    closeTutorial,
    handleSecondaryAction
  } = useTutorial()
  const { theme } = useTheme()

  if (!isVisible || !currentTutorial) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeTutorial}
      />
      
      {/* Tutorial Card */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <Card 
          className={`w-full max-w-md animate-in zoom-in-95 duration-200 ${
            theme === "light" 
              ? "bg-white border-gray-200 shadow-2xl" 
              : "bg-gray-900 border-gray-800"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-6">
            {/* Header with icon */}
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                theme === "light"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-purple-600 text-white"
              }`}>
                <span className="text-sm font-bold">?</span>
              </div>
              <h2 className={`text-xl font-bold ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}>
                {currentTutorial.title}
              </h2>
            </div>
            
            {/* Content */}
            <p className={`mb-6 text-sm leading-relaxed ${
              theme === "light" ? "text-gray-700" : "text-gray-300"
            }`}>
              {currentTutorial.content}
            </p>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={closeTutorial}
                variant="outline"
                className={`flex-1 ${
                  theme === "light"
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {currentTutorial.primaryButton}
              </Button>
              
              <Button
                onClick={handleSecondaryAction}
                className={`flex-1 ${
                  theme === "light"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {currentTutorial.secondaryButton}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}