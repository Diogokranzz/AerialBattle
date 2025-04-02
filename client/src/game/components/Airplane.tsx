import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import { useAirplaneStore } from '../stores/useAirplaneStore';
import { Controls, AirplaneType } from '../types';
import { useGame } from '../../lib/stores/useGame';

export function Airplane() {
  const planeRef = useRef<Group>(null);
  const propellerRef = useRef<Mesh>(null);
  
  const { phase } = useGame();
  const { player, createPlayer, updatePlayer } = useAirplaneStore();
  
  // Subscribe to keyboard controls
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Create player airplane when the game starts
  useEffect(() => {
    if (phase === 'playing' && !player) {
      createPlayer(AirplaneType.Fighter);
    }
  }, [phase, player, createPlayer]);
  
  // Update the airplane on each frame
  useFrame((state, delta) => {
    if (phase !== 'playing' || !player) return;
    
    // Get current control states
    const controls = getKeys();
    
    // Update player movement
    updatePlayer(delta, controls);
    
    // Update plane position and rotation
    if (planeRef.current) {
      planeRef.current.position.set(
        player.position.x,
        player.position.y,
        player.position.z
      );
      
      planeRef.current.rotation.set(
        player.rotation.x,
        player.rotation.y,
        player.rotation.z
      );
    }
    
    // Rotate propeller
    if (propellerRef.current) {
      propellerRef.current.rotation.z += 0.5 + (player.speed * 2);
    }
    
    // Update camera position to follow player
    const cameraDistance = 12;
    const cameraHeight = 5;
    const lookAheadDistance = 8;
    
    // Calculate camera position behind the plane
    const cameraX = player.position.x - Math.sin(player.rotation.y) * cameraDistance;
    const cameraZ = player.position.z - Math.cos(player.rotation.y) * cameraDistance;
    
    // Calculate look at position ahead of the plane
    const lookX = player.position.x + Math.sin(player.rotation.y) * lookAheadDistance;
    const lookZ = player.position.z + Math.cos(player.rotation.y) * lookAheadDistance;
    
    // Smoothly move the camera
    state.camera.position.x = state.camera.position.x * 0.9 + cameraX * 0.1;
    state.camera.position.y = state.camera.position.y * 0.9 + (player.position.y + cameraHeight) * 0.1;
    state.camera.position.z = state.camera.position.z * 0.9 + cameraZ * 0.1;
    
    // Look at a point ahead of the airplane
    state.camera.lookAt(lookX, player.position.y + 1, lookZ);
  });
  
  return player ? (
    <group ref={planeRef}>
      {/* Airplane body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <meshStandardMaterial color="#3080e8" roughness={0.5} metalness={0.7} />
        <boxGeometry args={[0.8, 0.4, 3]} />
      </mesh>
      
      {/* Cockpit */}
      <mesh castShadow position={[0, 0.3, -0.3]}>
        <meshStandardMaterial color="#87CEFA" roughness={0.3} metalness={0.5} transparent opacity={0.7} />
        <boxGeometry args={[0.6, 0.3, 1]} />
      </mesh>
      
      {/* Wings */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <meshStandardMaterial color="#3080e8" roughness={0.5} metalness={0.7} />
        <boxGeometry args={[4, 0.1, 1]} />
      </mesh>
      
      {/* Tail */}
      <mesh castShadow receiveShadow position={[0, 0.4, 1.2]}>
        <meshStandardMaterial color="#3080e8" roughness={0.5} metalness={0.7} />
        <boxGeometry args={[1, 0.6, 0.1]} />
      </mesh>
      
      {/* Propeller center */}
      <mesh castShadow position={[0, 0, -1.55]}>
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.9} />
        <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
      </mesh>
      
      {/* Propeller blades */}
      <group position={[0, 0, -1.6]} ref={propellerRef}>
        <mesh castShadow>
          <meshStandardMaterial color="#222" roughness={0.5} metalness={0.7} />
          <boxGeometry args={[0.1, 1.5, 0.05]} />
        </mesh>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#222" roughness={0.5} metalness={0.7} />
          <boxGeometry args={[0.1, 1.5, 0.05]} />
        </mesh>
      </group>
      
      {/* Landing gear */}
      <mesh castShadow receiveShadow position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.7} />
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
      </mesh>
      
      {/* Engine contrails - only visible during boost */}
      {player.boost && (
        <mesh position={[0, 0, 1.7]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          <coneGeometry args={[0.2, 3, 16]} />
        </mesh>
      )}
    </group>
  ) : null;
}
