import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import { Controls } from "./game/components/Controls";
import { Environment } from "./game/components/Environment";
import { Airplane } from "./game/components/Airplane";
import { Enemy } from "./game/components/Enemy";
import { Terrain } from "./game/components/Terrain";
import { GameUI } from "./game/components/GameUI";
import { WeatherEffects } from "./game/components/WeatherEffects";
import { useGame } from "./lib/stores/useGame";
import { Controls as ControlKeys } from "./game/types";

// Define control keys for the game
const controls = [
  { name: ControlKeys.forward, keys: ["KeyW", "ArrowUp"] },
  { name: ControlKeys.backward, keys: ["KeyS", "ArrowDown"] },
  { name: ControlKeys.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: ControlKeys.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: ControlKeys.fire, keys: ["Space"] },
  { name: ControlKeys.missile, keys: ["KeyF"] },
  { name: ControlKeys.boost, keys: ["ShiftLeft"] },
];

// Background sound setup
function SoundSetup() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  
  useEffect(() => {
    // Create audio elements
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    const hitSfx = new Audio("/sounds/hit.mp3");
    const successSfx = new Audio("/sounds/success.mp3");
    
    // Set in store
    setBackgroundMusic(bgMusic);
    setHitSound(hitSfx);
    setSuccessSound(successSfx);
    
    return () => {
      bgMusic.pause();
      hitSfx.pause();
      successSfx.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  return null;
}

// Start menu component
function StartMenu() {
  const { start } = useGame();
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
      <div className="bg-slate-800 p-8 rounded-lg max-w-md text-center">
        <h1 className="text-4xl font-bold text-sky-400 mb-4">Sky Combat</h1>
        <p className="text-white mb-6">Take to the skies and defeat enemy aircraft in intense dogfights!</p>
        <button 
          onClick={() => start()}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-full transition"
        >
          Start Game
        </button>
        <div className="mt-4 text-slate-300 text-sm">
          <p>Controls:</p>
          <p>WASD / Arrow Keys - Fly</p>
          <p>Space - Fire Gun</p>
          <p>F - Launch Missile</p>
          <p>Shift - Boost</p>
        </div>
      </div>
    </div>
  );
}

// Game over screen
function GameOver() {
  const { restart } = useGame();
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
      <div className="bg-slate-800 p-8 rounded-lg max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Game Over</h1>
        <p className="text-white mb-6">Your plane was shot down!</p>
        <button 
          onClick={() => restart()}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-full transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Main App component
function App() {
  const { phase } = useGame();
  const [showCanvas, setShowCanvas] = useState(false);

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <SoundSetup />
      
      {showCanvas && (
        <KeyboardControls map={controls}>
          {phase === "ready" && <StartMenu />}
          {phase === "ended" && <GameOver />}
          
          <Canvas
            shadows
            camera={{
              position: [0, 10, 20],
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "default"
            }}
          >
            <color attach="background" args={["#87CEEB"]} />
            
            {/* Environment lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
            />
            
            <Suspense fallback={null}>
              <Environment />
              <Terrain />
              <WeatherEffects />
              
              {phase === "playing" && (
                <>
                  <Airplane />
                  <Enemy count={3} />
                  <Controls />
                </>
              )}
            </Suspense>
          </Canvas>
          
          <GameUI />
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
