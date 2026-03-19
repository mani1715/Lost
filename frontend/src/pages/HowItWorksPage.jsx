import { Search, Home, CheckCircle, Shield, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: 'Search & Discover',
      description: 'Browse through our extensive collection of rooms, houses, and lodges. Use filters to find properties that match your needs perfectly.',
      details: [
        'Advanced search filters',
        'Detailed property information',
        'High-quality images',
        'Interactive maps'
      ]
    },
    {
      number: 2,
      icon: Home,
      title: 'Connect & Visit',
      description: 'Found something you like? Contact property owners directly, ask questions, and schedule visits to see the property in person.',
      details: [
        'Direct owner contact',
        'Quick response times',
        'Schedule property visits',
        'Ask questions anytime'
      ]
    },
    {
      number: 3,
      icon: CheckCircle,
      title: 'Book & Move In',
      description: 'Once you find your perfect space, complete the booking process and prepare to move in. It\'s that simple!',
      details: [
        'Secure booking process',
        'Clear rental terms',
        'Move-in support',
        'Ongoing assistance'
      ]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Properties',
      description: 'All our listings go through a verification process to ensure quality and authenticity.'
    },
    {
      icon: Star,
      title: 'Trusted Reviews',
      description: 'Read real reviews from previous tenants to make informed decisions.'
    },
    {
      icon: Clock,
      title: 'Quick Responses',
      description: 'Property owners respond quickly to inquiries, making your search efficient.'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#1F2937' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6" data-testid="how-it-works-title">
            How RENTEASE Works
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Find your perfect rental in three simple steps
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={step.number} 
                  className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
                  data-testid={`step-${step.number}`}
                >
                  <div className="flex-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#EFF6FF' }}>
                      <Icon className="h-8 w-8" style={{ color: '#2563EB' }} />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <span 
                        className="text-6xl font-bold" 
                        style={{ color: '#E5E7EB' }}
                      >
                        {step.number}
                      </span>
                      <h2 className="text-3xl font-bold" style={{ color: '#1F2937' }}>
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-lg text-gray-600 mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 mr-3" style={{ color: '#10B981' }} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex-1">
                    <Card className="overflow-hidden shadow-xl">
                      <div className="aspect-square bg-gray-200 flex items-center justify-center">
                        <Icon className="h-32 w-32" style={{ color: '#2563EB', opacity: 0.3 }} />
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#1F2937' }}>
            Why Choose RENTEASE?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center p-6">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#EFF6FF' }}>
                      <Icon className="h-8 w-8" style={{ color: '#2563EB' }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: '#1F2937' }}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#2563EB' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Start your search today and find your perfect rental property
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/listings">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                style={{ backgroundColor: 'white', color: '#2563EB' }}
                data-testid="cta-browse-button"
              >
                Browse Listings
              </Button>
            </Link>
            <Link to="/add-listing">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
                data-testid="cta-list-property-button"
              >
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
