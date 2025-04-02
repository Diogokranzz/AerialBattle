import { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, Mesh } from 'three';

export function Terrain() {
  const terrainRef = useRef<Mesh>(null);
  
  // Load texture
  const grassTexture = useLoader(TextureLoader, '/textures/grass.png');
  grassTexture.wrapS = RepeatWrapping;
  grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(50, 50);
  
  // Update terrain
  useFrame(({ camera }) => {
    if (terrainRef.current) {
      // Make the terrain follow the camera's xz position
      terrainRef.current.position.x = Math.floor(camera.position.x / 200) * 200;
      terrainRef.current.position.z = Math.floor(camera.position.z / 200) * 200;
    }
  });
  
  return (
    <>
      {/* Main ground plane */}
      <mesh 
        ref={terrainRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[2000, 2000, 32, 32]} />
        <meshStandardMaterial 
          map={grassTexture} 
          roughness={1} 
          metalness={0}
        />
      </mesh>
      
      {/* Create some random terrain features */}
      {Array.from({ length: 30 }).map((_, i) => {
        const posX = (Math.random() - 0.5) * 600;
        const posZ = (Math.random() - 0.5) * 600;
        const scale = 5 + Math.random() * 15;
        
        return (
          <group key={i} position={[posX, 0, posZ]}>
            {/* Hill */}
            <mesh position={[0, scale / 2, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#4a7c59" roughness={1} />
              <sphereGeometry args={[scale, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            
            {/* Trees on hills */}
            {Array.from({ length: Math.floor(3 + Math.random() * 5) }).map((_, j) => {
              const treeX = (Math.random() - 0.5) * scale * 1.5;
              const treeZ = (Math.random() - 0.5) * scale * 1.5;
              const treeHeight = 2 + Math.random() * 3;
              
              // Calculate height at this position
              const distFromCenter = Math.sqrt(treeX * treeX + treeZ * treeZ);
              const heightAtPos = Math.max(0, scale * Math.cos(distFromCenter / scale * (Math.PI / 2)));
              
              return (
                <group key={j} position={[treeX, heightAtPos, treeZ]}>
                  {/* Tree trunk */}
                  <mesh castShadow position={[0, treeHeight / 2, 0]}>
                    <meshStandardMaterial color="#8B4513" roughness={1} />
                    <cylinderGeometry args={[0.2, 0.3, treeHeight, 6]} />
                  </mesh>
                  
                  {/* Tree foliage */}
                  <mesh castShadow position={[0, treeHeight, 0]}>
                    <meshStandardMaterial color="#2E8B57" roughness={1} />
                    <coneGeometry args={[1.5, treeHeight, 8]} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
    </>
  );
}
