
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" />
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-primary-600"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
