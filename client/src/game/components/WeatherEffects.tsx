import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Color, InstancedMesh, Object3D, Vector3, FogExp2 } from 'three';
import { useAirplaneStore } from '../stores/useAirplaneStore';
import { WeatherType } from '../types';

// Helper for instance matrices
const tempObject = new Object3D();
const tempVector = new Vector3();
const tempColor = new Color();

export function WeatherEffects() {
  const { camera, scene } = useThree();
  const { weather, player } = useAirplaneStore();
  
  // Rain instances
  const rainCount = 500;  // Aumentado para mais realismo
  const rainRef = useRef<InstancedMesh>(null);
  const rainPositions = useRef<Array<{
    position: Vector3, 
    speed: number
  }>>([]);
  
  // Initialize rain positions if not already done
  if (rainPositions.current.length === 0) {
    for (let i = 0; i < rainCount; i++) {
      rainPositions.current.push({
        position: new Vector3(
          (Math.random() - 0.5) * 80,  // Área maior para chuva
          50 + Math.random() * 20,
          (Math.random() - 0.5) * 80   // Área maior para chuva
        ),
        speed: 0.8 + Math.random() * 0.7  // Gotas de chuva mais rápidas
      });
    }
  }

  // Update weather effects each frame
  useFrame((_, delta) => {
    if (!player) return;
    
    // Update raindrops - only visible during rainy weather
    if (rainRef.current) {
      for (let i = 0; i < rainCount; i++) {
        const raindrop = rainPositions.current[i];
        
        // Move raindrops downward
        raindrop.position.y -= raindrop.speed * delta * 20;
        
        // Raindrops follow the camera to create an endless effect
        const camPos = camera.position;
        const maxDistXZ = 30;
        const maxDistY = 30;
        
        if (raindrop.position.y < camPos.y - 10) {
          raindrop.position.y = camPos.y + maxDistY;
          raindrop.position.x = camPos.x + (Math.random() - 0.5) * maxDistXZ * 2;
          raindrop.position.z = camPos.z + (Math.random() - 0.5) * maxDistXZ * 2;
        }
        
        // Update instance matrix
        tempObject.position.copy(raindrop.position);
        tempObject.scale.set(0.05, 0.3, 0.05);
        tempObject.rotation.set(0, 0, 0); // No rotation for rain
        tempObject.updateMatrix();
        rainRef.current.setMatrixAt(i, tempObject.matrix);
      }
      
      rainRef.current.instanceMatrix.needsUpdate = true;
      rainRef.current.visible = weather === WeatherType.Rainy;
    }
  });
  
  // Set fog based on weather
  useEffect(() => {
    if (weather === WeatherType.Foggy) {
      scene.fog = new FogExp2('#cfcfcf', 0.02);
    } else if (weather === WeatherType.Rainy) {
      scene.fog = new FogExp2('#8c9cb0', 0.01);
    } else {
      scene.fog = null;
    }
    
    return () => {
      scene.fog = null;
    };
  }, [weather, scene]);
  
  return (
    <>
      {/* Rain instances - only visible during rainy weather */}
      {weather === WeatherType.Rainy && (
        <instancedMesh
          ref={rainRef}
          args={[undefined, undefined, rainCount]}
          frustumCulled={false}
        >
          <boxGeometry args={[0.03, 0.5, 0.03]} />
          <meshStandardMaterial 
            color="#a5d9f6" 
            transparent={true} 
            opacity={0.7}
            emissive="#85c9e6"
            emissiveIntensity={0.2}
          />
        </instancedMesh>
      )}
    </>
  );
}
