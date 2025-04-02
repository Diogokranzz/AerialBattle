import { useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, BackSide } from 'three';
import { useAirplaneStore } from '../stores/useAirplaneStore';
import { WeatherType } from '../types';

export function Environment() {
  const { scene } = useThree();
  const { setWeather } = useAirplaneStore();
  
  // Load the sky texture
  const skyTexture = useLoader(TextureLoader, '/textures/sky.png');
  skyTexture.wrapS = RepeatWrapping;
  skyTexture.wrapT = RepeatWrapping;
  skyTexture.repeat.set(5, 5);
  
  // Set up the environment
  useEffect(() => {
    // Set initial weather
    setWeather(WeatherType.Clear);

    // Change weather periodically
    const weatherInterval = setInterval(() => {
      const weatherTypes = [
        WeatherType.Clear,
        WeatherType.Cloudy,
        WeatherType.Rainy,
        WeatherType.Foggy
      ];
      
      // Select a random weather type
      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      setWeather(randomWeather);
    }, 60000); // Change every minute
    
    return () => clearInterval(weatherInterval);
  }, [setWeather]);
  
  // Create a skybox
  return (
    <>
      {/* Skybox */}
      <mesh>
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial map={skyTexture} side={BackSide} />
      </mesh>
      
      {/* Sun */}
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Ambient light for global illumination */}
      <ambientLight intensity={0.5} />
      
      {/* Visualization of the sun */}
      <mesh position={[300, 300, 150]}>
        <sphereGeometry args={[30, 32, 32]} />
        <meshBasicMaterial color="#FFFF99" />
      </mesh>
      
      {/* Distant mountains and landmarks for orientation */}
      <group position={[0, -10, 0]}>
        {/* Mountain ranges */}
        <mesh position={[100, 10, -200]} rotation={[0, 0.5, 0]}>
          <coneGeometry args={[80, 100, 4]} />
          <meshStandardMaterial color="#667788" roughness={1} />
        </mesh>
        
        <mesh position={[-150, 10, -200]} rotation={[0, 0.3, 0]}>
          <coneGeometry args={[60, 80, 4]} />
          <meshStandardMaterial color="#778899" roughness={1} />
        </mesh>
        
        <mesh position={[200, 10, -100]} rotation={[0, 0.7, 0]}>
          <coneGeometry args={[50, 70, 4]} />
          <meshStandardMaterial color="#556677" roughness={1} />
        </mesh>
        
        {/* Distant city */}
        <group position={[-200, 0, -150]}>
          {Array.from({ length: 20 }).map((_, i) => {
            const height = 5 + Math.random() * 20;
            const x = Math.random() * 80 - 40;
            const z = Math.random() * 80 - 40;
            return (
              <mesh key={i} position={[x, height / 2, z]}>
                <boxGeometry args={[5, height, 5]} />
                <meshStandardMaterial color="#445566" roughness={0.8} />
              </mesh>
            );
          })}
        </group>
      </group>
    </>
  );
}
