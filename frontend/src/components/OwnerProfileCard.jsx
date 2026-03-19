import { Shield, Clock, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const OwnerProfileCard = ({ owner }) => {
  return (
    <Card data-testid="owner-profile-card">
      <CardHeader>
        <CardTitle className="text-lg" style={{ color: '#1F2937' }}>
          Property Owner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={owner.avatar}
              alt={owner.name}
              className="w-16 h-16 rounded-full object-cover"
              data-testid="owner-avatar"
            />
            {owner.verified && (
              <div 
                className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md"
                title="Verified Owner"
              >
                <Shield 
                  className="h-5 w-5" 
                  style={{ color: '#10B981' }} 
                  data-testid="verified-badge"
                />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg" style={{ color: '#1F2937' }} data-testid="owner-name">
              {owner.name}
            </h3>
            {owner.verified && (
              <Badge 
                className="mt-1" 
                style={{ backgroundColor: '#10B981', color: 'white' }}
                data-testid="verified-label"
              >
                <Shield className="h-3 w-3 mr-1" />
                Verified Owner
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>Usually responds in <strong>{owner.responseTime}</strong></span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Member since <strong>{new Date(owner.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong></span>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            className="w-full" 
            size="lg" 
            style={{ backgroundColor: '#2563EB', color: 'white' }}
            data-testid="contact-owner-button"
          >
            Contact Owner
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            data-testid="schedule-visit-button"
          >
            Schedule Visit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
