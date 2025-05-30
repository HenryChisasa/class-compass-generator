
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClassroomsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface Classroom {
  id?: string;
  name: string;
  room_type: string;
  capacity: number;
  equipment: string[];
}

const ClassroomsStep: React.FC<ClassroomsStepProps> = ({ onNext, onPrevious }) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    { name: '', room_type: 'classroom', capacity: 0, equipment: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const roomTypes = [
    'classroom', 'laboratory', 'computer_lab', 'art_room', 'music_room', 
    'gymnasium', 'library', 'auditorium', 'cafeteria', 'workshop'
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchExistingClassrooms();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchExistingClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setClassrooms(data.map(classroom => ({
          ...classroom,
          equipment: classroom.equipment || []
        })));
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };

  const addClassroomRow = () => {
    setClassrooms([...classrooms, { name: '', room_type: 'classroom', capacity: 0, equipment: [] }]);
  };

  const removeClassroom = (index: number) => {
    if (classrooms.length > 1) {
      setClassrooms(classrooms.filter((_, i) => i !== index));
    }
  };

  const updateClassroom = (index: number, field: keyof Classroom, value: any) => {
    const updated = classrooms.map((classroom, i) => 
      i === index ? { ...classroom, [field]: value } : classroom
    );
    setClassrooms(updated);
  };

  const saveClassrooms = async () => {
    if (!profile?.school_id) {
      toast.error('No school ID found');
      return;
    }

    const validClassrooms = classrooms.filter(classroom => classroom.name.trim());

    setLoading(true);
    try {
      // Delete existing classrooms for this school
      await supabase
        .from('classrooms')
        .delete()
        .eq('school_id', profile.school_id);

      if (validClassrooms.length > 0) {
        // Insert new classrooms
        const classroomsToInsert = validClassrooms.map(classroom => ({
          name: classroom.name,
          room_type: classroom.room_type,
          capacity: classroom.capacity || 0,
          equipment: classroom.equipment,
          school_id: profile.school_id
        }));

        const { error } = await supabase
          .from('classrooms')
          .insert(classroomsToInsert);

        if (error) throw error;

        toast.success(`${validClassrooms.length} classrooms saved successfully`);
      } else {
        toast.success('Classroom step completed (optional)');
      }
      
      onNext();
    } catch (error) {
      console.error('Error saving classrooms:', error);
      toast.error('Failed to save classrooms');
    } finally {
      setLoading(false);
    }
  };

  const skipStep = () => {
    toast.info('Skipped classroom setup (optional step)');
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Step 6: Allocate Classrooms</span>
            <span className="text-sm text-gray-500 font-normal">(Optional)</span>
          </div>
          <Button variant="ghost" onClick={skipStep}>
            Skip This Step
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {classrooms.map((classroom, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Classroom {index + 1}</h4>
                {classrooms.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeClassroom(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`classroom_name_${index}`}>Room Name/Number</Label>
                  <Input
                    id={`classroom_name_${index}`}
                    value={classroom.name}
                    onChange={(e) => updateClassroom(index, 'name', e.target.value)}
                    placeholder="e.g., Room 101"
                  />
                </div>
                <div>
                  <Label htmlFor={`room_type_${index}`}>Room Type</Label>
                  <Select
                    value={classroom.room_type}
                    onValueChange={(value) => updateClassroom(index, 'room_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`capacity_${index}`}>Capacity</Label>
                  <Input
                    id={`capacity_${index}`}
                    type="number"
                    min="0"
                    value={classroom.capacity}
                    onChange={(e) => updateClassroom(index, 'capacity', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`equipment_${index}`}>Equipment Available</Label>
                <Input
                  id={`equipment_${index}`}
                  value={classroom.equipment.join(', ')}
                  onChange={(e) => updateClassroom(index, 'equipment', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
                  placeholder="e.g., Projector, Whiteboard, Computers"
                />
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addClassroomRow} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Classroom
        </Button>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={saveClassrooms} disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassroomsStep;
