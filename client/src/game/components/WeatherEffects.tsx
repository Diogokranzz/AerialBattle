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
  
  // Cloud instances
  const cloudCount = 100;
  const cloudRef = useRef<InstancedMesh>(null);
  const cloudPositions = useRef<Array<{
    position: Vector3, 
    speed: number,
    scale: number,
    offset: number
  }>>([]);
  
  // Rain instances
  const rainCount = 300;
  const rainRef = useRef<InstancedMesh>(null);
  const rainPositions = useRef<Array<{
    position: Vector3, 
    speed: number
  }>>([]);
  
  // Initialize cloud positions if not already done
  if (cloudPositions.current.length === 0) {
    for (let i = 0; i < cloudCount; i++) {
      cloudPositions.current.push({
        position: new Vector3(
          (Math.random() - 0.5) * 300,
          30 + Math.random() * 30,
          (Math.random() - 0.5) * 300
        ),
        speed: 0.05 + Math.random() * 0.05,
        scale: 1 + Math.random() * 2,
        offset: Math.random() * Math.PI * 2
      });
    }
  }
  
  // Initialize rain positions if not already done
  if (rainPositions.current.length === 0) {
    for (let i = 0; i < rainCount; i++) {
      rainPositions.current.push({
        position: new Vector3(
          (Math.random() - 0.5) * 60,
          50 + Math.random() * 20,
          (Math.random() - 0.5) * 60
        ),
        speed: 0.5 + Math.random() * 0.5
      });
    }
  }

  // Update weather effects each frame
  useFrame((_, delta) => {
    if (!player) return;
    
    // Update clouds
    if (cloudRef.current) {
      for (let i = 0; i < cloudCount; i++) {
        const cloud = cloudPositions.current[i];
        
        // Move clouds based on their speed
        cloud.position.x += cloud.speed * delta * 5;
        
        // Add a gentle sine wave motion
        cloud.position.y = 30 + Math.random() * 30 + Math.sin(performance.now() * 0.0005 + cloud.offset) * 2;
        
        // Clouds follow the camera to create an endless effect
        const camPos = camera.position;
        const maxDist = 150;
        
        if (cloud.position.x - camPos.x > maxDist) cloud.position.x = camPos.x - maxDist;
        if (cloud.position.x - camPos.x < -maxDist) cloud.position.x = camPos.x + maxDist;
        if (cloud.position.z - camPos.z > maxDist) cloud.position.z = camPos.z - maxDist;
        if (cloud.position.z - camPos.z < -maxDist) cloud.position.z = camPos.z + maxDist;
        
        // Make cloud density match the weather type
        let cloudAlpha = 0;
        switch (weather) {
          case WeatherType.Cloudy:
            cloudAlpha = 0.8;
            break;
          case WeatherType.Rainy:
            cloudAlpha = 0.9;
            break;
          case WeatherType.Foggy:
            cloudAlpha = 0.7;
            break;
          case WeatherType.Clear:
          default:
            cloudAlpha = 0.3;
            break;
        }
        
        // Update instance matrix
        tempObject.position.copy(cloud.position);
        tempObject.scale.set(cloud.scale, cloud.scale, cloud.scale);
        tempObject.updateMatrix();
        cloudRef.current.setMatrixAt(i, tempObject.matrix);
        
        // Update instance color (for opacity)
        tempColor.set('#ffffff');
        cloudRef.current.setColorAt(i, tempColor.setRGB(1, 1, 1).convertSRGBToLinear());
        
        // Update instance material opacity
        const material = cloudRef.current.material;
        if (material && ('opacity' in material)) {
          (material as any).opacity = cloudAlpha;
        }
      }
      
      cloudRef.current.instanceMatrix.needsUpdate = true;
      if (cloudRef.current.instanceColor) cloudRef.current.instanceColor.needsUpdate = true;
    }
    
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
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial 
            color="#85c9e6" 
            transparent={true} 
            opacity={0.6}
          />
        </instancedMesh>
      )}
    </>
  );
}
