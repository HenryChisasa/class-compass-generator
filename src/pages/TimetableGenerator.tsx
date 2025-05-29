import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Play, Download } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import TimetableGrid from '@/components/TimetableGrid';
import type { Database } from '@/integrations/supabase/types';

interface TimetableData {
  subjects: any[];
  classes: any[];
  teachers: any[];
  classrooms: any[];
}

interface UserProfile {
  id: string;
  school_id: string;
  full_name: string;
}

type DayOfWeek = Database['public']['Enums']['availability_day'];

interface TeacherAvailability {
  teacher_id: string;
  day_of_week: DayOfWeek;
  start_period: number;
  end_period: number;
  is_available: boolean;
}

interface TimetableSlot {
  day_of_week: DayOfWeek;
  period: number;
  subject_name?: string;
  subject_color?: string;
  class_name?: string;
  teacher_name?: string;
  classroom_name?: string;
}

const TimetableGenerator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [timetableData, setTimetableData] = useState<TimetableData>({
    subjects: [],
    classes: [],
    teachers: [],
    classrooms: []
  });
  const [generatedTimetable, setGeneratedTimetable] = useState<TimetableSlot[]>([]);
  const [timetableSettings, setTimetableSettings] = useState({
    name: '',
    academic_year: new Date().getFullYear().toString(),
    term: 'Term 1',
    periods_per_day: 8,
    start_date: '',
    end_date: ''
  });
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailability[]>([]);
  const navigate = useNavigate();

  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);

      // Get user profile with school_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Failed to fetch user profile');
        return;
      }

      if (!profileData?.school_id) {
        toast.error('No school associated with your account. Please contact support.');
        return;
      }

      setProfile(profileData);
      await fetchData();
    };
    getUser();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes, teachersRes, classroomsRes, availabilityRes] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('teachers').select('*'),
        supabase.from('classrooms').select('*'),
        supabase.from('teacher_availability').select('*')
      ]);

      setTimetableData({
        subjects: subjectsRes.data || [],
        classes: classesRes.data || [],
        teachers: teachersRes.data || [],
        classrooms: classroomsRes.data || []
      });

      setTeacherAvailability(availabilityRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const isTeacherAvailable = (teacherId: string, day: DayOfWeek, period: number): boolean => {
    const availability = teacherAvailability.find(
      av => av.teacher_id === teacherId && 
           av.day_of_week === day && 
           av.start_period === period
    );
    return availability?.is_available ?? true; // Default to available if no record
  };

  const generateTimetable = async () => {
    if (!timetableSettings.name) {
      toast.error('Please enter a timetable name');
      return;
    }

    if (!profile?.school_id) {
      toast.error('No school ID found');
      return;
    }

    if (timetableData.subjects.length === 0 || timetableData.classes.length === 0 || timetableData.teachers.length === 0) {
      toast.error('Please add subjects, classes, and teachers before generating a timetable');
      return;
    }

    setGenerating(true);
    try {
      // Create timetable record
      const timetableDataToInsert = {
        ...timetableSettings,
        school_id: profile.school_id,
        is_active: true
      };

      const { data: timetable, error: timetableError } = await supabase
        .from('timetables')
        .insert([timetableDataToInsert])
        .select()
        .single();

      if (timetableError) throw timetableError;

      // Enhanced timetable generation algorithm with teacher availability
      const slots: TimetableSlot[] = [];
      const usedSlots = new Set<string>(); // Track used teacher-time combinations

      for (const day of days) {
        for (let period = 1; period <= timetableSettings.periods_per_day; period++) {
          for (const classItem of timetableData.classes) {
            // Find an available teacher and subject for this slot
            let assignedTeacher = null;
            let assignedSubject = null;

            // Try to find an available teacher for this time slot
            for (const teacher of timetableData.teachers) {
              const slotKey = `${teacher.id}-${day}-${period}`;
              
              if (!usedSlots.has(slotKey) && isTeacherAvailable(teacher.id, day, period)) {
                assignedTeacher = teacher;
                usedSlots.add(slotKey);
                break;
              }
            }

            // If we found a teacher, assign a subject
            if (assignedTeacher && timetableData.subjects.length > 0) {
              assignedSubject = timetableData.subjects[Math.floor(Math.random() * timetableData.subjects.length)];

              // Create a lesson
              const lessonDataToInsert = {
                name: `${assignedSubject.name} - ${classItem.name}`,
                duration_periods: 1,
                school_id: profile.school_id
              };

              const { data: lesson, error: lessonError } = await supabase
                .from('lessons')
                .insert([lessonDataToInsert])
                .select()
                .single();

              if (lessonError) throw lessonError;

              // Link lesson to subject, class, and teacher
              await Promise.all([
                supabase.from('lesson_subjects').insert([{
                  lesson_id: lesson.id,
                  subject_id: assignedSubject.id
                }]),
                supabase.from('lesson_classes').insert([{
                  lesson_id: lesson.id,
                  class_id: classItem.id
                }]),
                supabase.from('lesson_teachers').insert([{
                  lesson_id: lesson.id,
                  teacher_id: assignedTeacher.id
                }])
              ]);

              // Create timetable slot
              const slot = {
                timetable_id: timetable.id,
                lesson_id: lesson.id,
                classroom_id: timetableData.classrooms[Math.floor(Math.random() * Math.max(1, timetableData.classrooms.length))]?.id || null,
                day_of_week: day,
                period: period
              };

              const { error: slotError } = await supabase
                .from('timetable_slots')
                .insert([slot]);

              if (slotError) throw slotError;

              slots.push({
                day_of_week: day,
                period: period,
                subject_name: assignedSubject.name,
                subject_color: assignedSubject.color,
                class_name: classItem.name,
                teacher_name: assignedTeacher.name,
                classroom_name: timetableData.classrooms[Math.floor(Math.random() * Math.max(1, timetableData.classrooms.length))]?.name
              });
            }
          }
        }
      }

      setGeneratedTimetable(slots);
      toast.success('Timetable generated successfully with teacher availability considered!');
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast.error('Failed to generate timetable');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Logo size="sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Calendar className="w-8 h-8 mr-3 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Generate Timetable</h1>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{timetableData.subjects.length}</div>
              <div className="text-sm text-gray-600">Subjects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{timetableData.classes.length}</div>
              <div className="text-sm text-gray-600">Classes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{timetableData.teachers.length}</div>
              <div className="text-sm text-gray-600">Teachers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{timetableData.classrooms.length}</div>
              <div className="text-sm text-gray-600">Classrooms</div>
            </CardContent>
          </Card>
        </div>

        {/* Timetable Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Timetable Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="name">Timetable Name</Label>
                <Input
                  id="name"
                  value={timetableSettings.name}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, name: e.target.value })}
                  placeholder="e.g., Spring 2024 Timetable"
                />
              </div>
              <div>
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input
                  id="academic_year"
                  value={timetableSettings.academic_year}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, academic_year: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="term">Term</Label>
                <Input
                  id="term"
                  value={timetableSettings.term}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, term: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="periods_per_day">Periods Per Day</Label>
                <Input
                  id="periods_per_day"
                  type="number"
                  min="1"
                  max="12"
                  value={timetableSettings.periods_per_day}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, periods_per_day: parseInt(e.target.value) || 8 })}
                />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={timetableSettings.start_date}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={timetableSettings.end_date}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, end_date: e.target.value })}
                />
              </div>
            </div>
            
            <Button 
              onClick={generateTimetable} 
              disabled={generating}
              className="w-full md:w-auto"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Timetable
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Timetable Grid */}
        {generatedTimetable.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Generated Timetable</h2>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <TimetableGrid 
              slots={generatedTimetable}
              periodsPerDay={timetableSettings.periods_per_day}
              title="Master Timetable"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default TimetableGenerator;
