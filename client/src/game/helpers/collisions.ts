import { AirplaneData, Projectile } from '../types';

/**
 * Check collision between two airplanes
 * @param airplane1 First airplane data
 * @param airplane2 Second airplane data
 * @returns Boolean indicating if collision occurred
 */
export function checkAirplaneCollision(
  airplane1: AirplaneData,
  airplane2: AirplaneData
): boolean {
  // Define collision radius
  const collisionRadiusSum = 2.0; // Combined radius of both airplanes
  
  // Calculate distance between airplanes
  const dx = airplane1.position.x - airplane2.position.x;
  const dy = airplane1.position.y - airplane2.position.y;
  const dz = airplane1.position.z - airplane2.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Check if distance is less than collision radius
  return distance < collisionRadiusSum;
}

/**
 * Check collision between airplane and projectile
 * @param airplane Airplane data
 * @param projectile Projectile data
 * @returns Boolean indicating if collision occurred
 */
export function checkProjectileCollision(
  airplane: AirplaneData,
  projectile: Projectile
): boolean {
  // Define collision radius based on projectile type
  const airplaneRadius = 1.5;
  const projectileRadius = projectile.type === 'missile' ? 1.0 : 0.5;
  const collisionRadiusSum = airplaneRadius + projectileRadius;
  
  // Calculate distance
  const dx = airplane.position.x - projectile.position.x;
  const dy = airplane.position.y - projectile.position.y;
  const dz = airplane.position.z - projectile.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Check if distance is less than collision radius
  return distance < collisionRadiusSum;
}

/**
 * Check if an airplane is colliding with terrain
 * @param airplane Airplane data
 * @param terrainHeight Height of terrain at airplane's position
 * @returns Boolean indicating if collision occurred
 */
export function checkTerrainCollision(
  airplane: AirplaneData,
  terrainHeight: number = 0
): boolean {
  // Add a small buffer above terrain
  const safeAltitude = terrainHeight + 1.0;
  
  // Check if airplane is below safe altitude
  return airplane.position.y < safeAltitude;
}

/**
 * Check if a point is outside the game boundaries
 * @param position Position to check
 * @param bounds Boundary limits
 * @returns Boolean indicating if outside bounds
 */
export function isOutOfBounds(
  position: { x: number; y: number; z: number },
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }
): boolean {
  return (
    position.x < bounds.minX ||
    position.x > bounds.maxX ||
    position.y < bounds.minY ||
    position.y > bounds.maxY ||
    position.z < bounds.minZ ||
    position.z > bounds.maxZ
  );
}
