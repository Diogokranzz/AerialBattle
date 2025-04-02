// Game control keys
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  fire = 'fire',
  missile = 'missile',
  boost = 'boost'
}

// Airplane types
export enum AirplaneType {
  Fighter = 'fighter',
  Bomber = 'bomber',
  Scout = 'scout'
}

// Airplane specs
export interface AirplaneSpecs {
  type: AirplaneType;
  maxSpeed: number;
  acceleration: number;
  handling: number;
  health: number;
  firePower: number;
  fireRate: number;
  missileCount: number;
}

// Game state
export interface GameState {
  score: number;
  enemiesDestroyed: number;
  level: number;
  weatherIntensity: number;
}

// Position and rotation
export interface Transform {
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

// Projectile data
export interface Projectile {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  direction: {
    x: number;
    y: number;
    z: number;
  };
  speed: number;
  damage: number;
  isEnemy: boolean;
  type: 'bullet' | 'missile';
  ttl: number; // time to live in seconds
}

// Airplane data
export interface AirplaneData extends Transform {
  id: string;
  type: AirplaneType;
  health: number;
  maxHealth: number;
  velocity: {
    x: number;
    y: number;
    z: number;
  };
  speed: number;
  boost: boolean;
  missiles: number;
  lastFired: number;
  isPlayer: boolean;
}

// Explosion data
export interface Explosion {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
  ttl: number;
}

// Weather types
export enum WeatherType {
  Clear,
  Cloudy,
  Rainy,
  Foggy
}
