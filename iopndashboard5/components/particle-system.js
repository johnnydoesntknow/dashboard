"use client"

import { useEffect, useState } from "react"

export function ParticleSystem({ trigger, type = "achievement", position }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (trigger) {
      generateParticles()
    }
  }, [trigger])

  const generateParticles = () => {
    const newParticles = []
    const particleCount = type === "achievement" ? 20 : 10
    
    for (let i = 0; i < particleCount; i++) {
      const particle = {
        id: Math.random(),
        x: position?.x || window.innerWidth / 2,
        y: position?.y || window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        size: Math.random() * 20 + 10,
        color: getParticleColor(type),
        emoji: getParticleEmoji(type),
      }
      newParticles.push(particle)
    }
    
    setParticles(newParticles)
    
    // Clear particles after animation
    setTimeout(() => {
      setParticles([])
    }, 2000)
  }

  const getParticleColor = (type) => {
    const colors = {
      achievement: ["#00FFFF", "#8B00FF", "#DC143C"],
      reward: ["#FFD700", "#FF8C00", "#00FFFF"],
      milestone: ["#8B00FF", "#DC143C", "#00FFFF"],
    }
    const typeColors = colors[type] || colors.achievement
    return typeColors[Math.floor(Math.random() * typeColors.length)]
  }

  const getParticleEmoji = (type) => {
    const emojis = {
      achievement: ["⭐", "🎉", "✨", "🎊", "🌟"],
      reward: ["💎", "🏆", "🎁", "💰", "🌟"],
      milestone: ["🚀", "🎯", "🏅", "👑", "🌟"],
    }
    const typeEmojis = emojis[type] || emojis.achievement
    return typeEmojis[Math.floor(Math.random() * typeEmojis.length)]
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute text-2xl"
          style={{
            left: particle.x,
            top: particle.y,
            color: particle.color,
            fontSize: `${particle.size}px`,
            animation: `float-up 2s ease-out forwards`,
            transform: `translate(-50%, -50%)`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  )
}