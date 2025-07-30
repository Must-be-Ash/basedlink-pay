"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title?: string
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    // Handle different YouTube URL formats
    let videoId = ''
    
    if (url.includes('/embed/')) {
      // Already an embed URL - extract video ID from /embed/videoId
      videoId = url.split('/embed/')[1]?.split('?')[0]
    } else if (url.includes('watch?v=')) {
      // Watch URL - extract video ID from v= parameter
      videoId = url.split('v=')[1]?.split('&')[0]
    } else if (url.includes('youtu.be/')) {
      // Short URL - extract video ID from youtu.be/videoId
      videoId = url.split('youtu.be/')[1]?.split('?')[0]
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden"
              style={{ backgroundColor: '#000000' }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              >
                <X className="w-5 h-5" style={{ color: '#333333' }} />
              </button>

              {/* Video Title */}
              {title && (
                <div className="absolute top-4 left-4 z-10">
                  <h3 className="text-white text-lg font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    {title}
                  </h3>
                </div>
              )}

              {/* Video Iframe */}
              <iframe
                src={getEmbedUrl(videoUrl)}
                title={title || "Demo Video"}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 