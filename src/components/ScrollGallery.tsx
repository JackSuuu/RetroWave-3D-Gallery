'use client'

import React, { useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollGalleryProps {
  imageUrls: string[]
}

// 3D Image Frame Component
const ImageFrame: React.FC<{ 
  url: string; 
  isActive: boolean;
}> = ({ url, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const texture = useLoader(THREE.TextureLoader, url)
  
  // Ensure texture is bright and properly displayed
  useEffect(() => {
    if (texture) {
      // Use updateMatrix instead of encoding for modern versions
      texture.needsUpdate = true
    }
  }, [texture])
  
  // Apply animation effects
  useFrame((state) => {
    if (!meshRef.current) return
    
    // Add floating movement for 3D effect
    const time = state.clock.getElapsedTime()
    
    // 3D movement when active
    if (isActive) {
      meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.1
      meshRef.current.position.y = Math.sin(time * 0.5) * 0.1
    } else {
      // Reset when not active
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1)
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.1)
    }
  })
  
  // Animate when becoming active
  useEffect(() => {
    if (isActive && meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        z: 0,
        duration: 1,
        ease: "power3.out"
      })
      
      gsap.to(meshRef.current.position, {
        z: 0.5,
        duration: 1.2,
        ease: "power2.out"
      })
    }
  }, [isActive])
  
  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    >
      {/* Frame - Make image smaller by reducing dimensions */}
      <boxGeometry args={[3.5, 2.7, 0.1]} />
      <meshStandardMaterial color="#ffffff" />
      
      {/* Image */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3.3, 2.5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </mesh>
  )
}

const ScrollGallery: React.FC<ScrollGalleryProps> = ({ imageUrls }) => {
  const galleryRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Navigate to a specific image
  const navigateToImage = (index: number) => {
    if (isTransitioning || index === activeIndex) return
    
    // Lock navigation during transition
    setIsTransitioning(true)
    
    // Set active index
    setActiveIndex(index)
    
    // Allow transitions again after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }
  
  // Handle sequential navigation (next/prev)
  const goToNext = () => {
    if (activeIndex < imageUrls.length - 1) {
      navigateToImage(activeIndex + 1)
    }
  }
  
  const goToPrev = () => {
    if (activeIndex > 0) {
      navigateToImage(activeIndex - 1)
    }
  }
  
  // Scroll event handler
  useEffect(() => {
    if (!galleryRef.current) return
    
    let lastScrollTime = 0
    const scrollCooldown = 800 // ms between allowed scroll actions
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      // Don't handle scroll during transitions
      if (isTransitioning) return
      
      const now = Date.now()
      if (now - lastScrollTime < scrollCooldown) return
      lastScrollTime = now
      
      if (e.deltaY > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }
    
    // Attach scroll listener
    const gallery = galleryRef.current
    gallery.addEventListener('wheel', handleWheel, { passive: false })
    
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return
      
      const now = Date.now()
      if (now - lastScrollTime < scrollCooldown) return
      lastScrollTime = now
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrev()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      gallery.removeEventListener('wheel', handleWheel)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, imageUrls.length, isTransitioning])
  
  return (
    <div 
      ref={galleryRef} 
      className="w-full h-screen overflow-hidden"
    >
      {/* Progress indicator - move to center-right */}
      <div className="fixed top-1/2 right-10 transform -translate-y-1/2 flex flex-col gap-3 z-10">
        {imageUrls.map((_, index) => (
          <button 
            key={`indicator-${index}`}
            className={`w-2 h-8 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'bg-white scale-y-125' : 'bg-white/30'
            }`}
            onClick={() => navigateToImage(index)}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* 3D Images */}
      <div className="absolute top-0 left-0 w-full h-full">
        {imageUrls.map((url, index) => (
          <div 
            key={`image-${index}`}
            className={`absolute top-0 left-0 w-full h-full transition-all duration-800 ${
              activeIndex === index 
                ? 'opacity-100 z-10 transform scale-100' 
                : activeIndex > index 
                  ? 'opacity-0 z-0 transform scale-90 translate-y-full' 
                  : 'opacity-0 z-0 transform scale-90 -translate-y-full'
            }`}
            style={{ 
              transitionProperty: 'transform, opacity',
              transitionDuration: '800ms'
            }}
          >
            {/* Right-aligned image container */}
            <div className="absolute top-1/2 left-1.5 transform -translate-y-1/2 w-full h-[80%] cursor-grab active:cursor-grabbing">
              <Canvas className="w-full h-full">
                <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
                <ambientLight intensity={1.2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <directionalLight position={[0, 0, 5]} intensity={0.8} />
                
                <ImageFrame 
                  url={url} 
                  isActive={true}
                />
                
                <OrbitControls 
                  enableZoom={false}
                  enablePan={false}
                  maxPolarAngle={Math.PI / 1.5}
                  minPolarAngle={Math.PI / 3}
                  enableRotate={activeIndex === index}
                />
              </Canvas>
            </div>
            
            <p className="absolute bottom-6 right-12 text-white text-xl font-serif">
              {index + 1} / {imageUrls.length}
            </p>
          </div>
        ))}
      </div>
      
      {/* Navigation controls - move to right side */}
      <div className="fixed bottom-8 right-24 flex justify-center gap-8 z-20">
        <button 
          className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/40 ${activeIndex <= 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          onClick={goToPrev}
          disabled={activeIndex <= 0 || isTransitioning}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/40 ${activeIndex >= imageUrls.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          onClick={goToNext}
          disabled={activeIndex >= imageUrls.length - 1 || isTransitioning}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Navigation hints - move to right corner */}
      <div className="fixed bottom-4 right-12 text-white/70 text-sm">
        <span>Use arrow keys or scroll to navigate</span>
      </div>
    </div>
  )
}

export default ScrollGallery 