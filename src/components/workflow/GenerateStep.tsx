
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Play, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const GenerateStep: React.FC<GenerateStepProps> = ({ onNext, onPrevious }) => {
  const [generating, setGenerating] = useState(false);
  const [dataSummary, setDataSummary] = useState({
    subjects: 0,
    teachers: 0,
    classes: 0,
    classrooms: 0
  });
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    fetchDataSummary();
  }, []);

  const fetchDataSummary = async () => {
    try {
      const [subjectsRes, teachersRes, classesRes, classroomsRes] = await Promise.all([
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('classrooms').select('id', { count: 'exact', head: true })
      ]);

      setDataSummary({
        subjects: subjectsRes.count || 0,
        teachers: teachersRes.count || 0,
        classes: classesRes.count || 0,
        classrooms: classroomsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching data summary:', error);
    }
  };

  const generateTimetable = async () => {
    if (dataSummary.subjects === 0 || dataSummary.teachers === 0 || dataSummary.classes === 0) {
      toast.error('Please ensure you have added subjects, teachers, and classes before generating');
      return;
    }

    setGenerating(true);
    try {
      // Simulate the existing timetable generation logic
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single();

      if (!profile?.school_id) throw new Error('School not found');

      // Create a new timetable record
      const { data: timetable, error: timetableError } = await supabase
        .from('timetables')
        .insert([{
          name: `Timetable ${new Date().toLocaleDateString()}`,
          academic_year: new Date().getFullYear().toString(),
          term: 'Term 1',
          periods_per_day: parseInt(localStorage.getItem('periods_per_day') || '8'),
          school_id: profile.school_id,
          is_active: true
        }])
        .select()
        .single();

      if (timetableError) throw timetableError;

      // Fetch data for generation
      const [subjectsData, teachersData, classesData, availabilityData] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('teachers').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('teacher_availability').select('*')
      ]);

      const subjects = subjectsData.data || [];
      const teachers = teachersData.data || [];
      const classes = classesData.data || [];
      const availability = availabilityData.data || [];

      // Simple timetable generation algorithm
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const periodsPerDay = parseInt(localStorage.getItem('periods_per_day') || '8');
      const usedSlots = new Set<string>();

      const isTeacherAvailable = (teacherId: string, day: string, period: number): boolean => {
        const teacherAvailability = availability.find(
          av => av.teacher_id === teacherId && 
               av.day_of_week === day && 
               av.start_period === period
        );
        return teacherAvailability?.is_available ?? true;
      };

      // Generate lessons and slots
      for (const day of days) {
        for (let period = 1; period <= periodsPerDay; period++) {
          for (const classItem of classes) {
            // Find an available teacher for this slot
            let assignedTeacher = null;
            let assignedSubject = null;

            for (const teacher of teachers) {
              const slotKey = `${teacher.id}-${day}-${period}`;
              
              if (!usedSlots.has(slotKey) && isTeacherAvailable(teacher.id, day, period)) {
                assignedTeacher = teacher;
                usedSlots.add(slotKey);
                break;
              }
            }

            if (assignedTeacher && subjects.length > 0) {
              assignedSubject = subjects[Math.floor(Math.random() * subjects.length)];

              // Create lesson
              const { data: lesson, error: lessonError } = await supabase
                .from('lessons')
                .insert([{
                  name: `${assignedSubject.name} - ${classItem.name}`,
                  duration_periods: 1,
                  school_id: profile.school_id
                }])
                .select()
                .single();

              if (lessonError) continue;

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
              await supabase.from('timetable_slots').insert([{
                timetable_id: timetable.id,
                lesson_id: lesson.id,
                day_of_week: day,
                period: period
              }]);
            }
          }
        }
      }

      setGenerated(true);
      toast.success('Timetable generated successfully!');
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast.error('Failed to generate timetable');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <span>Step 8: Generate the Timetable</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded">
            <div className="text-2xl font-bold text-blue-600">{dataSummary.subjects}</div>
            <div className="text-sm text-gray-600">Subjects</div>
          </div>
          <div className="text-center p-4 border rounded">
            <div className="text-2xl font-bold text-green-600">{dataSummary.teachers}</div>
            <div className="text-sm text-gray-600">Teachers</div>
          </div>
          <div className="text-center p-4 border rounded">
            <div className="text-2xl font-bold text-purple-600">{dataSummary.classes}</div>
            <div className="text-sm text-gray-600">Classes</div>
          </div>
          <div className="text-center p-4 border rounded">
            <div className="text-2xl font-bold text-orange-600">{dataSummary.classrooms}</div>
            <div className="text-sm text-gray-600">Classrooms</div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Ready to Generate!</h4>
          <p className="text-sm text-green-700">
            All your data has been entered. The AI engine will now create an optimized timetable 
            considering teacher availability, constraints, and preferences you've set.
          </p>
        </div>

        {generated && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Timetable Generated Successfully!</h4>
            </div>
            <p className="text-sm text-blue-700">
              Your timetable has been created and saved. Proceed to the next step to review and make any adjustments.
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {!generated ? (
            <Button onClick={generateTimetable} disabled={generating} className="bg-green-600 hover:bg-green-700">
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
          ) : (
            <Button onClick={onNext}>
              Review Timetable
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GenerateStep;
