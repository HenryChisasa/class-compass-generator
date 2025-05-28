
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building, Plus } from 'lucide-react';

interface School {
  id: string;
  name: string;
  address: string;
  contact_email: string;
}

interface SchoolSelectionProps {
  userId: string;
  onSchoolSelected: () => void;
}

const SchoolSelection: React.FC<SchoolSelectionProps> = ({ userId, onSchoolSelected }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    address: '',
    contact_email: '',
    contact_phone: ''
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, address, contact_email')
        .order('name');
      
      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to fetch schools');
    }
  };

  const handleSelectExistingSchool = async () => {
    if (!selectedSchoolId) {
      toast.error('Please select a school');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ school_id: selectedSchoolId })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('School selected successfully');
      onSchoolSelected();
    } catch (error) {
      console.error('Error selecting school:', error);
      toast.error('Failed to select school');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewSchool = async () => {
    if (!newSchool.name.trim()) {
      toast.error('School name is required');
      return;
    }

    setLoading(true);
    try {
      // Create new school
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert([{
          name: newSchool.name,
          address: newSchool.address,
          contact_email: newSchool.contact_email,
          contact_phone: newSchool.contact_phone
        }])
        .select('id')
        .single();

      if (schoolError) throw schoolError;

      // Assign user to the new school
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ school_id: schoolData.id })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast.success('School created and assigned successfully');
      onSchoolSelected();
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to create school');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-primary-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your School</h1>
          <p className="text-gray-600">Choose an existing school or create a new one</p>
        </div>

        {!showCreateForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Select Existing School</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="school">Choose a school</Label>
                <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school..." />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSelectExistingSchool} 
                  disabled={loading || !selectedSchoolId}
                  className="flex-1"
                >
                  {loading ? 'Selecting...' : 'Select School'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(true)}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create New School</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  placeholder="Enter school name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newSchool.address}
                  onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                  placeholder="Enter school address"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSchool.contact_email}
                  onChange={(e) => setNewSchool({ ...newSchool, contact_email: e.target.value })}
                  placeholder="Enter contact email"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={newSchool.contact_phone}
                  onChange={(e) => setNewSchool({ ...newSchool, contact_phone: e.target.value })}
                  placeholder="Enter contact phone"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleCreateNewSchool} 
                  disabled={loading || !newSchool.name.trim()}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create School'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SchoolSelection;
