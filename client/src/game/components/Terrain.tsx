import { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, Mesh } from 'three';

export function Terrain() {
  const terrainRef = useRef<Mesh>(null);
  
  // Load texture
  const grassTexture = useLoader(TextureLoader, '/textures/grass.png');
  grassTexture.wrapS = RepeatWrapping;
  grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(100, 100); // Aumentado para mais detalhes
  
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
      {Array.from({ length: 50 }).map((_, i) => { // Aumentei o número de características do terreno
        const posX = (Math.random() - 0.5) * 800; // Área maior
        const posZ = (Math.random() - 0.5) * 800; // Área maior
        const scale = 5 + Math.random() * 15;
        
        return (
          <group key={i} position={[posX, 0, posZ]}>
            {/* Hill */}
            <mesh position={[0, scale / 2, 0]} castShadow receiveShadow>
              <meshStandardMaterial color="#3d6b4d" roughness={0.9} />
              <sphereGeometry args={[scale, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            
            {/* Trees on hills */}
            {Array.from({ length: Math.floor(4 + Math.random() * 6) }).map((_, j) => { // Mais árvores
              const treeX = (Math.random() - 0.5) * scale * 1.5;
              const treeZ = (Math.random() - 0.5) * scale * 1.5;
              const treeHeight = 3 + Math.random() * 4; // Árvores mais altas
              const treeType = Math.random() > 0.7 ? 'pine' : 'regular'; // Dois tipos de árvore
              
              // Calculate height at this position
              const distFromCenter = Math.sqrt(treeX * treeX + treeZ * treeZ);
              const heightAtPos = Math.max(0, scale * Math.cos(distFromCenter / scale * (Math.PI / 2)));
              
              // Variação aleatória de cor
              const treeColors = ['#2E8B57', '#228B22', '#006400', '#004d00', '#003300'];
              const treeColor = treeColors[Math.floor(Math.random() * treeColors.length)];
              
              return (
                <group key={j} position={[treeX, heightAtPos, treeZ]}>
                  {/* Tree trunk */}
                  <mesh castShadow position={[0, treeHeight / 2, 0]}>
                    <meshStandardMaterial color="#6b4226" roughness={0.9} />
                    <cylinderGeometry args={[0.2, 0.3, treeHeight, 6]} />
                  </mesh>
                  
                  {/* Tree foliage */}
                  {treeType === 'pine' ? (
                    // Pinheiro (múltiplas camadas)
                    <>
                      <mesh castShadow position={[0, treeHeight * 0.6, 0]}>
                        <meshStandardMaterial color={treeColor} roughness={0.8} />
                        <coneGeometry args={[2.2, treeHeight * 0.6, 8]} />
                      </mesh>
                      <mesh castShadow position={[0, treeHeight * 0.8, 0]}>
                        <meshStandardMaterial color={treeColor} roughness={0.8} />
                        <coneGeometry args={[1.7, treeHeight * 0.5, 8]} />
                      </mesh>
                      <mesh castShadow position={[0, treeHeight, 0]}>
                        <meshStandardMaterial color={treeColor} roughness={0.8} />
                        <coneGeometry args={[1.2, treeHeight * 0.4, 8]} />
                      </mesh>
                    </>
                  ) : (
                    // Árvore regular
                    <mesh castShadow position={[0, treeHeight, 0]}>
                      <meshStandardMaterial color={treeColor} roughness={0.8} />
                      <sphereGeometry args={[1.8, 8, 8]} />
                    </mesh>
                  )}
                </group>
              );
            })}
          </group>
        );
      })}
    </>
  );
}
