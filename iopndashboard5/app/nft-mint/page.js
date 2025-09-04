"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useTheme } from "next-themes"
import { useAchievement } from "@/hooks/use-achievement"
import { AlertCircle, CheckCircle, RefreshCw, Star, Gift, Sparkles } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/hooks/use-wallet"
import { useDiscord } from "@/hooks/use-discord"
import { TutorialButton } from "@/components/tutorial-button"
import { TutorialPopup } from "@/components/tutorial-popup"
import { toast } from "sonner"
import { useContracts } from '@/hooks/use-contracts'

export default function NFTMintPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { triggerAchievement } = useAchievement()
  const { isConnected } = useWallet()
  const { isDiscordConnected } = useDiscord()
  const [currentStep, setCurrentStep] = useState(1)
  const [nftDescription, setNftDescription] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [generatedImages, setGeneratedImages] = useState([])
  const [existingNFT, setExistingNFT] = useState(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const { mintNFT, checkHasNFT } = useContracts()
  const { walletAddress } = useWallet()
const { discordUser } = useDiscord()

  // Auth guard - check if user has completed onboarding
  useEffect(() => {
    const checkAuth = () => {
      const discordSkipped = localStorage.getItem("iopn-discord-skipped")
      
      if (!isConnected) {
        router.push("/")
        return
      }
      
      if (!isDiscordConnected && !discordSkipped) {
        router.push("/")
        return
      }
      
      setIsAuthChecking(false)
    }
    
    checkAuth()
  }, [isConnected, isDiscordConnected, router])

  // Check if user already has an NFT
  useEffect(() => {
    if (!isAuthChecking) {
      const savedNFT = localStorage.getItem("iopn-user-nft")
      if (savedNFT) {
        try {
          const parsed = JSON.parse(savedNFT)
          // Only set existing NFT if it has a valid image URL (from IPFS)
          if (parsed.image && (parsed.image.startsWith('http') || parsed.image.startsWith('ipfs'))) {
            setExistingNFT(parsed)
          } else {
            // Clear invalid NFT data
            localStorage.removeItem("iopn-user-nft")
          }
        } catch (e) {
          console.error("Invalid NFT data:", e)
          localStorage.removeItem("iopn-user-nft")
        }
      }
    }
  }, [isAuthChecking])

  // Generate images function
  const generateImages = async () => {
    if (!nftDescription.trim()) {
      toast.error('Please describe what you want your NFT to look like')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '100'  // Your API key from .env
        },
        body: JSON.stringify({ 
          prompt: nftDescription
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to generate images')
      }
      
      const data = await response.json()
      
      // Convert filenames to full URLs
      const imageUrls = data.images.map(filename => 
        `http://localhost:3001/images/${filename}`
      )
      
      setGeneratedImages(imageUrls)
      setCurrentStep(2)  // Move to image selection step
      toast.success('Images generated successfully! Choose your favorite.')
      
    } catch (error) {
      console.error('Failed to generate images:', error)
      toast.error('Failed to generate images. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Regenerate images function
  const regenerateImages = async () => {
    setGeneratedImages([])  // Clear current images
    setSelectedImage(null)  // Clear selection
    await generateImages()   // Generate new ones
  }


// Updated handleMint function
const handleMint = async () => {
  if (!selectedImage) {
    toast.error('Please select an image first')
    return
  }
  
  setIsMinting(true)
  setCurrentStep(3)
  
  try {
    // Progress: Upload to IPFS (0-30%)
    for (let i = 0; i <= 30; i += 10) {
      setMintProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // Extract filename from URL
    const filename = selectedImage.split('/').pop()
    
    // Upload to IPFS
    const response = await fetch('http://localhost:3001/upload/ipfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '100'
      },
      body: JSON.stringify({ 
        filename,
        name: `Origin Genesis #${Math.floor(Math.random() * 9999) + 1}`,
        description: nftDescription
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to upload to IPFS')
    }
    
    const { metadata_url, image_url, metadata } = await response.json()
    
    // Progress: Mint on-chain (30-70%)
    setMintProgress(40)
    toast.info('Minting on blockchain... Please confirm in your wallet')
    
    // Mint NFT on-chain (user pays gas)
    const receipt = await mintNFT(referralCode || '')
    
    // Get token ID from receipt
    const mintEvent = receipt.events?.find(e => e.event === 'NFTMinted')
    const tokenId = mintEvent?.args?.tokenId?.toNumber() || Date.now()
    
    setMintProgress(70)
    
    // Link Discord if connected (backend pays gas)
    if (discordUser && walletAddress) {
      try {
        await fetch('http://localhost:3001/api/rep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'linkDiscord',
            wallet: walletAddress,
            discordId: discordUser.id
          })
        })
        toast.success('Discord linked to your NFT!')
      } catch (error) {
        console.error('Failed to link Discord:', error)
        // Non-critical, continue
      }
    }
    
    setMintProgress(80)
    
    // Register referral if applicable
    if (referralCode && walletAddress) {
      try {
        // Get referrer address from referral code
        await fetch('http://localhost:3001/api/rep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'registerReferral',
            referred: walletAddress,
            referrer: referralCode // You might need to resolve this to an address
          })
        })
      } catch (error) {
        console.error('Failed to register referral:', error)
        // Non-critical, continue
      }
    }
    
    setMintProgress(90)
    
    // Save NFT data with blockchain info
    const nftData = {
      id: `nft_${tokenId}`,
      tokenId: tokenId,
      name: metadata.name,
      description: nftDescription,
      image: image_url,
      metadataUrl: metadata_url,
      mintedAt: new Date().toISOString(),
      txHash: receipt.transactionHash,
      referralCode: referralCode,
      badges: []
    }
    
    // Save to localStorage
    localStorage.setItem("iopn-user-nft", JSON.stringify(nftData))
    
    setMintProgress(100)
    
    // Trigger achievement
    triggerAchievement({
      id: "first_nft",
      title: "Genesis Creator!",
      description: "You've minted your first Origin NFT",
      type: "achievement",
    })
    
    toast.success(`NFT minted successfully! Token ID: ${tokenId}`)
    
    // Redirect to showcase
    setTimeout(() => {
      router.push("/nft-showcase")
    }, 1000)
    
  } catch (error) {
    console.error('Minting failed:', error)
    
    // Check if user rejected transaction
    if (error.code === 4001 || error.message?.includes('rejected')) {
      toast.error('Transaction cancelled')
    } else if (error.message?.includes('Already has Origin NFT')) {
      toast.error('You already have an Origin NFT')
    } else {
      toast.error(`Minting failed: ${error.message || 'Please try again'}`)
    }
    
    setCurrentStep(2) // Go back to image selection
  } finally {
    setIsMinting(false)
    setMintProgress(0)
  }
}

  // If user already has an NFT
  if (existingNFT) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className={`min-h-screen p-4 md:p-8 ${
            theme === "light" 
              ? "bg-gradient-to-br from-bright-aqua/10 via-violet-indigo/10 to-amber-rust/10" 
              : "bg-black cyber-grid hex-pattern"
          }`}>
            <div className="container mx-auto max-w-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
                  theme === "light" 
                    ? "from-gray-800 to-gray-600" 
                    : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                }`}>
                  Your Origin NFT
                </h1>
                <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === "light" 
                    ? "from-gray-800 to-gray-600" 
                    : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                }`}>
                  You have already minted your unique Origin NFT
                </p>
              </div>

              {/* NFT Display */}
              <Card className={`${
                theme === "light"
                  ? "bg-white border-bright-aqua/50 shadow-xl shadow-bright-aqua/20"
                  : "holo-card bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
              }`}>
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="relative inline-block">
                      <img
                        src={existingNFT.image}
                        alt={existingNFT.name}
                        className="w-full max-w-md h-auto rounded-lg shadow-2xl"
                      />
                    </div>
                    
                    <div>
                      <h2 className={`text-2xl font-bold mb-2 ${
                        theme === "light" ? "text-gray-800" : "text-white"
                      }`}>
                        {existingNFT.name}
                      </h2>
                      <p className={`mb-4 ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}>
                        {existingNFT.description || "A unique Origin NFT in the IOPn ecosystem"}
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Badge className="bg-violet-indigo/20 text-violet-indigo border-violet-indigo/50">
                          Origin Collection
                        </Badge>
                        <Badge className="bg-bright-aqua/20 text-bright-aqua border-bright-aqua/50">
                          Unique
                        </Badge>
                      </div>
                      <p className={`text-sm ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}>
                        Minted on: {new Date(existingNFT.mintedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="pt-6 space-y-3">
                      <Button
                        onClick={() => router.push("/nft-showcase")}
                        className="w-full bg-gradient-to-r from-bright-aqua to-blue-500 hover:from-bright-aqua/90 hover:to-blue-500/90 text-white"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Customize Your NFT
                      </Button>
                      <p className={`text-xs ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}>
                        Each wallet can only mint one Origin NFT
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Add this somewhere before the return statement
const styleTips = [
  { color: "bright-aqua", label: "Be specific about colors, lighting, and mood" },
  { color: "violet-indigo", label: "Mention style (cyberpunk, futuristic, mystical, etc.)" },
  { color: "amber-rust", label: "Describe character poses, expressions, or actions" },
  { color: "bright-aqua", label: "Include environment details for more depth" }
]
  // Main minting flow
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className={`min-h-screen ${
          theme === "light" 
            ? "bg-gradient-to-br from-bright-aqua/10 via-violet-indigo/10 to-amber-rust/10" 
            : "bg-black cyber-grid hex-pattern"
        }`}>
          <div className="container mx-auto p-6 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
                theme === "light" 
                  ? "from-gray-800 to-gray-600" 
                  : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
              }`}>
                Mint Your NFT
              </h1>
              <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
                theme === "light" 
                  ? "from-gray-800 to-gray-600" 
                  : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
              }`}>
                Create your unique IOPn identity and join the ecosystem
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 1 ? "bg-bright-aqua" : theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } text-white font-bold`}>
                  1
                </div>
                <div className={`w-24 h-1 ${
                  currentStep >= 2 ? "bg-bright-aqua" : theme === "light" ? "bg-gray-300" : "bg-gray-600"
                }`} />
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 2 ? "bg-bright-aqua" : theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } text-white font-bold`}>
                  2
                </div>
                <div className={`w-24 h-1 ${
                  currentStep >= 3 ? "bg-bright-aqua" : theme === "light" ? "bg-gray-300" : "bg-gray-600"
                }`} />
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 3 ? "bg-bright-aqua" : theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } text-white font-bold`}>
                  3
                </div>
              </div>
            </div>

            {/* Step 1: Describe NFT */}
            {currentStep === 1 && (
              <Card className={`max-w-2xl mx-auto ${
                theme === "light" 
                  ? "bg-white border-bright-aqua/50 shadow-xl shadow-bright-aqua/20" 
                  : "bg-black/80 border-bright-aqua/30 backdrop-blur-sm"
              }`}>
                <CardHeader>
                  <CardTitle className={`text-2xl ${
                    theme === "light" ? "text-gray-800" : "text-white"
                  }`}>
                    Describe Your NFT
                  </CardTitle>
                  <CardDescription className={
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }>
                    Describe what you want your Origin NFT to look like. Be creative and specific!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}>
                      NFT Description
                    </label>
                    <textarea
                      value={nftDescription}
                      onChange={(e) => setNftDescription(e.target.value)}
                      placeholder="e.g., A mystical warrior standing in a cyberpunk cityscape with neon lights, wearing futuristic armor with glowing blue accents..."
                      className={`w-full h-32 px-4 py-3 rounded-lg border transition-all ${
                        theme === "light"
                          ? "bg-gray-50 border-bright-aqua/30 text-gray-800 placeholder:text-gray-400 focus:border-bright-aqua focus:outline-none focus:ring-2 focus:ring-bright-aqua/20"
                          : "bg-black/50 border-bright-aqua/30 text-white focus:border-bright-aqua focus:outline-none focus:ring-2 focus:ring-bright-aqua/20"
                      }`}
                      maxLength={500}
                    />
                    <p className={`text-xs mt-1 ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      {nftDescription.length}/500 characters
                    </p>
                  </div>

                  {/* Style Tips */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}>
                      💡 Pro Tips:
                    </h3>
                    <div className="space-y-2">
                      {styleTips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className={`text-${tip.color} mt-0.5`}>•</span>
                          <span className={`text-sm ${
                            theme === "light" ? "text-gray-600" : "text-gray-400"
                          }`}>
                            {tip.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}>
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Enter referral code"
                      className={`w-full px-4 py-2 rounded-lg border transition-all ${
                        theme === "light"
                          ? "bg-gray-50 border-bright-aqua/30 text-gray-800 placeholder:text-gray-400 focus:border-bright-aqua focus:outline-none focus:ring-2 focus:ring-bright-aqua/20"
                          : "bg-black/50 border-bright-aqua/30 text-white focus:border-bright-aqua focus:outline-none focus:ring-2 focus:ring-bright-aqua/20"
                      }`}
                    />
                    <p className={`text-xs mt-1 ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      If someone referred you to IOPn, enter their code here so they can earn REP rewards!
                    </p>
                  </div>

                  <Button
                    onClick={generateImages}
                    disabled={!nftDescription.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-bright-aqua to-blue-500 hover:from-bright-aqua/90 hover:to-blue-500/90 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Options...
                      </>
                    ) : (
                      "Generate NFT Options"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Choose Image */}
            {currentStep === 2 && (
              <div className="max-w-6xl mx-auto space-y-6">
                <Card className={`${
                  theme === "light"
                    ? "bg-white border-bright-aqua/50 shadow-xl shadow-bright-aqua/20"
                    : "bg-black/80 border-bright-aqua/30 backdrop-blur-sm"
                }`}>
                  <CardHeader className="text-center">
                    <CardTitle className={`text-2xl ${
                      theme === "light" ? "text-gray-800" : "text-white"
                    }`}>
                      Choose Your Image
                    </CardTitle>
                    <CardDescription className={
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }>
                      Select the image you like best, or regenerate for new options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {generatedImages.map((image, index) => (
        <div
          key={index}
          onClick={() => setSelectedImage(image)}
          className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
            selectedImage === image
              ? "ring-4 ring-bright-aqua scale-105 shadow-lg shadow-bright-aqua/30"
              : "hover:scale-102 hover:shadow-lg hover:shadow-violet-indigo/20"
          }`}
                        >
                          <img
            src={image}
            alt={`NFT Option ${index + 1}`}
            className="w-full h-64 object-contain bg-black"  // Changed from object-cover to object-contain
          />
                         
                          {selectedImage === image && (
                            <div className="absolute inset-0 flex items-center justify-center bg-bright-aqua/20">
                              <CheckCircle className="w-12 h-12 text-bright-aqua" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button
  onClick={() => {
    console.log('Regenerate button clicked');
    console.log('Current images:', generatedImages);
    console.log('Current description:', nftDescription);
    
    // Clear and regenerate
    setGeneratedImages([]);
    setSelectedImage(null);
    
    // Small delay to ensure state clears before regenerating
    setTimeout(() => {
      generateImages();
    }, 100);
  }}
  variant="outline"
  className="flex-1 border-amber-rust text-amber-rust hover:bg-amber-rust/10"
>
  <RefreshCw className="w-4 h-4 mr-2" />
  Regenerate Images
</Button>
                      <Button
                        onClick={handleMint}
                        disabled={!selectedImage}
                        className="flex-1 bg-gradient-to-r from-bright-aqua to-violet-indigo hover:from-bright-aqua/90 hover:to-violet-indigo/90 text-white"
                      >
                        Mint Selected Image
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Minting Progress */}
            {currentStep === 3 && (
              <Card className={`max-w-lg mx-auto ${
                theme === "light"
                  ? "bg-white border-bright-aqua/50 shadow-xl shadow-bright-aqua/20"
                  : "bg-black/80 border-bright-aqua/30 backdrop-blur-sm"
              }`}>
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl ${
                    theme === "light" ? "text-gray-800" : "text-white"
                  }`}>
                    Minting Your NFT
                  </CardTitle>
                  <CardDescription className={
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }>
                    Please wait while we create your unique Origin NFT...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative h-48 flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Minting NFT"
                      className="h-full object-contain rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }>
                        {mintProgress < 30 && "Uploading to IPFS..."}
                        {mintProgress >= 30 && mintProgress < 60 && "Creating metadata..."}
                        {mintProgress >= 60 && mintProgress < 90 && "Finalizing your NFT..."}
                        {mintProgress >= 90 && "Almost done..."}
                      </span>
                      <span className={
                        theme === "light" ? "text-gray-800" : "text-white"
                      }>
                        {mintProgress}%
                      </span>
                    </div>
                    <Progress 
                      value={mintProgress} 
                      className="h-2"
                    />
                  </div>

                  <div className={`text-center text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}>
                    {mintProgress === 100 ? (
                      <div className="flex items-center justify-center space-x-2 text-bright-aqua">
                        <CheckCircle className="w-5 h-5" />
                        <span>Complete! Redirecting to your showcase...</span>
                      </div>
                    ) : (
                      "This may take a few moments"
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <TutorialButton />
        <TutorialPopup />
      </SidebarInset>
    </SidebarProvider>
  )
}