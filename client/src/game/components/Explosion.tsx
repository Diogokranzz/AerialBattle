import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color, AdditiveBlending } from 'three';
import { useAirplaneStore } from '../stores/useAirplaneStore';

// Helper for instance matrices
const tempObject = new Object3D();
const tempColor = new Color();

export function Explosion() {
  const explosionRef = useRef<InstancedMesh>(null);
  const { explosions, updateExplosions } = useAirplaneStore();
  
  // Update explosions each frame
  useFrame((_, delta) => {
    // Update explosion lifetimes
    updateExplosions(delta);
    
    // Update explosion instances
    if (explosionRef.current) {
      for (let i = 0; i < explosions.length; i++) {
        const explosion = explosions[i];
        
        // Calculate explosion lifecycle (1.0 to 0.0)
        const lifecycle = explosion.ttl / 1.0;
        
        // Update position
        tempObject.position.set(
          explosion.position.x,
          explosion.position.y,
          explosion.position.z
        );
        
        // Scale based on lifecycle and initial scale
        const scale = explosion.scale * (1.0 - lifecycle) * 3.0;
        tempObject.scale.set(scale, scale, scale);
        
        // Update matrix
        tempObject.updateMatrix();
        explosionRef.current.setMatrixAt(i, tempObject.matrix);
        
        // Color based on lifecycle (yellow to red to black)
        let r = 1.0;
        let g = Math.max(0, lifecycle * 0.8);
        let b = Math.max(0, lifecycle * 0.2);
        tempColor.setRGB(r, g, b);
        explosionRef.current.setColorAt(i, tempColor);
      }
      
      // Update instance count and matrix
      explosionRef.current.count = explosions.length;
      explosionRef.current.instanceMatrix.needsUpdate = true;
      if (explosionRef.current.instanceColor) explosionRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh
      ref={explosionRef}
      args={[undefined, undefined, 50]} // Pre-allocate for 50 explosions max
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial 
        blending={AdditiveBlending}
        transparent={true}
        opacity={0.8}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
