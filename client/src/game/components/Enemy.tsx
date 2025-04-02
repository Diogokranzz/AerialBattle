import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { useAirplaneStore } from '../stores/useAirplaneStore';
import { AirplaneType } from '../types';

interface EnemyProps {
  count?: number;
}

export function Enemy({ count = 3 }: EnemyProps) {
  const enemyRefs = useRef<Map<string, Group>>(new Map());
  const propellerRefs = useRef<Map<string, Mesh>>(new Map());
  
  const { player, enemies, createEnemy, updateEnemies } = useAirplaneStore();
  
  // Spawn initial enemies
  useEffect(() => {
    // Clear any existing enemies first
    enemyRefs.current.clear();
    propellerRefs.current.clear();
    
    // Spawn new enemies in a circle around the player area
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const radius = 50 + Math.random() * 30;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = 20 + Math.random() * 15; // Increased starting height to match player
      
      // Randomly choose an enemy type with weighted preference
      const rand = Math.random();
      let type: AirplaneType;
      
      if (rand < 0.6) {
        type = AirplaneType.Fighter;
      } else if (rand < 0.9) {
        type = AirplaneType.Scout;
      } else {
        type = AirplaneType.Bomber;
      }
      
      createEnemy(type, [x, y, z]);
    }
  }, [createEnemy, count]);
  
  // Update enemies on each frame
  useFrame((_, delta) => {
    if (!player) return;
    
    // Update enemy AI
    updateEnemies(delta, player.position);
    
    // Update enemy airplane models
    enemies.forEach(enemy => {
      const enemyRef = enemyRefs.current.get(enemy.id);
      if (enemyRef) {
        // Update position and rotation
        enemyRef.position.set(
          enemy.position.x,
          enemy.position.y,
          enemy.position.z
        );
        
        enemyRef.rotation.set(
          enemy.rotation.x,
          enemy.rotation.y,
          enemy.rotation.z
        );
        
        // Update propeller rotation
        const propeller = propellerRefs.current.get(enemy.id);
        if (propeller) {
          propeller.rotation.z += 0.5 + (enemy.speed * 2);
        }
      }
    });
  });
  
  return (
    <>
      {enemies.map(enemy => (
        <group 
          key={enemy.id} 
          ref={ref => {
            if (ref) enemyRefs.current.set(enemy.id, ref);
          }}
        >
          {/* Enemy body */}
          <mesh castShadow receiveShadow>
            <meshStandardMaterial 
              color={
                enemy.type === AirplaneType.Fighter ? '#d63031' : 
                enemy.type === AirplaneType.Bomber ? '#2d3436' : 
                '#e17055'
              } 
              roughness={0.5} 
              metalness={0.7}
            />
            <boxGeometry args={[
              0.8, 
              0.4, 
              enemy.type === AirplaneType.Bomber ? 3.5 : 3
            ]} />
          </mesh>
          
          {/* Cockpit */}
          <mesh castShadow position={[0, 0.3, -0.3]}>
            <meshStandardMaterial color="#2d3436" roughness={0.3} metalness={0.5} transparent opacity={0.7} />
            <boxGeometry args={[0.6, 0.3, 1]} />
          </mesh>
          
          {/* Wings */}
          <mesh castShadow receiveShadow>
            <meshStandardMaterial 
              color={
                enemy.type === AirplaneType.Fighter ? '#d63031' : 
                enemy.type === AirplaneType.Bomber ? '#2d3436' : 
                '#e17055'
              } 
              roughness={0.5} 
              metalness={0.7}
            />
            <boxGeometry args={[
              enemy.type === AirplaneType.Bomber ? 5 :
              enemy.type === AirplaneType.Scout ? 3 : 4, 
              0.1, 
              1
            ]} />
          </mesh>
          
          {/* Tail */}
          <mesh castShadow receiveShadow position={[0, 0.4, 1.2]}>
            <meshStandardMaterial 
              color={
                enemy.type === AirplaneType.Fighter ? '#d63031' : 
                enemy.type === AirplaneType.Bomber ? '#2d3436' : 
                '#e17055'
              } 
              roughness={0.5} 
              metalness={0.7}
            />
            <boxGeometry args={[1, 0.6, 0.1]} />
          </mesh>
          
          {/* Propeller center */}
          <mesh castShadow position={[0, 0, -1.55]}>
            <meshStandardMaterial color="#333" roughness={0.5} metalness={0.9} />
            <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
          </mesh>
          
          {/* Propeller blades */}
          <group 
            position={[0, 0, -1.6]} 
            ref={ref => {
              if (ref) propellerRefs.current.set(enemy.id, ref);
            }}
          >
            <mesh castShadow>
              <meshStandardMaterial color="#222" roughness={0.5} metalness={0.7} />
              <boxGeometry args={[0.1, 1.5, 0.05]} />
            </mesh>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color="#222" roughness={0.5} metalness={0.7} />
              <boxGeometry args={[0.1, 1.5, 0.05]} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}
