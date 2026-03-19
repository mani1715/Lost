import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const MapPreview = ({ coordinates, location }) => {
  return (
    <Card data-testid="map-preview">
      <CardHeader>
        <CardTitle className="flex items-center text-lg" style={{ color: '#1F2937' }}>
          <MapPin className="h-5 w-5 mr-2" style={{ color: '#2563EB' }} />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <MapPin className="h-12 w-12 mx-auto" style={{ color: '#2563EB' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>{location}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}
                </p>
              </div>
              <p className="text-xs text-gray-400 italic">
                Google Maps Preview (API integration placeholder)
              </p>
            </div>
          </div>
          
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
