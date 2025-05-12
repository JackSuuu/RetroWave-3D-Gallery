'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'

interface PhotoViewerProps {
  imageUrl: string
  isOpen: boolean
  onClose: () => void
  title?: string
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ 
  imageUrl, 
  isOpen, 
  onClose,
  title
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current || !imageRef.current) return
    
    if (isOpen) {
      // Animate the container in
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { 
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        }
      )
      
      // Animate the image in
      gsap.fromTo(
        imageRef.current,
        { 
          scale: 0.8,
          opacity: 0
        },
        { 
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out"
        }
      )
    } else {
      // Animate out if component is still mounted
      gsap.to([containerRef.current, imageRef.current], {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in"
      })
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div 
        ref={imageRef}
        className="relative max-w-4xl w-full h-auto max-h-[80vh] overflow-hidden rounded-lg"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
      >
        <div className="relative w-full h-0 pb-[75%]">
          <Image
            src={imageUrl}
            alt={title || "Photo"}
            fill
            style={{ objectFit: 'contain' }}
            className="w-full h-full"
            unoptimized={imageUrl.startsWith('http')}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          />
        </div>
        
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
        )}
        
        <button
          className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PhotoViewer 