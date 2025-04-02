import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  AirplaneData, 
  AirplaneType, 
  Projectile, 
  Explosion, 
  WeatherType, 
  AirplaneSpecs 
} from '../types';
import { useGame } from '../../lib/stores/useGame';
import { useAudio } from '../../lib/stores/useAudio';

// Airplane specifications
const airplaneSpecs: Record<AirplaneType, AirplaneSpecs> = {
  [AirplaneType.Fighter]: {
    type: AirplaneType.Fighter,
    maxSpeed: 0.5,
    acceleration: 0.02,
    handling: 0.04,
    health: 100,
    firePower: 10,
    fireRate: 150, // milliseconds
    missileCount: 4
  },
  [AirplaneType.Bomber]: {
    type: AirplaneType.Bomber,
    maxSpeed: 0.35,
    acceleration: 0.015,
    handling: 0.025,
    health: 150,
    firePower: 15,
    fireRate: 300, // milliseconds
    missileCount: 6
  },
  [AirplaneType.Scout]: {
    type: AirplaneType.Scout,
    maxSpeed: 0.6,
    acceleration: 0.025,
    handling: 0.05,
    health: 80,
    firePower: 8,
    fireRate: 100, // milliseconds
    missileCount: 2
  },
};

// Game state interface
interface AirplaneStore {
  player: AirplaneData | null;
  enemies: AirplaneData[];
  projectiles: Projectile[];
  explosions: Explosion[];
  weather: WeatherType;
  score: number;
  respawnTime: number;
  
  // Player actions
  createPlayer: (type: AirplaneType) => void;
  updatePlayer: (delta: number, controls: Record<string, boolean>) => void;
  fireProjectile: (isEnemy: boolean, sourceAirplane: AirplaneData, type: 'bullet' | 'missile') => void;
  damageAirplane: (airplaneId: string, damage: number) => void;
  
  // Enemy actions
  createEnemy: (type: AirplaneType, position: [number, number, number]) => void;
  updateEnemies: (delta: number, playerPosition: { x: number, y: number, z: number }) => void;
  removeEnemy: (id: string) => void;
  
  // Projectile and explosion handling
  updateProjectiles: (delta: number) => void;
  updateExplosions: (delta: number) => void;
  createExplosion: (position: { x: number, y: number, z: number }, scale: number) => void;
  
  // Game state management
  setWeather: (type: WeatherType) => void;
  reset: () => void;
}

