
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PeriodsAndDaysStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface Period {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_break?: boolean;
}

const PeriodsAndDaysStep: React.FC<PeriodsAndDaysStepProps> = ({ onNext, onPrevious }) => {
  const [periodsPerDay, setPeriodsPerDay] = useState(8);
  const [periods, setPeriods] = useState<Period[]>([
    { id: '1', name: 'Period 1', start_time: '08:00', end_time: '08:45' },
    { id: '2', name: 'Period 2', start_time: '08:45', end_time: '09:30' },
    { id: '3', name: 'Break', start_time: '09:30', end_time: '09:45', is_break: true },
    { id: '4', name: 'Period 3', start_time: '09:45', end_time: '10:30' },
    { id: '5', name: 'Period 4', start_time: '10:30', end_time: '11:15' },
    { id: '6', name: 'Lunch', start_time: '11:15', end_time: '12:00', is_break: true },
    { id: '7', name: 'Period 5', start_time: '12:00', end_time: '12:45' },
    { id: '8', name: 'Period 6', start_time: '12:45', end_time: '13:30' }
  ]);
  
  const [activeDays, setActiveDays] = useState([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
  ]);

  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  const addPeriod = () => {
    const newPeriod: Period = {
      id: Date.now().toString(),
      name: `Period ${periods.filter(p => !p.is_break).length + 1}`,
      start_time: '',
      end_time: ''
    };
    setPeriods([...periods, newPeriod]);
  };

  const removePeriod = (id: string) => {
    setPeriods(periods.filter(p => p.id !== id));
  };

  const updatePeriod = (id: string, field: keyof Period, value: string | boolean) => {
    setPeriods(periods.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const toggleDay = (dayId: string) => {
    if (activeDays.includes(dayId)) {
      setActiveDays(activeDays.filter(d => d !== dayId));
    } else {
      setActiveDays([...activeDays, dayId]);
    }
  };

  const handleSave = () => {
    if (activeDays.length === 0) {
      toast.error('Please select at least one day of the week');
      return;
    }

    const invalidPeriods = periods.filter(p => !p.start_time || !p.end_time);
    if (invalidPeriods.length > 0) {
      toast.error('Please set start and end times for all periods');
      return;
    }

    // Save to localStorage for now (in a real app, save to database)
    localStorage.setItem('school_periods', JSON.stringify(periods));
    localStorage.setItem('school_days', JSON.stringify(activeDays));
    localStorage.setItem('periods_per_day', periodsPerDay.toString());

    toast.success('Period structure saved successfully');
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-6 h-6 text-blue-600" />
          <span>Step 2: Define Periods and Days</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Number of Periods */}
        <div>
          <Label htmlFor="periods_count">Number of Teaching Periods per Day</Label>
          <Input
            id="periods_count"
            type="number"
            min="1"
            max="12"
            value={periodsPerDay}
            onChange={(e) => setPeriodsPerDay(parseInt(e.target.value) || 8)}
            className="w-32"
          />
        </div>

        {/* Days of Week */}
        <div>
          <Label className="text-base font-medium mb-3 block">School Operating Days</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {daysOfWeek.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Checkbox
                  id={day.id}
                  checked={activeDays.includes(day.id)}
                  onCheckedChange={() => toggleDay(day.id)}
                />
                <Label htmlFor={day.id} className="text-sm">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Period Timings */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-base font-medium">Period Timings</Label>
            <Button variant="outline" size="sm" onClick={addPeriod}>
              <Plus className="w-4 h-4 mr-2" />
              Add Period
            </Button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {periods.map((period, index) => (
              <div key={period.id} className="grid grid-cols-12 gap-3 items-center p-3 border rounded">
                <div className="col-span-4">
                  <Input
                    placeholder="Period name"
                    value={period.name}
                    onChange={(e) => updatePeriod(period.id, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="time"
                    value={period.start_time}
                    onChange={(e) => updatePeriod(period.id, 'start_time', e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="time"
                    value={period.end_time}
                    onChange={(e) => updatePeriod(period.id, 'end_time', e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={period.is_break || false}
                    onCheckedChange={(checked) => updatePeriod(period.id, 'is_break', checked)}
                    title="Is this a break/lunch period?"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePeriod(period.id)}
                    disabled={periods.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Check the box if the period is a break or lunch period
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleSave}>
            Save & Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodsAndDaysStep;
