// app/layout.js
import { Inter } from "next/font/google"
import "./globals.css"
import "@/lib/suppress-errors"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { WalletProvider } from "@/hooks/use-wallet"
import { NFTProvider } from "@/hooks/use-nft"
import { DiscordProvider } from "@/hooks/use-discord"
import { AchievementProvider } from "@/hooks/use-achievement"
import { TutorialProvider } from "@/hooks/use-tutorial"
import { BadgeMarketplaceProvider } from "@/hooks/use-badge-marketplace"
import { BalanceProvider } from "@/hooks/use-balance"
import { ParticleSystem } from "@/components/particle-system"
import { ScrollToTop } from "@/components/scroll-to-top"
import { PrivyProviderWrapper } from "@/components/privy-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "IOPn REP Dashboard",
  description: "Your gateway to the IOPn ecosystem",
  icons: {
    icon: "https://i.ibb.co/dN1sMhw/logo.jpg",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PrivyProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <WalletProvider>
                <NFTProvider>
                  <DiscordProvider>
                    <AchievementProvider>
                      <TutorialProvider>
                        <BadgeMarketplaceProvider>
                          <BalanceProvider>
                            <ParticleSystem />
                            {children}
                            <ScrollToTop />
                          </BalanceProvider>
                        </BadgeMarketplaceProvider>
                      </TutorialProvider>
                    </AchievementProvider>
                  </DiscordProvider>
                </NFTProvider>
              </WalletProvider>
            </AuthProvider>
          </ThemeProvider>
        </PrivyProviderWrapper>
      </body>
    </html>
  )
}