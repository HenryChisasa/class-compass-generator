
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

interface TeacherAvailabilityProps {
  teacherId: string;
  teacherName: string;
  schoolId: string;
  periodsPerDay?: number;
}

type DayOfWeek = Database['public']['Enums']['availability_day'];

interface AvailabilitySlot {
  id?: string;
  day_of_week: DayOfWeek;
  start_period: number;
  end_period: number;
  is_available: boolean;
}

const TeacherAvailability: React.FC<TeacherAvailabilityProps> = ({ 
  teacherId, 
  teacherName, 
  schoolId,
  periodsPerDay = 8 
}) => {
  const [open, setOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const periods = Array.from({ length: periodsPerDay }, (_, i) => i + 1);

  useEffect(() => {
    if (open) {
      fetchAvailability();
    }
  }, [open, teacherId]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId);

      if (error) throw error;

      // Initialize availability grid - all periods available by default
      const availabilityGrid: AvailabilitySlot[] = [];
      
      days.forEach(day => {
        periods.forEach(period => {
          const existingSlot = data?.find(
            slot => slot.day_of_week === day && 
                   slot.start_period === period && 
                   slot.end_period === period
          );
          
          availabilityGrid.push({
            id: existingSlot?.id,
            day_of_week: day,
            start_period: period,
            end_period: period,
            is_available: existingSlot?.is_available ?? true
          });
        });
      });

      setAvailability(availabilityGrid);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to fetch teacher availability');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = (day: DayOfWeek, period: number) => {
    setAvailability(prev => 
      prev.map(slot => 
        slot.day_of_week === day && slot.start_period === period
          ? { ...slot, is_available: !slot.is_available }
          : slot
      )
    );
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // Delete existing availability for this teacher
      await supabase
        .from('teacher_availability')
        .delete()
        .eq('teacher_id', teacherId);

      // Insert new availability data with proper typing
      const availabilityData: Database['public']['Tables']['teacher_availability']['Insert'][] = availability.map(slot => ({
        teacher_id: teacherId,
        day_of_week: slot.day_of_week,
        start_period: slot.start_period,
        end_period: slot.end_period,
        is_available: slot.is_available
      }));

      const { error } = await supabase
        .from('teacher_availability')
        .insert(availabilityData);

      if (error) throw error;

      toast.success('Teacher availability saved successfully');
      setOpen(false);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save teacher availability');
    } finally {
      setSaving(false);
    }
  };

  const getSlotAvailability = (day: DayOfWeek, period: number) => {
    return availability.find(
      slot => slot.day_of_week === day && slot.start_period === period
    )?.is_available ?? true;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Teacher Availability
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Availability for {teacherName}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Click on periods to mark teacher as unavailable (red = unavailable, green = available)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-50">Period</th>
                      {days.map(day => (
                        <th key={day} className="border p-2 bg-gray-50 capitalize">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map(period => (
                      <tr key={period}>
                        <td className="border p-2 font-medium bg-gray-50">
                          Period {period}
                        </td>
                        {days.map(day => {
                          const isAvailable = getSlotAvailability(day, period);
                          return (
                            <td key={`${day}-${period}`} className="border p-1">
                              <button
                                onClick={() => toggleAvailability(day, period)}
                                className={`w-full h-12 rounded flex items-center justify-center transition-colors ${
                                  isAvailable 
                                    ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                                }`}
                              >
                                {isAvailable ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <X className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveAvailability} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Availability'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TeacherAvailability;
