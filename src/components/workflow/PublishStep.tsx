
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Share, CheckCircle, FileText, Table } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PublishStepProps {
  onPrevious: () => void;
}

const PublishStep: React.FC<PublishStepProps> = ({ onPrevious }) => {
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  const exportToPDF = async () => {
    setExporting(true);
    try {
      // Simulate PDF export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Timetable exported to PDF successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Simulate Excel export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Timetable exported to Excel successfully');
    } catch (error) {
      toast.error('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  const shareOnline = () => {
    // Simulate sharing functionality
    navigator.clipboard.writeText(`${window.location.origin}/timetable/shared/123456`);
    toast.success('Shareable link copied to clipboard');
  };

  const finishWorkflow = () => {
    toast.success('Timetable creation completed successfully!');
    navigate('/dashboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share className="w-6 h-6 text-blue-600" />
          <span>Step 10: Publish and Share</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Congratulations! Your Timetable is Ready
          </h3>
          <p className="text-green-700">
            Your school timetable has been successfully generated and is ready to be shared with your team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-6 h-6 text-red-600" />
              <h4 className="font-medium">Export as PDF</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Download a professional PDF version perfect for printing and sharing.
            </p>
            <Button 
              onClick={exportToPDF} 
              disabled={exporting}
              variant="outline" 
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Download PDF'}
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Table className="w-6 h-6 text-green-600" />
              <h4 className="font-medium">Export as Excel</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Download an Excel spreadsheet for further customization and analysis.
            </p>
            <Button 
              onClick={exportToExcel} 
              disabled={exporting}
              variant="outline" 
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Download Excel'}
            </Button>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Share className="w-6 h-6 text-blue-600" />
            <h4 className="font-medium">Share Online</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Generate a shareable link to view the timetable online. Perfect for teachers and administrators.
          </p>
          <Button onClick={shareOnline} variant="outline" className="w-full">
            <Share className="w-4 h-4 mr-2" />
            Copy Shareable Link
          </Button>
        </Card>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your timetable is automatically saved and can be accessed from the dashboard</li>
            <li>• You can make changes anytime by editing individual components</li>
            <li>• Share the timetable with your teaching staff and administration</li>
            <li>• Consider creating different timetables for different terms/semesters</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={finishWorkflow} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Finish & Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishStep;
