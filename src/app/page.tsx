"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, LayoutGroup } from "motion/react"
import { Button3D } from "@/components/ui/button-3d"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { TextRotate } from "@/components/ui/text-rotate"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { VideoModal } from "@/components/ui/video-modal"
import { CDPProvider } from "@/components/CDPProvider"
import { useUserSession } from "@/hooks/useUserSession"
import { Zap, DollarSign, Globe, Github } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useUserSession()
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }

  const products = [
    "digital products",
    "online courses", 
    "memberships",
    "consultations",
    "services",
    "donations",
    "subscriptions",
    "events",
    "downloads",
    "physical goods"
  ]
  
  return (
    <CDPProvider>
      <style jsx>{`
        .text-rotate-orange {
          background-color: #ff5941;
        }
      `}</style>
      
      <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#ffffff' }}>
        
        {/* GitHub Header */}
        <div className="pt-12 pb-2 text-center">
          <RainbowButton
            onClick={() => window.open('https://fork.stablelink.xyz/', '_blank')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:scale-105"
          >
            <Github className="w-4 h-4" />
            Fork this project on GitHub
          </RainbowButton>
        </div>
        
        {/* Hero Section */}
        <div className="flex-1 pt-12 sm:pt-10 md:pt-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center w-full">
            
            {/* Hero Text */}
            <LayoutGroup>
              <motion.div 
                className="mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.h1 
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight tracking-tight"
                  style={{ color: '#1a1a1a' }}
                  layout
                >
                  <motion.span 
                    className="block -mb-4"
                    layout
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    Get paid for{" "}
                  </motion.span>
                  <TextRotate
                    texts={products}
                    mainClassName="text-white font-bold px-4 sm:px-6 md:px-8 py-2 md:py-1 overflow-hidden justify-center rounded-2xl text-rotate-orange"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.03}
                    splitLevelClassName="overflow-hidden"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2500}
                  />
                </motion.h1>
              </motion.div>
            </LayoutGroup>

  {/* Subtitle */}
  <motion.div 
              className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-4"
              style={{ color: '#666666' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <span className="block sm:inline">List Product.</span>
              <span className="block sm:inline"> Share Your Link.</span>
              <span className="block sm:inline"> Get Paid.</span>
            </motion.div>
      

 {/* Features Section */}
 <motion.div 
          className="pt-6 pb-2 sm:py-4 opacity-75"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-6 sm:pb-12">
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-0">
              
              <div className="text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#ff5941' }} />
                </div>
                <h3 className="text-xs sm:text-l font-light mb-1 sm:mb-2" style={{ color: '#3B3B3B' }}>Instant Payments</h3>

              </div>

              <div className="text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                  <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#ff5941' }} />
                </div>
                <h3 className="text-xs sm:text-l font-light mb-1 sm:mb-2" style={{ color: '#3B3B3B' }}>0% Platform Fees</h3>

              </div>

              <div className="text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f8f8f8' }}>
                  <Globe className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#ff5941' }} />
                </div>
                <h3 className="text-xs sm:text-l font-light mb-1 sm:mb-2" style={{ color: '#3B3B3B' }}>Global Reach</h3>

              </div>

            </div>
          </div>
        </motion.div>
        
          

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col items-center gap-4 mt-8 sm:mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <Button3D 
                onClick={handleGetStarted} 
                size="lg" 
                className="text-white text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 h-auto rounded-2xl font-medium"
                style={{ 
                  background: 'linear-gradient(to bottom, #ff6d41, #ff5420)'
                }}
              >
                Get Started

              </Button3D>
              
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-2 text-base sm:text-lg font-light px-6 sm:px-8 py-2 sm:py-3 mt-2 transition-all duration-200 hover:scale-105"
                style={{ color: '#666666', backgroundColor: 'transparent' }}
              >

                View Demo
              </button>
            </motion.div>

          </div>
        </div>

       


        {/* Minimal Footer */}
        <motion.div 
          className="py-6 sm:py-8 md:py-12 text-center text-sm font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <a 
            href="https://portal.cdp.coinbase.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span style={{ color: '#999999' }}>Powered by </span>
            <TextShimmer
              className="font-bold [--base-color:#999999] [--base-gradient-color:#0052FF]"
              duration={3}
              spread={2}
              as="span"
            >
              Coinbase Developer Platform
            </TextShimmer>
          </a>
        </motion.div>

      </div>
      
      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl="https://www.youtube.com/watch?v=nJffRKrZ_mE"
        title="Product Demo"
      />
    </CDPProvider>
  )
}