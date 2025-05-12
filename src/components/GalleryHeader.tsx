'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface GalleryHeaderProps {
  title: string
  subtitle?: string
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ title, subtitle }) => {
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  
  useEffect(() => {
    // Animate title and subtitle using GSAP
    const tl = gsap.timeline()
    
    tl.fromTo(
      titleRef.current,
      { 
        opacity: 0,
        x: -50 
      },
      { 
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power3.out"
      }
    )
    
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { 
          opacity: 0,
          x: -30 
        },
        { 
          opacity: 0.8,
          x: 0,
          duration: 0.8,
          ease: "power2.out" 
        },
        "-=0.5" // Start slightly before the title animation finishes
      )
    }
    
    // Add subtle animation effects to the letters
    const letters = titleRef.current?.querySelectorAll('.letter')
    if (letters) {
      letters.forEach((letter, index) => {
        gsap.to(letter, {
          filter: 'drop-shadow(0 0 1px #CF33D9)',
          repeat: -1,
          yoyo: true,
          duration: 1.5 + (index * 0.1),
          ease: "sine.inOut"
        })
      })
    }
    
  }, [])
  
  // Split the title into individual words to apply different retro wave effects
  const titleWords = title.split(' ')
  const firstTwoWords = titleWords.slice(0, 2)
  const restWords = titleWords.length > 2 ? titleWords.slice(2).join(' ') : ''
  
  return (
    <div className="absolute top-1/7 left-[25%] z-50 text-left max-w-xl retro-wave-wrapper">
      <div className="inner-wrapper absolute w-full h-full">
        <div className="landscape absolute w-[300%] left-[-100%] h-[200%] bottom-[-50%]"
          style={{
            backgroundColor: '#0c141f',
            backgroundImage: 'linear-gradient(to top, #CF33D9 2px, transparent 2px), linear-gradient(to left, #CF33D9 2px, transparent 2px)',
            backgroundSize: '30px 30px, 30px 30px',
            backgroundPosition: '-1px -1px, -1px -1px',
            transform: 'rotateX(85deg)',
            animation: 'moveUp 1s infinite linear'
          }}>
        </div>
      </div>
      
      <div ref={titleRef} className="relative z-20 ml-16">
        {firstTwoWords.map((word, wordIndex) => (
          <span key={`retro-word-${wordIndex}`} className="retro-text">
            {word.split('').map((char, i) => (
              <span key={`retro-${wordIndex}-${i}`} className="letter">{char}</span>
            ))}
          </span>
        ))}
        
        {restWords && (
          <span className="wave-text">
            {restWords.split('').map((char, i) => (
              <span key={`wave-${i}`} className="letter">{char}</span>
            ))}
          </span>
        )}
        
        <div className="triangle absolute w-0 h-0 z-10" 
          style={{
            borderLeft: '200px solid transparent',
            borderRight: '250px solid transparent',
            borderBottom: '200px solid rgba(5, 5, 5, 0.33)',
            transform: 'rotate(15deg)',
            top: '50%',
            left: '50%',
            marginLeft: '-200px',
            marginTop: '-50px'
          }}>
        </div>
      </div>
      
      {subtitle && (
        <p 
          ref={subtitleRef}
          className="mt-12 text-xl text-white/80 relative z-20"
          style={{ 
            fontFamily: 'Georgia, serif',
            textShadow: '0 2px 6px rgba(0,0,0,0.7)',
            maxWidth: '35ch'
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default GalleryHeader 