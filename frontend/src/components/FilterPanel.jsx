import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Home } from 'lucide-react';

export const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const handlePriceChange = (value) => {
    setPriceRange(value);
    onFilterChange({ ...filters, minPrice: value[0], maxPrice: value[1] });
  };

  const handleTypeToggle = (type) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFilterChange({ ...filters, types: newTypes });
  };

  const handleDurationChange = (duration) => {
    onFilterChange({ ...filters, duration });
  };

  const handleModeChange = (mode) => {
    onFilterChange({ ...filters, mode });
  };

  const handleAvailabilityChange = (availability) => {
    onFilterChange({ ...filters, availability });
  };

  return (
    <Card className="bg-card" data-testid="filter-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Availability Status Filter */}
        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground flex items-center gap-2">
            <Home className="h-4 w-4 text-secondary" />
            Availability Status
          </Label>
          <RadioGroup 
            value={filters.availability || 'all'} 
            onValueChange={handleAvailabilityChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="availability-all" data-testid="availability-filter-all" />
              <Label htmlFor="availability-all" className="cursor-pointer text-foreground">All Properties</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="available" id="availability-available" data-testid="availability-filter-available" />
              <Label htmlFor="availability-available" className="cursor-pointer flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                Available Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rented" id="availability-rented" data-testid="availability-filter-rented" />
              <Label htmlFor="availability-rented" className="cursor-pointer flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                Rented Only
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground">
            Rental Mode
          </Label>
          <RadioGroup value={filters.mode} onValueChange={handleModeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="mode-all" data-testid="mode-filter-all" />
              <Label htmlFor="mode-all" className="cursor-pointer text-foreground">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rent" id="mode-rent" data-testid="mode-filter-rent" />
              <Label htmlFor="mode-rent" className="cursor-pointer text-foreground">Want to Rent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="give" id="mode-give" data-testid="mode-filter-give" />
              <Label htmlFor="mode-give" className="cursor-pointer text-foreground">Give on Rent</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground">
            Property Type
          </Label>
          <div className="space-y-2">
            {['room', 'house', 'lodge', 'pg', 'hostel', 'apartment', 'villa', 'cottage', 'farmhouse', 'studio'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.types.includes(type)}
                  onCheckedChange={() => handleTypeToggle(type)}
                  data-testid={`type-filter-${type}`}
                />
                <Label htmlFor={`type-${type}`} className="cursor-pointer capitalize text-foreground">{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground">
            Duration
          </Label>
          <RadioGroup value={filters.duration} onValueChange={handleDurationChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="duration-all" data-testid="duration-filter-all" />
              <Label htmlFor="duration-all" className="cursor-pointer text-foreground">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="night" id="duration-night" data-testid="duration-filter-night" />
              <Label htmlFor="duration-night" className="cursor-pointer text-foreground">Per Night</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="day" id="duration-day" data-testid="duration-filter-day" />
              <Label htmlFor="duration-day" className="cursor-pointer text-foreground">Per Day</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="week" id="duration-week" data-testid="duration-filter-week" />
              <Label htmlFor="duration-week" className="cursor-pointer text-foreground">Per Week</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="month" id="duration-month" data-testid="duration-filter-month" />
              <Label htmlFor="duration-month" className="cursor-pointer text-foreground">Per Month</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-3 block text-foreground">
            Price Range: ₹ {priceRange[0].toLocaleString('en-IN')} - ₹ {priceRange[1].toLocaleString('en-IN')}
          </Label>
          <Slider
            min={0}
            max={50000}
            step={1000}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="mt-2"
            data-testid="price-range-slider"
          />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={onReset}
          data-testid="reset-filters-button"
        >
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
};
