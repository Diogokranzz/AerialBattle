import { AirplaneData, AirplaneType } from '../types';
import { calculateForwardVector } from './physics';

/**
 * AI behavior types
 */
export enum AIBehavior {
  Patrol,    // Fly in a pattern
  Pursue,    // Chase the player
  Evade,     // Run away from player
  Attack,    // Attack player when in range
  Formation  // Fly in formation with other enemies
}

/**
 * AI state for an enemy airplane
 */
export interface AIState {
  behavior: AIBehavior;
  targetPosition?: {
    x: number;
    y: number;
    z: number;
  };
  patrolPoints?: Array<{
    x: number;
    y: number;
    z: number;
  }>;
  currentPatrolIndex?: number;
  lastBehaviorChange: number;
  formationOffset?: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Initialize AI state for an enemy
 */
export function initializeAI(enemy: AirplaneData): AIState {
  // Generate random patrol points
  const patrolRadius = 50 + Math.random() * 50;
  const patrolHeight = 5 + Math.random() * 20;
  const numPatrolPoints = 3 + Math.floor(Math.random() * 3);
  
  const patrolPoints = [];
  for (let i = 0; i < numPatrolPoints; i++) {
    const angle = (Math.PI * 2 * i) / numPatrolPoints;
    patrolPoints.push({
      x: Math.sin(angle) * patrolRadius,
      y: patrolHeight,
      z: Math.cos(angle) * patrolRadius
    });
  }
  
  // Choose initial behavior based on airplane type
  let behavior = AIBehavior.Patrol;
  switch (enemy.type) {
    case AirplaneType.Fighter:
      behavior = AIBehavior.Pursue;
      break;
    case AirplaneType.Bomber:
      behavior = AIBehavior.Patrol;
      break;
    case AirplaneType.Scout:
      behavior = AIBehavior.Evade;
      break;
  }
  
  return {
    behavior,
    patrolPoints,
    currentPatrolIndex: 0,
    lastBehaviorChange: Date.now(),
    formationOffset: {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 10
    }
  };
}

/**
 * Update AI behavior for an enemy
 */
export function updateAI(
  enemy: AirplaneData,
  aiState: AIState,
  playerPosition: { x: number; y: number; z: number },
  otherEnemies: AirplaneData[]
): {
  targetPosition: { x: number; y: number; z: number };
  shouldFire: boolean;
} {
  const now = Date.now();
  let targetPosition = { ...playerPosition };
  let shouldFire = false;
  
  // Potentially change behavior
  if (now - aiState.lastBehaviorChange > 10000) { // Change behavior every 10 seconds
    const rand = Math.random();
    
    if (enemy.type === AirplaneType.Fighter) {
      // Fighters prefer pursuit and attack
      if (rand < 0.7) {
        aiState.behavior = AIBehavior.Pursue;
      } else if (rand < 0.9) {
        aiState.behavior = AIBehavior.Attack;
      } else {
        aiState.behavior = AIBehavior.Patrol;
      }
    } else if (enemy.type === AirplaneType.Bomber) {
      // Bombers prefer patrol and formation
      if (rand < 0.5) {
        aiState.behavior = AIBehavior.Patrol;
      } else if (rand < 0.8) {
        aiState.behavior = AIBehavior.Formation;
      } else {
        aiState.behavior = AIBehavior.Attack;
      }
    } else { // Scout
      // Scouts prefer evasion and patrol
      if (rand < 0.6) {
        aiState.behavior = AIBehavior.Evade;
      } else {
        aiState.behavior = AIBehavior.Patrol;
      }
    }
    
    aiState.lastBehaviorChange = now;
  }
  
  // Calculate distance to player
  const dx = playerPosition.x - enemy.position.x;
  const dy = playerPosition.y - enemy.position.y;
  const dz = playerPosition.z - enemy.position.z;
  const distanceToPlayer = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Execute behavior
  switch (aiState.behavior) {
    case AIBehavior.Patrol:
      if (!aiState.patrolPoints || aiState.patrolPoints.length === 0) {
        break;
      }
      
      const currentPoint = aiState.patrolPoints[aiState.currentPatrolIndex || 0];
      targetPosition = currentPoint;
      
      // Check if reached current patrol point
      const dxPatrol = currentPoint.x - enemy.position.x;
      const dyPatrol = currentPoint.y - enemy.position.y;
      const dzPatrol = currentPoint.z - enemy.position.z;
      const distToPatrolPoint = Math.sqrt(dxPatrol * dxPatrol + dyPatrol * dyPatrol + dzPatrol * dzPatrol);
      
      if (distToPatrolPoint < 5) {
        // Move to next patrol point
        aiState.currentPatrolIndex = ((aiState.currentPatrolIndex || 0) + 1) % aiState.patrolPoints.length;
      }
      
      // Occasionally fire if player is nearby
      if (distanceToPlayer < 30 && Math.random() < 0.01) {
        shouldFire = true;
      }
      break;
      
    case AIBehavior.Pursue:
      // Target directly at player
      targetPosition = playerPosition;
      
      // Fire if within range and facing player
      const forward = calculateForwardVector(enemy.rotation.y);
      const dotProduct = dx * forward.x + dz * forward.z;
      
      if (distanceToPlayer < 30 && dotProduct > 0.7 * distanceToPlayer) {
        shouldFire = true;
      }
      break;
      
    case AIBehavior.Evade:
      // Move away from player
      targetPosition = {
        x: enemy.position.x + (enemy.position.x - playerPosition.x),
        y: enemy.position.y + (enemy.position.y - playerPosition.y),
        z: enemy.position.z + (enemy.position.z - playerPosition.z)
      };
      
      // Maintain minimum altitude
      if (targetPosition.y < 5) {
        targetPosition.y = 5;
      }
      break;
      
    case AIBehavior.Attack:
      // Move to attack position
      const attackDistance = 20;
      const attackVector = calculateForwardVector(enemy.rotation.y);
      
      // Aim slightly ahead of player for intercept
      targetPosition = {
        x: playerPosition.x,
        y: playerPosition.y,
        z: playerPosition.z
      };
      
      // If too close, back off slightly
      if (distanceToPlayer < attackDistance * 0.5) {
        targetPosition = {
          x: enemy.position.x - attackVector.x * 10,
          y: enemy.position.y,
          z: enemy.position.z - attackVector.z * 10
        };
      }
      
      // Fire frequently
      if (distanceToPlayer < 40) {
        shouldFire = Math.random() < 0.1;
      }
      break;
      
    case AIBehavior.Formation:
      // Find lead airplane (closest other enemy)
      let closestEnemy = null;
      let minDistance = Infinity;
      
      for (const other of otherEnemies) {
        if (other.id === enemy.id) continue;
        
        const distance = Math.sqrt(
          Math.pow(other.position.x - enemy.position.x, 2) +
          Math.pow(other.position.y - enemy.position.y, 2) +
          Math.pow(other.position.z - enemy.position.z, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestEnemy = other;
        }
      }
      
      if (closestEnemy && aiState.formationOffset) {
        // Get lead's forward vector
        const leadForward = calculateForwardVector(closestEnemy.rotation.y);
        
        // Position in formation relative to lead
        targetPosition = {
          x: closestEnemy.position.x + aiState.formationOffset.x,
          y: closestEnemy.position.y + aiState.formationOffset.y,
          z: closestEnemy.position.z + aiState.formationOffset.z
        };
      } else {
        // No lead found, revert to patrol
        aiState.behavior = AIBehavior.Patrol;
      }
      
      break;
  }
  
  return { targetPosition, shouldFire };
}
