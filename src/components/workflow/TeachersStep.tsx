
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Users, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TeacherAvailability from '@/components/TeacherAvailability';

interface TeachersStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface Teacher {
  id?: string;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  subjects: string;
}

const TeachersStep: React.FC<TeachersStepProps> = ({ onNext, onPrevious }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { name: '', email: '', phone: '', employee_id: '', subjects: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchExistingTeachers();
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

  const fetchExistingTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTeachers(data.map(teacher => ({
          ...teacher,
          subjects: '' // This would need to be fetched from a teacher_subjects table
        })));
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const addTeacherRow = () => {
    setTeachers([...teachers, { name: '', email: '', phone: '', employee_id: '', subjects: '' }]);
  };

  const removeTeacher = (index: number) => {
    if (teachers.length > 1) {
      setTeachers(teachers.filter((_, i) => i !== index));
    }
  };

  const updateTeacher = (index: number, field: keyof Teacher, value: string) => {
    const updated = teachers.map((teacher, i) => 
      i === index ? { ...teacher, [field]: value } : teacher
    );
    setTeachers(updated);
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 267, return as is with +
    if (cleaned.startsWith('267')) {
      return `+${cleaned}`;
    }
    
    // If it's a local number (8 digits), add +267
    if (cleaned.length === 8) {
      return `+267${cleaned}`;
    }
    
    // If it already has country code but no +, add it
    if (cleaned.length > 8 && !phone.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return phone;
  };

  const saveTeachers = async () => {
    if (!profile?.school_id) {
      toast.error('No school ID found');
      return;
    }

    const validTeachers = teachers.filter(teacher => teacher.name.trim());
    if (validTeachers.length === 0) {
      toast.error('Please add at least one teacher');
      return;
    }

    setLoading(true);
    try {
      // Delete existing teachers for this school
      await supabase
        .from('teachers')
        .delete()
        .eq('school_id', profile.school_id);

      // Insert new teachers
      const teachersToInsert = validTeachers.map(teacher => ({
        name: teacher.name,
        email: teacher.email,
        phone: formatPhoneNumber(teacher.phone),
        employee_id: teacher.employee_id,
        school_id: profile.school_id
      }));

      const { data: insertedTeachers, error } = await supabase
        .from('teachers')
        .insert(teachersToInsert)
        .select();

      if (error) throw error;

      // Save WhatsApp numbers for teachers with phone numbers
      if (insertedTeachers) {
        const whatsappNumbers = insertedTeachers
          .filter(teacher => teacher.phone)
          .map(teacher => ({
            teacher_id: teacher.id,
            number: teacher.phone
          }));

        if (whatsappNumbers.length > 0) {
          // Delete existing WhatsApp numbers for these teachers
          await supabase
            .from('whatsapp_numbers')
            .delete()
            .in('teacher_id', insertedTeachers.map(t => t.id));

          // Insert new WhatsApp numbers
          await supabase
            .from('whatsapp_numbers')
            .insert(whatsappNumbers);
        }
      }

      toast.success(`${validTeachers.length} teachers saved successfully`);
      onNext();
    } catch (error) {
      console.error('Error saving teachers:', error);
      toast.error('Failed to save teachers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-blue-600" />
          <span>Step 3: Add Teachers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {teachers.map((teacher, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Teacher {index + 1}</h4>
                {teachers.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTeacher(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`teacher_name_${index}`}>Full Name *</Label>
                  <Input
                    id={`teacher_name_${index}`}
                    value={teacher.name}
                    onChange={(e) => updateTeacher(index, 'name', e.target.value)}
                    placeholder="Enter teacher's full name"
                  />
                </div>
                <div>
                  <Label htmlFor={`teacher_employee_id_${index}`}>Employee ID</Label>
                  <Input
                    id={`teacher_employee_id_${index}`}
                    value={teacher.employee_id}
                    onChange={(e) => updateTeacher(index, 'employee_id', e.target.value)}
                    placeholder="e.g., EMP001"
                  />
                </div>
                <div>
                  <Label htmlFor={`teacher_email_${index}`}>Email</Label>
                  <Input
                    id={`teacher_email_${index}`}
                    type="email"
                    value={teacher.email}
                    onChange={(e) => updateTeacher(index, 'email', e.target.value)}
                    placeholder="teacher@school.com"
                  />
                </div>
                <div>
                  <Label htmlFor={`teacher_phone_${index}`}>Phone Number (WhatsApp)</Label>
                  <Input
                    id={`teacher_phone_${index}`}
                    value={teacher.phone}
                    onChange={(e) => updateTeacher(index, 'phone', e.target.value)}
                    placeholder="e.g., 71234567 or +26771234567"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will automatically add +267 for Botswana numbers
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor={`teacher_subjects_${index}`}>Subjects Taught</Label>
                <Input
                  id={`teacher_subjects_${index}`}
                  value={teacher.subjects}
                  onChange={(e) => updateTeacher(index, 'subjects', e.target.value)}
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>

              {teacher.id && profile?.school_id && (
                <div className="pt-2 border-t">
                  <TeacherAvailability
                    teacherId={teacher.id}
                    teacherName={teacher.name}
                    schoolId={profile.school_id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addTeacherRow} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Teacher
        </Button>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={saveTeachers} disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeachersStep;
