import React from 'react';
import { GameSectionData } from '../types';

interface Props {
  data: GameSectionData;
  isActive: boolean;
  disabled: boolean;
  onClick: (id: number) => void;
  angle: number; // Rotation angle for positioning
}

export const GameSection: React.FC<Props> = ({ data, isActive, disabled, onClick, angle }) => {
  const Icon = data.icon;

  // Calculate position in a circle
  // Radius of 140px ensures they are spaced out
  const radius = 140;
  // Convert degrees to radians and offset by -90deg to start at top
  const radian = (angle - 90) * (Math.PI / 180);
  const x = Math.cos(radian) * radius;
  const y = Math.sin(radian) * radius;

  return (
    <button
      onClick={() => !disabled && onClick(data.id)}
      disabled={disabled}
      className={`
        absolute w-24 h-24 rounded-full flex items-center justify-center
        transition-all duration-150 transform preserve-3d
        ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
        border-4 border-gray-800/20 dark:border-white/10
      `}
      style={{
        transform: `translate(${x}px, ${y}px) translateZ(${isActive ? '20px' : '0px'})`,
        backgroundColor: isActive ? data.activeColor : data.color,
        boxShadow: isActive
          ? `0 0 40px ${data.activeColor}, inset 0 0 20px rgba(255,255,255,0.5)`
          : `0 10px 15px -3px rgba(0, 0, 0, 0.5), inset 0 -5px 10px rgba(0,0,0,0.2)`,
        filter: isActive ? 'brightness(1.2)' : 'brightness(0.9)',
      }}
      aria-label={data.label}
    >
      <div 
        className={`transition-transform duration-150 ${isActive ? 'scale-125' : 'scale-100'}`}
      >
        <Icon 
          size={36} 
          className={isActive ? 'text-white' : 'text-white/80'} 
          strokeWidth={2.5}
        />
      </div>
      
      {/* 3D Side Effect (Pseudo-element simulation via child div) */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </button>
  );
};
