
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, BookOpen, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SubjectsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface Subject {
  id?: string;
  name: string;
  code: string;
  color: string;
  grade_levels: string;
  periods_per_week: number;
  description: string;
}

const SubjectsStep: React.FC<SubjectsStepProps> = ({ onNext, onPrevious }) => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: '', code: '', color: '#3B82F6', grade_levels: '', periods_per_week: 1, description: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const subjectColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchExistingSubjects();
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

  const fetchExistingSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSubjects(data.map(subject => ({
          ...subject,
          grade_levels: '', // This would need additional logic
          periods_per_week: 1 // Default value
        })));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const addSubjectRow = () => {
    const randomColor = subjectColors[Math.floor(Math.random() * subjectColors.length)];
    setSubjects([...subjects, { 
      name: '', 
      code: '', 
      color: randomColor, 
      grade_levels: '', 
      periods_per_week: 1, 
      description: '' 
    }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
    const updated = subjects.map((subject, i) => 
      i === index ? { ...subject, [field]: value } : subject
    );
    setSubjects(updated);
  };

  const saveSubjects = async () => {
    if (!profile?.school_id) {
      toast.error('No school ID found');
      return;
    }

    const validSubjects = subjects.filter(subject => subject.name.trim());
    if (validSubjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    setLoading(true);
    try {
      // Delete existing subjects for this school
      await supabase
        .from('subjects')
        .delete()
        .eq('school_id', profile.school_id);

      // Insert new subjects
      const subjectsToInsert = validSubjects.map(subject => ({
        name: subject.name,
        code: subject.code,
        color: subject.color,
        description: subject.description,
        school_id: profile.school_id
      }));

      const { error } = await supabase
        .from('subjects')
        .insert(subjectsToInsert);

      if (error) throw error;

      toast.success(`${validSubjects.length} subjects saved successfully`);
      onNext();
    } catch (error) {
      console.error('Error saving subjects:', error);
      toast.error('Failed to save subjects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>Step 4: Input Subjects</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {subjects.map((subject, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Subject {index + 1}</h4>
                {subjects.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSubject(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`subject_name_${index}`}>Subject Name *</Label>
                  <Input
                    id={`subject_name_${index}`}
                    value={subject.name}
                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <Label htmlFor={`subject_code_${index}`}>Subject Code</Label>
                  <Input
                    id={`subject_code_${index}`}
                    value={subject.code}
                    onChange={(e) => updateSubject(index, 'code', e.target.value)}
                    placeholder="e.g., MATH"
                  />
                </div>
                <div>
                  <Label htmlFor={`subject_color_${index}`}>Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id={`subject_color_${index}`}
                      type="color"
                      value={subject.color}
                      onChange={(e) => updateSubject(index, 'color', e.target.value)}
                      className="w-16"
                    />
                    <div className="flex space-x-1">
                      {subjectColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 rounded border-2 border-gray-300"
                          style={{ backgroundColor: color }}
                          onClick={() => updateSubject(index, 'color', color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`grade_levels_${index}`}>Grade Levels</Label>
                  <Input
                    id={`grade_levels_${index}`}
                    value={subject.grade_levels}
                    onChange={(e) => updateSubject(index, 'grade_levels', e.target.value)}
                    placeholder="e.g., 7, 8, 9"
                  />
                </div>
                <div>
                  <Label htmlFor={`periods_per_week_${index}`}>Periods per Week</Label>
                  <Input
                    id={`periods_per_week_${index}`}
                    type="number"
                    min="1"
                    max="20"
                    value={subject.periods_per_week}
                    onChange={(e) => updateSubject(index, 'periods_per_week', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor={`description_${index}`}>Description</Label>
                  <Input
                    id={`description_${index}`}
                    value={subject.description}
                    onChange={(e) => updateSubject(index, 'description', e.target.value)}
                    placeholder="Brief description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addSubjectRow} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Subject
        </Button>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={saveSubjects} disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectsStep;
