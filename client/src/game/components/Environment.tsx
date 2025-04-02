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
      
      {/* Sun - iluminação mais forte e realista */}
      <directionalLight 
        position={[150, 150, 100]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-bias={-0.0001}
      />
      
      {/* Ambient light for global illumination */}
      <ambientLight intensity={0.6} />
      
      {/* Hemispherical light for more realistic outdoor lighting */}
      <hemisphereLight args={['#ddeeff', '#3a6f51', 0.8]} />
      
      {/* Visualization of the sun - mais distante para parecer mais realista */}
      <mesh position={[500, 400, 250]}>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#fff5cc" />
      </mesh>
      
      {/* Distant mountains and landmarks for orientation */}
      <group position={[0, -5, 0]}>
        {/* Mountain ranges - reduzido para melhor performance mas mantendo visual */}
        <mesh position={[100, 10, -300]} rotation={[0, 0.5, 0]}>
          <coneGeometry args={[80, 120, 4]} />
          <meshStandardMaterial color="#596673" roughness={0.9} />
        </mesh>
        
        <mesh position={[-250, 10, -300]} rotation={[0, 0.3, 0]}>
          <coneGeometry args={[70, 100, 4]} />
          <meshStandardMaterial color="#667788" roughness={0.9} />
        </mesh>
        
        <mesh position={[300, 10, -280]} rotation={[0, 0.5, 0]}>
          <coneGeometry args={[90, 130, 4]} />
          <meshStandardMaterial color="#506070" roughness={0.9} />
        </mesh>
        
        {/* Cidade distante mais baixa e menos obstrutiva */}
        <group position={[-600, 0, -400]}>
          {Array.from({ length: 15 }).map((_, i) => { // Menos prédios
            const height = 8 + Math.random() * 15; // Altura menor
            const width = 5 + Math.random() * 3;
            const depth = 5 + Math.random() * 3;
            const x = Math.random() * 150 - 75;
            const z = Math.random() * 150 - 75;
            
            // Cores de edifícios mais variadas
            const buildingColors = ['#445566', '#3a4a5a', '#506475', '#657585', '#4d5d6d'];
            const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
            
            return (
              <group key={i} position={[x, height / 2, z]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[width, height, depth]} />
                  <meshStandardMaterial color={color} roughness={0.8} />
                </mesh>
                
                {/* Janelas simplificadas para melhor performance */}
                {Math.random() > 0.5 && (
                  <mesh position={[0, 0, depth/2 + 0.01]}>
                    <planeGeometry args={[width * 0.8, height * 0.8]} />
                    <meshBasicMaterial color="#bbcce0" />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>
      </group>
    </>
  );
}
