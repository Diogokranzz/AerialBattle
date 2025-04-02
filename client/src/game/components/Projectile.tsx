import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color, Mesh } from 'three';
import { useAirplaneStore } from '../stores/useAirplaneStore';

// Helper for instance matrices
const tempObject = new Object3D();
const tempColor = new Color();

export function Projectile() {
  const bulletRef = useRef<InstancedMesh>(null);
  const missileRef = useRef<InstancedMesh>(null);
  
  const { projectiles, updateProjectiles } = useAirplaneStore();
  
  // Update projectiles on each frame
  useFrame((_, delta) => {
    // Update projectile physics
    updateProjectiles(delta);
    
    // Filter bullets and missiles
    const bullets = projectiles.filter(p => p.type === 'bullet');
    const missiles = projectiles.filter(p => p.type === 'missile');
    
    // Update bullet instances
    if (bulletRef.current) {
      for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        
        // Update position
        tempObject.position.set(
          bullet.position.x,
          bullet.position.y,
          bullet.position.z
        );
        
        // Set scale for bullets
        tempObject.scale.set(0.1, 0.1, 0.5);
        
        // Update matrix
        tempObject.updateMatrix();
        bulletRef.current.setMatrixAt(i, tempObject.matrix);
        
        // Set color based on if enemy or player
        const color = bullet.isEnemy ? '#ff3333' : '#33ff33';
        tempColor.set(color);
        bulletRef.current.setColorAt(i, tempColor);
      }
      
      // Update instance count and matrix
      bulletRef.current.count = bullets.length;
      bulletRef.current.instanceMatrix.needsUpdate = true;
      if (bulletRef.current.instanceColor) bulletRef.current.instanceColor.needsUpdate = true;
    }
    
    // Update missile instances
    if (missileRef.current) {
      for (let i = 0; i < missiles.length; i++) {
        const missile = missiles[i];
        
        // Update position
        tempObject.position.set(
          missile.position.x,
          missile.position.y,
          missile.position.z
        );
        
        // Calculate rotation from direction
        tempObject.lookAt(
          missile.position.x + missile.direction.x,
          missile.position.y + missile.direction.y,
          missile.position.z + missile.direction.z
        );
        
        // Set scale for missiles
        tempObject.scale.set(0.2, 0.2, 0.8);
        
        // Update matrix
        tempObject.updateMatrix();
        missileRef.current.setMatrixAt(i, tempObject.matrix);
        
        // Set color based on if enemy or player
        const color = missile.isEnemy ? '#ff5555' : '#55ff55';
        tempColor.set(color);
        missileRef.current.setColorAt(i, tempColor);
      }
      
      // Update instance count and matrix
      missileRef.current.count = missiles.length;
      missileRef.current.instanceMatrix.needsUpdate = true;
      if (missileRef.current.instanceColor) missileRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  return (
    <>
      {/* Bullet instances */}
      <instancedMesh
        ref={bulletRef}
        args={[undefined, undefined, 100]} // Pre-allocate for 100 bullets max
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial />
      </instancedMesh>
      
      {/* Missile instances */}
      <instancedMesh
        ref={missileRef}
        args={[undefined, undefined, 50]} // Pre-allocate for 50 missiles max
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
        <meshStandardMaterial />
      </instancedMesh>
    </>
  );
}
