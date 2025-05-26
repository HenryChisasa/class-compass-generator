
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  MapPin, 
  Calendar,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and get user profile
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profile);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const stats = [
    { label: 'Subjects', value: '0', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Classes', value: '0', icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Teachers', value: '0', icon: Users, color: 'bg-purple-500' },
    { label: 'Classrooms', value: '0', icon: MapPin, color: 'bg-orange-500' },
  ];

  const quickActions = [
    { label: 'Add Subject', icon: BookOpen, action: () => console.log('Add Subject') },
    { label: 'Add Class', icon: GraduationCap, action: () => console.log('Add Class') },
    { label: 'Add Teacher', icon: Users, action: () => console.log('Add Teacher') },
    { label: 'Generate Timetable', icon: Calendar, action: () => console.log('Generate Timetable') },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {profile?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your school's timetables efficiently
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="flex flex-col items-center justify-center h-24 space-y-2"
                onClick={action.action}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Start by adding subjects, classes, and teachers to get started
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
