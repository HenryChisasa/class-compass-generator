
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import TimetableGrid from '@/components/TimetableGrid';

interface ReviewStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface TimetableSlot {
  day_of_week: string;
  period: number;
  subject_name?: string;
  subject_color?: string;
  class_name?: string;
  teacher_name?: string;
  classroom_name?: string;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ onNext, onPrevious }) => {
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodsPerDay, setPeriodsPerDay] = useState(8);

  useEffect(() => {
    fetchLatestTimetable();
    setPeriodsPerDay(parseInt(localStorage.getItem('periods_per_day') || '8'));
  }, []);

  const fetchLatestTimetable = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single();

      if (!profile?.school_id) return;

      // Get the latest timetable
      const { data: timetable } = await supabase
        .from('timetables')
        .select('id')
        .eq('school_id', profile.school_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!timetable) return;

      // Fetch timetable slots with related data
      const { data: slots } = await supabase
        .from('timetable_slots')
        .select(`
          day_of_week,
          period,
          lessons (
            name,
            lesson_subjects (
              subjects (name, color)
            ),
            lesson_classes (
              classes (name)
            ),
            lesson_teachers (
              teachers (name)
            )
          )
        `)
        .eq('timetable_id', timetable.id);

      if (slots) {
        const formattedSlots: TimetableSlot[] = slots.map(slot => ({
          day_of_week: slot.day_of_week,
          period: slot.period,
          subject_name: slot.lessons?.lesson_subjects?.[0]?.subjects?.name,
          subject_color: slot.lessons?.lesson_subjects?.[0]?.subjects?.color,
          class_name: slot.lessons?.lesson_classes?.[0]?.classes?.name,
          teacher_name: slot.lessons?.lesson_teachers?.[0]?.teachers?.name
        }));

        setTimetableSlots(formattedSlots);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateTimetable = () => {
    // Simple validation logic
    const conflicts: string[] = [];
    const teacherSlots = new Map<string, string[]>();

    timetableSlots.forEach(slot => {
      if (slot.teacher_name) {
        const key = `${slot.day_of_week}-${slot.period}`;
        if (!teacherSlots.has(slot.teacher_name)) {
          teacherSlots.set(slot.teacher_name, []);
        }
        
        const slots = teacherSlots.get(slot.teacher_name)!;
        if (slots.includes(key)) {
          conflicts.push(`${slot.teacher_name} has multiple classes on ${slot.day_of_week} period ${slot.period}`);
        } else {
          slots.push(key);
        }
      }
    });

    if (conflicts.length > 0) {
      toast.error(`Conflicts found: ${conflicts.length}`);
      console.log('Conflicts:', conflicts);
    } else {
      toast.success('No conflicts detected in the timetable');
    }
  };

  const regenerateTimetable = () => {
    toast.info('Regenerating timetable... (This would trigger the generation process again)');
    // In a real implementation, this would call the generation logic again
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-6 h-6 text-blue-600" />
          <span>Step 9: Review and Adjust</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : timetableSlots.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Generated Timetable</h3>
              <div className="space-x-2">
                <Button variant="outline" onClick={validateTimetable}>
                  Validate
                </Button>
                <Button variant="outline" onClick={regenerateTimetable}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
            
            <TimetableGrid 
              slots={timetableSlots}
              periodsPerDay={periodsPerDay}
              title="Master Timetable - Review"
            />

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Review Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check for any scheduling conflicts or issues</li>
                <li>• Ensure teacher availability is respected</li>
                <li>• Verify subject distribution across the week</li>
                <li>• Click "Validate" to check for conflicts automatically</li>
                <li>• Use "Regenerate" if major changes are needed</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No timetable found. Please go back and generate one.</p>
            <Button variant="outline" onClick={onPrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Generate
            </Button>
          </div>
        )}

        {timetableSlots.length > 0 && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button onClick={onNext}>
              Publish & Export
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewStep;