// Create the game store
export const useAirplaneStore = create<AirplaneStore>((set, get) => ({
  player: null,
  enemies: [],
  projectiles: [],
  explosions: [],
  weather: WeatherType.Clear,
  score: 0,
  respawnTime: 0,
  
  createPlayer: (type: AirplaneType) => {
    const specs = airplaneSpecs[type];
    set({
      player: {
        id: 'player',
        type,
        health: specs.health,
        maxHealth: specs.health,
        position: { x: 0, y: 5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        speed: 0,
        boost: false,
        missiles: specs.missileCount,
        lastFired: 0,
        isPlayer: true
      }
    });
  },
  
  updatePlayer: (delta, controls) => {
    const { player } = get();
    if (!player) return;
    
    const specs = airplaneSpecs[player.type];
    const maxSpeed = specs.maxSpeed * (player.boost ? 1.5 : 1);
    const handling = specs.handling * (player.boost ? 0.8 : 1);
    
    // Calculate new velocity based on controls
    const newVelocity = { ...player.velocity };
    const newRotation = { ...player.rotation };
    
    // Forward/backward movement
    if (controls.forward) {
      const targetSpeed = maxSpeed;
      player.speed = Math.min(player.speed + specs.acceleration, targetSpeed);
    } else if (controls.backward) {
      const targetSpeed = -maxSpeed * 0.5;
      player.speed = Math.max(player.speed - specs.acceleration, targetSpeed);
    } else {
      // Gradually slow down if no keys are pressed
      if (player.speed > 0) {
        player.speed = Math.max(0, player.speed - specs.acceleration * 0.5);
      } else if (player.speed < 0) {
        player.speed = Math.min(0, player.speed + specs.acceleration * 0.5);
      }
    }
    
    // Calculate forward vector based on y rotation
    const forwardX = Math.sin(player.rotation.y);
    const forwardZ = Math.cos(player.rotation.y);
    
    // Apply speed to velocity
    newVelocity.x = forwardX * player.speed;
    newVelocity.z = forwardZ * player.speed;
    
    // Left/right rotation
    if (controls.leftward) {
      newRotation.y += handling;
    }
    if (controls.rightward) {
      newRotation.y -= handling;
    }
    
    // Banking effect when turning
    const targetBankAngle = (controls.leftward ? 0.3 : controls.rightward ? -0.3 : 0);
    const bankLerpFactor = 0.1;
    newRotation.z = newRotation.z * (1 - bankLerpFactor) + targetBankAngle * bankLerpFactor;
    
    // Apply velocity to position
    const newPosition = {
      x: player.position.x + newVelocity.x,
      y: player.position.y + newVelocity.y,
      z: player.position.z + newVelocity.z
    };
    
    // Enforce height limits
    if (newPosition.y < 3) {
      newPosition.y = 3;
      newVelocity.y = 0;
    }
    if (newPosition.y > 30) {
      newPosition.y = 30;
      newVelocity.y = 0;
    }
    
    // Set boost state
    const boost = !!controls.boost;
    
    // Fire weapons
    const now = Date.now();
    if (controls.fire && now - player.lastFired > specs.fireRate) {
      get().fireProjectile(false, player, 'bullet');
      player.lastFired = now;
    }
    
    if (controls.missile && player.missiles > 0) {
      if (now - player.lastFired > 500) {  // Longer delay for missiles
        get().fireProjectile(false, player, 'missile');
        player.missiles--;
        player.lastFired = now;
      }
    }
    
    // Update player state
    set({
      player: {
        ...player,
        position: newPosition,
        rotation: newRotation,
        velocity: newVelocity,
        boost
      }
    });
  },
  
  createEnemy: (type, [x, y, z]) => {
    const specs = airplaneSpecs[type];
    const enemy: AirplaneData = {
      id: uuidv4(),
      type,
      health: specs.health,
      maxHealth: specs.health,
      position: { x, y, z },
      rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      speed: 0,
      boost: false,
      missiles: specs.missileCount,
      lastFired: 0,
      isPlayer: false
    };
    
    set(state => ({
      enemies: [...state.enemies, enemy]
    }));
  },
  
  updateEnemies: (delta, playerPosition) => {
    const { enemies, player } = get();
    if (!player) return;
    
    const updatedEnemies = enemies.map(enemy => {
      const specs = airplaneSpecs[enemy.type];
      const dx = playerPosition.x - enemy.position.x;
      const dy = playerPosition.y - enemy.position.y;
      const dz = playerPosition.z - enemy.position.z;
      
      // Calculate distance to player
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      // Calculate target rotation to face player
      const targetRotationY = Math.atan2(dx, dz);
      
      // Smoothly rotate towards player
      let rotationY = enemy.rotation.y;
      const rotationDiff = targetRotationY - rotationY;
      
      // Handle angle wrapping
      let shortestRotation = rotationDiff;
      while (shortestRotation > Math.PI) shortestRotation -= Math.PI * 2;
      while (shortestRotation < -Math.PI) shortestRotation += Math.PI * 2;
      
      rotationY += shortestRotation * specs.handling * 0.5;
      
      // Adjust enemy speed based on distance to player
      let targetSpeed = specs.maxSpeed;
      if (distance < 20) {
        targetSpeed *= 0.7; // Slow down when close to player
      }
      
      // Accelerate/decelerate
      if (enemy.speed < targetSpeed) {
        enemy.speed = Math.min(enemy.speed + specs.acceleration * 0.5, targetSpeed);
      } else if (enemy.speed > targetSpeed) {
        enemy.speed = Math.max(enemy.speed - specs.acceleration * 0.5, targetSpeed);
      }
      
      // Calculate forward vector based on y rotation
      const forwardX = Math.sin(rotationY);
      const forwardZ = Math.cos(rotationY);
      
      // Apply speed to velocity
      const velocity = {
        x: forwardX * enemy.speed,
        y: 0,
        z: forwardZ * enemy.speed
      };
      
      // Apply velocity to position
      const position = {
        x: enemy.position.x + velocity.x,
        y: enemy.position.y + velocity.y,
        z: enemy.position.z + velocity.z
      };
      
      // Try to match player's height with some variation
      const heightDiff = playerPosition.y - position.y;
      position.y += Math.sign(heightDiff) * Math.min(Math.abs(heightDiff), 0.05);
      
      // Ensure minimum height
      if (position.y < 3) position.y = 3;
      
      // Fire at player if in range and facing them
      const now = Date.now();
      const inFiringRange = distance < 30;
      const facing = Math.abs(shortestRotation) < 0.3;
      
      if (inFiringRange && facing && now - enemy.lastFired > specs.fireRate * 2) {
        get().fireProjectile(true, enemy, 'bullet');
        enemy.lastFired = now;
      }
      
      // Occasionally fire missiles
      if (inFiringRange && facing && enemy.missiles > 0 && Math.random() < 0.005) {
        get().fireProjectile(true, enemy, 'missile');
        enemy.missiles--;
        enemy.lastFired = now;
      }
      
      return {
        ...enemy,
        position,
        rotation: { ...enemy.rotation, y: rotationY },
        velocity,
      };
    });
    
    set({ enemies: updatedEnemies });
  },
  
  fireProjectile: (isEnemy, sourceAirplane, type) => {
    const { playHit } = useAudio.getState();
    playHit(); // Play firing sound
    
    const { position, rotation } = sourceAirplane;
    const directionX = Math.sin(rotation.y);
    const directionZ = Math.cos(rotation.y);
    
    // Calculate spawn offset based on direction
    const offsetDist = 2;
    const spawnX = position.x + directionX * offsetDist;
    const spawnY = position.y - 0.2; // Slightly below aircraft
    const spawnZ = position.z + directionZ * offsetDist;
    
    // Set projectile properties based on type
    const speed = type === 'missile' ? 0.7 : 1.2;
    const damage = type === 'missile' ? 30 : 10;
    const ttl = type === 'missile' ? 5 : 2;
    
    const projectile: Projectile = {
      id: uuidv4(),
      position: {
        x: spawnX,
        y: spawnY,
        z: spawnZ
      },
      direction: {
        x: directionX,
        y: 0,
        z: directionZ
      },
      speed,
      damage,
      isEnemy,
      type,
      ttl
    };
    
    set(state => ({
      projectiles: [...state.projectiles, projectile]
    }));
  },
  
  updateProjectiles: (delta) => {
    const { player, enemies, projectiles } = get();
    if (!player) return;
    
    // Update projectile positions and check for collisions
    const updatedProjectiles = projectiles.filter(projectile => {
      // Reduce TTL and remove if expired
      projectile.ttl -= delta;
      if (projectile.ttl <= 0) return false;
      
      // Update position
      projectile.position.x += projectile.direction.x * projectile.speed;
      projectile.position.y += projectile.direction.y * projectile.speed;
      projectile.position.z += projectile.direction.z * projectile.speed;
      
      // Check for collisions with player
      if (projectile.isEnemy) {
        const dx = projectile.position.x - player.position.x;
        const dy = projectile.position.y - player.position.y;
        const dz = projectile.position.z - player.position.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Collision with player
        if (distance < 1.5) {
          get().damageAirplane(player.id, projectile.damage);
          get().createExplosion(projectile.position, projectile.type === 'missile' ? 2 : 1);
          return false;
        }
      }
      
      // Check for collisions with enemies
      if (!projectile.isEnemy) {
        for (const enemy of enemies) {
          const dx = projectile.position.x - enemy.position.x;
          const dy = projectile.position.y - enemy.position.y;
          const dz = projectile.position.z - enemy.position.z;
          const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          // Collision with enemy
          if (distance < 1.5) {
            get().damageAirplane(enemy.id, projectile.damage);
            get().createExplosion(projectile.position, projectile.type === 'missile' ? 2 : 1);
            return false;
          }
        }
      }
      
      return true;
    });
    
    set({ projectiles: updatedProjectiles });
  },
  
  createExplosion: (position, scale) => {
    const { playHit } = useAudio.getState();
    playHit(); // Play explosion sound
    
    const explosion: Explosion = {
      id: uuidv4(),
      position: { ...position },
      scale,
      ttl: 1 // 1 second
    };
    
    set(state => ({
      explosions: [...state.explosions, explosion]
    }));
  },
  
  updateExplosions: (delta) => {
    const { explosions } = get();
    
    const updatedExplosions = explosions.filter(explosion => {
      explosion.ttl -= delta;
      return explosion.ttl > 0;
    });
    
    set({ explosions: updatedExplosions });
  },
  
  damageAirplane: (airplaneId, damage) => {
    const { player, enemies } = get();
    
    if (player && airplaneId === player.id) {
      const newHealth = Math.max(0, player.health - damage);
      set({ player: { ...player, health: newHealth } });
      
      // Check for player death
      if (newHealth <= 0) {
        get().createExplosion(player.position, 3);
        const { end } = useGame.getState();
        setTimeout(() => end(), 500);
      }
    } else {
      // Check if hit enemy
      const enemyIndex = enemies.findIndex(e => e.id === airplaneId);
      if (enemyIndex >= 0) {
        const enemy = enemies[enemyIndex];
        const newHealth = Math.max(0, enemy.health - damage);
        
        if (newHealth <= 0) {
          // Enemy destroyed
          get().createExplosion(enemy.position, 3);
          get().removeEnemy(enemy.id);
          set(state => ({ score: state.score + 100 }));
          
          // Play success sound
          const { playSuccess } = useAudio.getState();
          playSuccess();
        } else {
          // Enemy damaged
          const updatedEnemies = [...enemies];
          updatedEnemies[enemyIndex] = { ...enemy, health: newHealth };
          set({ enemies: updatedEnemies });
        }
      }
    }
  },
  
  removeEnemy: (id) => {
    set(state => ({
      enemies: state.enemies.filter(enemy => enemy.id !== id)
    }));
  },
  
  setWeather: (type) => {
    set({ weather: type });
  },
  
  reset: () => {
    set({
      player: null,
      enemies: [],
      projectiles: [],
      explosions: [],
      score: 0,
      respawnTime: 0
    });
  }
}));
