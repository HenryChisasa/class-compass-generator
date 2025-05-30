
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import SchoolProfileStep from './workflow/SchoolProfileStep';
import PeriodsAndDaysStep from './workflow/PeriodsAndDaysStep';
import TeachersStep from './workflow/TeachersStep';
import SubjectsStep from './workflow/SubjectsStep';
import ClassesStep from './workflow/ClassesStep';
import ClassroomsStep from './workflow/ClassroomsStep';
import ConstraintsStep from './workflow/ConstraintsStep';
import GenerateStep from './workflow/GenerateStep';
import ReviewStep from './workflow/ReviewStep';
import PublishStep from './workflow/PublishStep';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

const TimetableWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 1, title: 'School Profile', description: 'Set up your school information', completed: false },
    { id: 2, title: 'Periods & Days', description: 'Define your school day structure', completed: false },
    { id: 3, title: 'Add Teachers', description: 'Input teaching staff details', completed: false },
    { id: 4, title: 'Input Subjects', description: 'List all subjects and courses', completed: false },
    { id: 5, title: 'Create Classes', description: 'Organize student groups', completed: false },
    { id: 6, title: 'Allocate Classrooms', description: 'Add classroom details', completed: false, optional: true },
    { id: 7, title: 'Set Constraints', description: 'Configure preferences', completed: false },
    { id: 8, title: 'Generate Timetable', description: 'Create your optimized timetable', completed: false },
    { id: 9, title: 'Review & Adjust', description: 'Review and make adjustments', completed: false },
    { id: 10, title: 'Publish & Share', description: 'Export and share your timetable', completed: false }
  ]);

  const markStepCompleted = (stepId: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const goToNextStep = () => {
    if (currentStep < 10) {
      markStepCompleted(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <SchoolProfileStep onNext={goToNextStep} />;
      case 2: return <PeriodsAndDaysStep onNext={goToNextStep} onPrevious={goToPreviousStep} />;
      case 3: return <TeachersStep onNext={goToNextStep} onPrevious={goToPreviousStep} />;
      case 4: return <SubjectsStep onNext={goToNextStep} onPrevious={goToPreviousStep} />;
      case 5: return <ClassesStep onNext={goToNextStep} onPrevious={goToPreviousStep} />;
      case 6: return <ClassroomsStep onNext={goToNextStep} onPrevious={goToPreviousStep} />;
      case 7: return <ConstraintsStep onNext={goToNextStep} onPrevious={goToPreviousStep} />;
      case 8: return <GenerateStep onNext={goToNextStep} onPrevious={goToPreviousStep} />;
      case 9: return <ReviewStep onNext={goToNextStep} onPrevious={goToPreviousStep} />;
      case 10: return <PublishStep onPrevious={goToPreviousStep} />;
      default: return null;
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Timetable
          </h1>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{completedSteps} steps completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                      step.id === currentStep
                        ? 'bg-blue-50 border border-blue-200'
                        : step.completed
                        ? 'bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => goToStep(step.id)}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className={`w-5 h-5 ${
                        step.id === currentStep ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        step.id === currentStep ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {step.title}
                        {step.optional && (
                          <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableWorkflow;
