
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg`}>
        <Calendar className="w-5 h-5 text-white absolute" />
        <Clock className="w-3 h-3 text-white absolute top-1 right-1" />
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          Auto Timetable Generator
        </span>
      )}
    </div>
  );
};

export default Logo;
