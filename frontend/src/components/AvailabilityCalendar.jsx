import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AvailabilityCalendar = ({ availability }) => {
  const isAvailableNow = availability.availableFrom === 'immediate';
  
  return (
    <Card data-testid="availability-calendar">
      <CardHeader>
        <CardTitle className="flex items-center text-lg" style={{ color: '#1F2937' }}>
          <Calendar className="h-5 w-5 mr-2" style={{ color: '#2563EB' }} />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge 
              style={{ 
                backgroundColor: isAvailableNow ? '#10B981' : '#F59E0B',
                color: 'white' 
              }}
              data-testid="availability-status"
            >
              {isAvailableNow ? 'Available Now' : 'Available Soon'}
            </Badge>
          </div>

          {!isAvailableNow && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available from:</span>
              <span className="font-semibold" style={{ color: '#1F2937' }} data-testid="available-from">
                {new Date(availability.availableFrom).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Minimum stay:</span>
            <span className="font-semibold" style={{ color: '#1F2937' }} data-testid="min-stay">
              {availability.minStay}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Maximum stay:</span>
            <span className="font-semibold" style={{ color: '#1F2937' }} data-testid="max-stay">
              {availability.maxStay}
            </span>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">Interactive calendar</p>
              <p className="text-xs text-gray-400 italic">Calendar integration placeholder</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
