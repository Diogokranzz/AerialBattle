import { useEffect } from 'react';
import { useAirplaneStore } from '../stores/useAirplaneStore';
import { useGame } from '../../lib/stores/useGame';
import { WeatherType } from '../types';
import { useAudio } from '../../lib/stores/useAudio';

export function GameUI() {
  const { player, enemies, score, weather } = useAirplaneStore();
  const { phase } = useGame();
  const { toggleMute, isMuted } = useAudio();
  
  // Play background music when game starts
  useEffect(() => {
    const { backgroundMusic } = useAudio.getState();
    
    if (phase === 'playing' && backgroundMusic) {
      backgroundMusic.play().catch(err => {
        console.log('Audio play prevented:', err);
      });
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [phase]);
  
  // Get weather description
  const getWeatherText = () => {
    switch (weather) {
      case WeatherType.Clear:
        return 'Clear Skies';
      case WeatherType.Cloudy:
        return 'Cloudy';
      case WeatherType.Rainy:
        return 'Stormy';
      case WeatherType.Foggy:
        return 'Foggy';
      default:
        return 'Unknown';
    }
  };
  
  if (phase !== 'playing') return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col p-4">
      {/* Top HUD - score and enemy count */}
      <div className="flex justify-between items-start mb-auto">
        <div className="bg-slate-800/80 text-white rounded-lg p-3 backdrop-blur-sm">
          <div className="text-lg font-bold">Score: {score}</div>
          <div>Enemies: {enemies.length}</div>
          <div>Weather: {getWeatherText()}</div>
        </div>
        
        {/* Sound toggle button - needs pointer events */}
        <button 
          onClick={toggleMute} 
          className="bg-slate-800/80 text-white rounded-full p-2 pointer-events-auto"
        >
          <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMuted ? (
              <>
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </>
            ) : (
              <>
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </>
            )}
          </svg>
        </button>
      </div>
      
      {/* Bottom HUD - health and weapons */}
      {player && (
        <div className="mt-auto flex flex-col">
          {/* Health bar */}
          <div className="bg-slate-800/80 p-3 rounded-lg backdrop-blur-sm mb-2">
            <div className="flex justify-between items-center text-white mb-1">
              <span>Health</span>
              <span>{player.health}/{player.maxHealth}</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-green-500"
                style={{ 
                  width: `${(player.health / player.maxHealth) * 100}%`,
                  transition: 'width 0.3s ease-out'
                }}
              />
            </div>
          </div>
          
          {/* Weapons */}
          <div className="flex gap-2">
            <div className="bg-slate-800/80 p-3 rounded-lg backdrop-blur-sm text-white">
              <div className="text-center mb-1">Gun</div>
              <div className="text-center text-lg font-mono">∞</div>
            </div>
            
            <div className="bg-slate-800/80 p-3 rounded-lg backdrop-blur-sm text-white">
              <div className="text-center mb-1">Missiles</div>
              <div className="text-center text-lg font-mono">{player.missiles}</div>
            </div>
            
            <div className="bg-slate-800/80 p-3 rounded-lg backdrop-blur-sm text-white">
              <div className="text-center mb-1">Boost</div>
              <div className="text-center">
                <span className={`inline-block w-3 h-3 rounded-full ${player.boost ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
