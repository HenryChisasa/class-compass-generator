
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, School } from 'lucide-react';
import { toast } from 'sonner';

interface SchoolProfileStepProps {
  onNext: () => void;
}

const SchoolProfileStep: React.FC<SchoolProfileStepProps> = ({ onNext }) => {
  const [schoolData, setSchoolData] = useState({
    name: '',
    academic_year: new Date().getFullYear().toString(),
    term_start_date: '',
    term_end_date: '',
    contact_email: '',
    contact_phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [schoolExists, setSchoolExists] = useState(false);

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single();

      if (profile?.school_id) {
        const { data: school } = await supabase
          .from('schools')
          .select('*')
          .eq('id', profile.school_id)
          .single();

        if (school) {
          setSchoolData({
            name: school.name || '',
            academic_year: new Date().getFullYear().toString(),
            term_start_date: '',
            term_end_date: '',
            contact_email: school.contact_email || '',
            contact_phone: school.contact_phone || '',
            address: school.address || ''
          });
          setSchoolExists(true);
        }
      }
    } catch (error) {
      console.error('Error fetching school data:', error);
    }
  };

  const handleSave = async () => {
    if (!schoolData.name) {
      toast.error('Please enter the school name');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single();

      if (profile?.school_id && schoolExists) {
        // Update existing school
        const { error } = await supabase
          .from('schools')
          .update({
            name: schoolData.name,
            contact_email: schoolData.contact_email,
            contact_phone: schoolData.contact_phone,
            address: schoolData.address
          })
          .eq('id', profile.school_id);

        if (error) throw error;
      } else {
        // Create new school
        const { data: newSchool, error: schoolError } = await supabase
          .from('schools')
          .insert([{
            name: schoolData.name,
            contact_email: schoolData.contact_email,
            contact_phone: schoolData.contact_phone,
            address: schoolData.address
          }])
          .select()
          .single();

        if (schoolError) throw schoolError;

        // Update profile with school_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ school_id: newSchool.id })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      toast.success('School profile saved successfully');
      onNext();
    } catch (error) {
      console.error('Error saving school profile:', error);
      toast.error('Failed to save school profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <School className="w-6 h-6 text-blue-600" />
          <span>Step 1: Set Up Your School Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="school_name">School Name *</Label>
            <Input
              id="school_name"
              value={schoolData.name}
              onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
              placeholder="Enter your school's official name"
              required
            />
          </div>
          <div>
            <Label htmlFor="academic_year">Academic Year *</Label>
            <Input
              id="academic_year"
              value={schoolData.academic_year}
              onChange={(e) => setSchoolData({ ...schoolData, academic_year: e.target.value })}
              placeholder="e.g., 2024"
              required
            />
          </div>
          <div>
            <Label htmlFor="term_start">Term Start Date</Label>
            <Input
              id="term_start"
              type="date"
              value={schoolData.term_start_date}
              onChange={(e) => setSchoolData({ ...schoolData, term_start_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="term_end">Term End Date</Label>
            <Input
              id="term_end"
              type="date"
              value={schoolData.term_end_date}
              onChange={(e) => setSchoolData({ ...schoolData, term_end_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={schoolData.contact_email}
              onChange={(e) => setSchoolData({ ...schoolData, contact_email: e.target.value })}
              placeholder="school@example.com"
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={schoolData.contact_phone}
              onChange={(e) => setSchoolData({ ...schoolData, contact_phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="address">School Address</Label>
          <Input
            id="address"
            value={schoolData.address}
            onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
            placeholder="Enter your school's full address"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolProfileStep;
