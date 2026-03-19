import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Building2, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSearch = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedType) params.append('type', selectedType);
    navigate(`/listings?${params.toString()}`);
  };

  const propertyTypes = [
    { value: 'room', label: 'Rooms', icon: Home },
    { value: 'house', label: 'Houses', icon: Building2 },
    { value: 'lodge', label: 'Lodges', icon: Mountain }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto" data-testid="hero-search">
      <Card className="p-6 shadow-2xl bg-white/95 backdrop-blur-sm border-0">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#E07A5F]" />
              <Input
                type="text"
                placeholder="Search by location, city, or property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-[#e5e2de] focus:border-[#E07A5F] focus:ring-[#E07A5F]/20"
                data-testid="hero-search-input"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-[#E07A5F] to-[#D4A574] hover:from-[#d16a50] hover:to-[#c49565] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              data-testid="hero-search-button"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-sm text-[#64748b] mb-3">Quick search by type:</p>
          <div className="flex flex-wrap gap-3">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    setSelectedType(type.value);
                    navigate(`/listings?type=${type.value}`);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: selectedType === type.value ? '#E07A5F' : '#e5e2de',
                    backgroundColor: selectedType === type.value ? '#FEF2F0' : 'white',
                    color: selectedType === type.value ? '#E07A5F' : '#64748b'
                  }}
                  data-testid={`quick-search-${type.value}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
