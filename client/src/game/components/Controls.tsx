import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useAirplaneStore } from '../stores/useAirplaneStore';
import { Controls as ControlKeys } from '../types';
import { Projectile } from './Projectile';
import { Explosion } from './Explosion';

export function Controls() {
  const [, getKeys] = useKeyboardControls<ControlKeys>();
  
  // Log controls for debugging
  useEffect(() => {
    console.log("Game controls initialized");
    
    return () => {
      console.log("Game controls unmounted");
    };
  }, []);
  
  // Debug game state
  useFrame(() => {
    const controls = getKeys();
    const { player, enemies, projectiles } = useAirplaneStore.getState();
    
    // Log controls when pressed
    if (controls.fire) {
      console.log("Fire control activated");
    }
    
    if (controls.missile) {
      console.log("Missile control activated");
    }
    
    // Debug game state (uncomment for debugging)
    /*
    console.log(
      `P: ${player ? `(${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)})` : 'none'}, ` +
      `E: ${enemies.length}, ` +
      `Proj: ${projectiles.length}`
    );
    */
  });
  
  return (
    <>
      <Projectile />
      <Explosion />
    </>
  );
}
