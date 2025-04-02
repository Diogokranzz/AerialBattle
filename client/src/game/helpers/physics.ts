import { AirplaneData } from '../types';

/**
 * Calculates forces on an airplane based on its current state
 * 
 * @param airplane The airplane to calculate forces for
 * @returns Updated velocity components
 */
export function calculateAirplanePhysics(
  airplane: AirplaneData, 
  delta: number
): { 
  velocityX: number; 
  velocityY: number; 
  velocityZ: number; 
} {
  // Constants
  const GRAVITY = 0.05;
  const DRAG = 0.98;
  const LIFT_FACTOR = 0.05;
  const MIN_SPEED_FOR_LIFT = 0.1;
  
  // Extract values from airplane
  const { velocity, speed } = airplane;
  
  // Apply drag
  let velocityX = velocity.x * DRAG;
  let velocityY = velocity.y * DRAG;
  let velocityZ = velocity.z * DRAG;
  
  // Apply gravity
  velocityY -= GRAVITY * delta;
  
  // Calculate lift based on speed
  if (Math.abs(speed) > MIN_SPEED_FOR_LIFT) {
    // More speed = more lift
    const liftAmount = Math.min(GRAVITY, Math.abs(speed) * LIFT_FACTOR);
    velocityY += liftAmount;
  }
  
  return {
    velocityX,
    velocityY,
    velocityZ
  };
}

/**
 * Calculates the motion of a projectile considering gravity and drag
 * 
 * @param position Current position
 * @param velocity Current velocity
 * @param delta Time step
 * @returns Updated position and velocity
 */
export function calculateProjectilePhysics(
  position: { x: number; y: number; z: number },
  velocity: { x: number; y: number; z: number },
  delta: number
): {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
} {
  // Constants
  const GRAVITY = 0.01;
  const DRAG = 0.99;
  
  // Apply drag
  const newVelocity = {
    x: velocity.x * DRAG,
    y: velocity.y * DRAG - GRAVITY,
    z: velocity.z * DRAG
  };
  
  // Update position
  const newPosition = {
    x: position.x + newVelocity.x,
    y: position.y + newVelocity.y,
    z: position.z + newVelocity.z
  };
  
  return {
    position: newPosition,
    velocity: newVelocity
  };
}

/**
 * Calculate the forward vector based on rotation
 */
export function calculateForwardVector(rotationY: number): { x: number; z: number } {
  return {
    x: Math.sin(rotationY),
    z: Math.cos(rotationY)
  };
}

/**
 * Calculate the right vector based on rotation
 */
export function calculateRightVector(rotationY: number): { x: number; z: number } {
  return {
    x: Math.cos(rotationY),
    z: -Math.sin(rotationY)
  };
}
