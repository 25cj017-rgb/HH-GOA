import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ParallaxImage = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/beach_bg.png');
  const { viewport } = useThree();

  // Calculate the scale to cover the viewport while maintaining aspect ratio
  const imageAspect = texture.image.width / texture.image.height;
  const viewportAspect = viewport.width / viewport.height;
  
  let scaleX = viewport.width;
  let scaleY = viewport.height;
  
  // We scale it up a bit (1.1x) to hide edges during parallax movement
  const overscan = 1.15; 

  if (imageAspect > viewportAspect) {
    scaleX = viewport.height * imageAspect * overscan;
    scaleY = viewport.height * overscan;
  } else {
    scaleX = viewport.width * overscan;
    scaleY = (viewport.width / imageAspect) * overscan;
  }

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smoothly interpolate the mesh position towards the mouse target
    const targetX = (state.pointer.x * viewport.width) / 30;
    const targetY = (state.pointer.y * viewport.height) / 30;
    
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;

    // Slight rotation for added 3D depth
    meshRef.current.rotation.y += (state.pointer.x * 0.03 - meshRef.current.rotation.y) * 0.05;
    meshRef.current.rotation.x += (-state.pointer.y * 0.03 - meshRef.current.rotation.x) * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[scaleX, scaleY, 32, 32]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

export const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#0F2E1E]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <React.Suspense fallback={null}>
          <ParallaxImage />
        </React.Suspense>
      </Canvas>
    </div>
  );
};
