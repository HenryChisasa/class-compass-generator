
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, BookOpen } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Smart Timetable Generation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Create optimized school timetables in minutes. Our AI-powered system handles constraints, 
              teacher availability, and resource allocation automatically.
            </p>
          </div>

          <div className="animate-slide-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Creating Timetables
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary-300 text-primary-600 hover:bg-primary-50 px-8 py-6 text-lg rounded-xl"
            >
              Watch Demo
            </Button>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="animate-float text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-primary-100 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-sm text-gray-600">AI-powered optimization</p>
            </div>
            
            <div className="animate-float text-center" style={{ animationDelay: '1s' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Teacher Management</h3>
              <p className="text-sm text-gray-600">Availability tracking</p>
            </div>
            
            <div className="animate-float text-center" style={{ animationDelay: '2s' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-600">Instant modifications</p>
            </div>
            
            <div className="animate-float text-center" style={{ animationDelay: '3s' }}>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Subject Optimization</h3>
              <p className="text-sm text-gray-600">Balanced curriculum</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
