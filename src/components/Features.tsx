
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Clock, BookOpen, Settings, Download } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Intelligent Scheduling',
      description: 'Advanced algorithms automatically resolve scheduling conflicts and optimize timetables based on your constraints.',
      color: 'from-blue-500 to-primary-600'
    },
    {
      icon: Users,
      title: 'Teacher Management',
      description: 'Track teacher availability, workload distribution, and preferences to create fair and efficient schedules.',
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: Settings,
      title: 'Flexible Constraints',
      description: 'Set hard and soft constraints including room preferences, time restrictions, and subject requirements.',
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: BookOpen,
      title: 'Subject Optimization',
      description: 'Ensure optimal distribution of subjects across the week with proper spacing and sequencing.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Make instant changes to your timetable with automatic conflict resolution and reoptimization.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Download,
      title: 'Export & Share',
      description: 'Download timetables in multiple formats or share directly with teachers and administrators.',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
              Perfect Timetables
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to create, manage, and optimize school timetables effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
