
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ConstraintsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const ConstraintsStep: React.FC<ConstraintsStepProps> = ({ onNext, onPrevious }) => {
  const [constraints, setConstraints] = useState({
    no_back_to_back_same_subject: true,
    prefer_morning_for_core_subjects: true,
    avoid_single_period_gaps: true,
    respect_teacher_availability: true,
    balance_subjects_across_week: true,
    avoid_consecutive_difficult_subjects: false,
    lunch_break_required: true,
    max_consecutive_periods: 3
  });

  const handleConstraintChange = (key: string, value: boolean) => {
    setConstraints(prev => ({ ...prev, [key]: value }));
  };

  const saveConstraints = () => {
    // Save constraints to localStorage for now
    localStorage.setItem('timetable_constraints', JSON.stringify(constraints));
    toast.success('Constraints and preferences saved');
    onNext();
  };

  const constraintsList = [
    {
      key: 'no_back_to_back_same_subject',
      label: 'Avoid back-to-back periods of the same subject',
      description: 'Prevents scheduling the same subject in consecutive periods'
    },
    {
      key: 'prefer_morning_for_core_subjects',
      label: 'Schedule core subjects in morning periods',
      description: 'Places important subjects like Math and English early in the day'
    },
    {
      key: 'avoid_single_period_gaps',
      label: 'Minimize single-period gaps for teachers',
      description: 'Reduces isolated free periods in teacher schedules'
    },
    {
      key: 'respect_teacher_availability',
      label: 'Respect teacher availability preferences',
      description: 'Only schedule teachers during their available times'
    },
    {
      key: 'balance_subjects_across_week',
      label: 'Balance subjects across the week',
      description: 'Distribute subject periods evenly throughout the week'
    },
    {
      key: 'avoid_consecutive_difficult_subjects',
      label: 'Avoid consecutive difficult subjects',
      description: 'Prevents scheduling challenging subjects back-to-back'
    },
    {
      key: 'lunch_break_required',
      label: 'Ensure lunch break is scheduled',
      description: 'Guarantees a lunch period in every day'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>Step 7: Set Up Constraints and Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Configure your timetable generation preferences. These settings will help create a more optimized schedule.
          </p>
          
          {constraintsList.map((constraint) => (
            <div key={constraint.key} className="flex items-start space-x-3 p-3 border rounded">
              <Checkbox
                id={constraint.key}
                checked={constraints[constraint.key as keyof typeof constraints] as boolean}
                onCheckedChange={(checked) => handleConstraintChange(constraint.key, checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor={constraint.key} className="text-sm font-medium">
                  {constraint.label}
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  {constraint.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Tip</h4>
          <p className="text-sm text-blue-700">
            Teacher availability settings from Step 3 will be automatically respected during timetable generation.
            You can modify individual teacher availability anytime from the Teachers page.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={saveConstraints}>
            Save & Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConstraintsStep;
