
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClassesStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface ClassGroup {
  id?: string;
  name: string;
  grade_level: string;
  student_count: number;
}

const ClassesStep: React.FC<ClassesStepProps> = ({ onNext, onPrevious }) => {
  const [classes, setClasses] = useState<ClassGroup[]>([
    { name: '', grade_level: '', student_count: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchExistingClasses();
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

  const fetchExistingClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const addClassRow = () => {
    setClasses([...classes, { name: '', grade_level: '', student_count: 0 }]);
  };

  const removeClass = (index: number) => {
    if (classes.length > 1) {
      setClasses(classes.filter((_, i) => i !== index));
    }
  };

  const updateClass = (index: number, field: keyof ClassGroup, value: string | number) => {
    const updated = classes.map((classGroup, i) => 
      i === index ? { ...classGroup, [field]: value } : classGroup
    );
    setClasses(updated);
  };

  const saveClasses = async () => {
    if (!profile?.school_id) {
      toast.error('No school ID found');
      return;
    }

    const validClasses = classes.filter(classGroup => classGroup.name.trim());
    if (validClasses.length === 0) {
      toast.error('Please add at least one class');
      return;
    }

    setLoading(true);
    try {
      // Delete existing classes for this school
      await supabase
        .from('classes')
        .delete()
        .eq('school_id', profile.school_id);

      // Insert new classes
      const classesToInsert = validClasses.map(classGroup => ({
        name: classGroup.name,
        grade_level: classGroup.grade_level,
        student_count: classGroup.student_count || 0,
        school_id: profile.school_id
      }));

      const { error } = await supabase
        .from('classes')
        .insert(classesToInsert);

      if (error) throw error;

      toast.success(`${validClasses.length} classes saved successfully`);
      onNext();
    } catch (error) {
      console.error('Error saving classes:', error);
      toast.error('Failed to save classes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <span>Step 5: Create Classes or Groups</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {classes.map((classGroup, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Class {index + 1}</h4>
                {classes.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeClass(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`class_name_${index}`}>Class Name *</Label>
                  <Input
                    id={`class_name_${index}`}
                    value={classGroup.name}
                    onChange={(e) => updateClass(index, 'name', e.target.value)}
                    placeholder="e.g., Grade 7A"
                  />
                </div>
                <div>
                  <Label htmlFor={`grade_level_${index}`}>Grade Level</Label>
                  <Input
                    id={`grade_level_${index}`}
                    value={classGroup.grade_level}
                    onChange={(e) => updateClass(index, 'grade_level', e.target.value)}
                    placeholder="e.g., 7"
                  />
                </div>
                <div>
                  <Label htmlFor={`student_count_${index}`}>Number of Students</Label>
                  <Input
                    id={`student_count_${index}`}
                    type="number"
                    min="0"
                    value={classGroup.student_count}
                    onChange={(e) => updateClass(index, 'student_count', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addClassRow} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Class
        </Button>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={saveClasses} disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassesStep;
