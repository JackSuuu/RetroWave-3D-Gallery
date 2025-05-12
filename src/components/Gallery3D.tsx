'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, useTexture, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import PhotoViewer from './PhotoViewer'

interface Gallery3DProps {
  imageUrls: string[]
}

const GalleryItem: React.FC<{ 
  position: [number, number, number]; 
  imageUrl: string;
  index: number;
  isActive: boolean;
  setActive: (index: number) => void;
  totalImages: number;
  onFullscreen: () => void;
}> = ({ position, imageUrl, index, isActive, setActive, totalImages, onFullscreen }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const texturePromise = useTexture(imageUrl)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const { camera } = useThree()
  
  // Load the texture
  useEffect(() => {
    // Handle texture loading
    if (texturePromise) {
      Promise.resolve(texturePromise).then((loadedTexture) => {
        setTexture(loadedTexture)
      }).catch(error => {
        console.error("Error loading texture:", error)
      })
    }
  }, [texturePromise])

  // Apply animation when component mounts
  useEffect(() => {
    // Initial animation using GSAP
    gsap.fromTo(
      groupRef.current.position,
      { y: position[1] - 2 },
      { 
        y: position[1],
        duration: 1,
        ease: "power3.out",
        delay: index * 0.15
      }
    )
    
    // Initial rotation animation
    gsap.fromTo(
      groupRef.current.rotation,
      { y: Math.PI },
      { 
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: index * 0.15
      }
    )
  }, [])

  // Handle hover and selection effects
  useFrame((state) => {
    if (!meshRef.current) return
    
    // Subtle floating animation
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.05
    
    // Rotation for inactive items
    if (!isActive) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        Math.sin(state.clock.elapsedTime * 0.2 + index) * 0.1,
        0.1
      )
    }
  })

  // Handle click event
  const handleClick = () => {
    setActive(index)
    
    // Use GSAP for click animation
    gsap.to(groupRef.current.position, {
      z: isActive ? 0 : 2,
      duration: 0.75,
      ease: "power3.out"
    })
    
    gsap.to(groupRef.current.rotation, {
      y: isActive ? 0 : 0,
      duration: 0.75,
      ease: "power2.inOut"
    })
    
    // Move camera to face the image directly when active
    if (!isActive) {
      gsap.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2] + 6,
        duration: 1,
        ease: "power2.inOut"
      })
    }
  }

  // Handle double click for fullscreen view
  const handleDoubleClick = (e: React.MouseEvent<THREE.Mesh>) => {
    e.stopPropagation()
    onFullscreen()
  }

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <mesh ref={meshRef}>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial 
          map={texture} 
          side={THREE.DoubleSide} 
          emissive={isActive ? new THREE.Color(0x333333) : new THREE.Color(0x000000)}
          emissiveIntensity={isActive ? 0.5 : 0}
          color={!texture ? new THREE.Color(0x444444) : undefined}
        />
      </mesh>
      {isActive && (
        <Text
          position={[0, -2.5, 0.1]}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontSize={0.2}
        >
          Image {index + 1} of {totalImages}
        </Text>
      )}
    </group>
  )
}

const Gallery3D: React.FC<Gallery3DProps> = ({ imageUrls }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  
  const handleFullscreen = () => {
    if (activeIndex !== null) {
      setFullscreenImage(imageUrls[activeIndex])
    }
  }
  
  const closeFullscreen = () => {
    setFullscreenImage(null)
  }
  
  return (
    <div className="h-screen w-full bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[0, 5, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
        
        {imageUrls.map((url, index) => {
          // Position in a circular pattern
          const angle = (index / imageUrls.length) * Math.PI * 2
          const radius = 8
          const x = Math.sin(angle) * radius
          const z = Math.cos(angle) * radius
          
          return (
            <GalleryItem
              key={index}
              imageUrl={url}
              index={index}
              position={[x, 0, z]}
              isActive={activeIndex === index}
              setActive={setActiveIndex}
              totalImages={imageUrls.length}
              onFullscreen={handleFullscreen}
            />
          )
        })}
        
        {/* Background */}
        <mesh position={[0, 0, -10]}>
          <sphereGeometry args={[20, 32, 32]} />
          <meshStandardMaterial color="#050505" side={THREE.BackSide} />
        </mesh>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          autoRotate={activeIndex === null}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Gallery controls */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
        {imageUrls.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${activeIndex === index ? 'bg-white' : 'bg-gray-500'}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
      
      {/* Fullscreen photo viewer */}
      {fullscreenImage && (
        <PhotoViewer 
          imageUrl={fullscreenImage} 
          isOpen={!!fullscreenImage} 
          onClose={closeFullscreen}
          title={activeIndex !== null ? `Photo ${activeIndex + 1} of ${imageUrls.length}` : undefined}
        />
      )}
    </div>
  )
}

export default Gallery3D 