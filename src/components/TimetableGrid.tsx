
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimetableSlot {
  day_of_week: string;
  period: number;
  subject_name?: string;
  subject_color?: string;
  class_name?: string;
  teacher_name?: string;
  classroom_name?: string;
}

interface TimetableGridProps {
  slots: TimetableSlot[];
  periodsPerDay: number;
  title?: string;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  slots, 
  periodsPerDay, 
  title = "Timetable" 
}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const periods = Array.from({ length: periodsPerDay }, (_, i) => i + 1);

  const getSlotForPeriod = (day: string, period: number) => {
    return slots.find(slot => 
      slot.day_of_week === day && slot.period === period
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50 text-sm font-medium">Period</th>
                {days.map(day => (
                  <th key={day} className="border p-2 bg-gray-50 text-sm font-medium capitalize">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period}>
                  <td className="border p-2 bg-gray-50 text-sm font-medium">
                    {period}
                  </td>
                  {days.map(day => {
                    const slot = getSlotForPeriod(day, period);
                    return (
                      <td key={`${day}-${period}`} className="border p-1">
                        {slot ? (
                          <div 
                            className="rounded p-2 text-xs text-white min-h-[60px] flex flex-col justify-center"
                            style={{ 
                              backgroundColor: slot.subject_color || '#3B82F6' 
                            }}
                          >
                            <div className="font-medium truncate">
                              {slot.subject_name}
                            </div>
                            <div className="truncate opacity-90">
                              {slot.class_name}
                            </div>
                            <div className="truncate opacity-75 text-xs">
                              {slot.teacher_name}
                            </div>
                            {slot.classroom_name && (
                              <div className="truncate opacity-75 text-xs">
                                {slot.classroom_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="min-h-[60px] bg-gray-50"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimetableGrid;
