
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  const steps = [
    {
      step: '1',
      title: 'Set Up Your School',
      description: 'Add your subjects, teachers, classes, and classrooms to the system.',
      color: 'from-blue-500 to-primary-600'
    },
    {
      step: '2',
      title: 'Define Constraints',
      description: 'Set teacher availability, room preferences, and scheduling constraints.',
      color: 'from-primary-500 to-purple-600'
    },
    {
      step: '3',
      title: 'Generate Timetable',
      description: 'Our AI creates an optimized timetable that meets all your requirements.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      step: '4',
      title: 'Review & Export',
      description: 'Review the generated timetable and export it in your preferred format.',
      color: 'from-pink-500 to-red-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Creating the perfect timetable is as easy as 1-2-3-4. Follow these simple steps to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transform -translate-y-1/2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
