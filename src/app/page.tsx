'use client'

import React from 'react'
import ScrollGallery from '@/components/ScrollGallery'
import GalleryHeader from '@/components/GalleryHeader'

export default function Home() {
  // Use local images from public folder
  const imageUrls = [
    '/images/sample1.png',
    '/images/sample2.png',
    '/images/sample3.png',
    '/images/sample4.png',
    '/images/sample5.png',
    '/images/sample6.png',
  ]

  return (
    <main className="h-screen w-full bg-black overflow-hidden relative">
      {/* Layout with left header and right gallery */}
      <div className="flex h-full">
        <div className="w-[35%] relative">
          {/* Header will be positioned absolutely */}
          <GalleryHeader 
            title="Jack Su Photo Gallery" 
            subtitle="Scroll to explore beautiful images in our collection"
          />
        </div>
        <div className="w-[65%] relative">
          {/* Gallery will fill the right side */}
          <ScrollGallery imageUrls={imageUrls} />
        </div>
      </div>
    </main>
  )
}
