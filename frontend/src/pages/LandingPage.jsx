import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Home, Building2, Mountain, Shield, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroSearch } from '@/components/HeroSearch';
import { mockListings } from '@/data/mockListings';
import { ListingCard } from '@/components/ListingCard';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const propertyTypes = [
    {
      icon: Home,
      title: 'Rooms',
      description: 'Perfect for students and professionals',
      type: 'room'
    },
    {
      icon: Building2,
      title: 'Houses',
      description: 'Ideal for families and long-term stays',
      type: 'house'
    },
    {
      icon: Mountain,
      title: 'Lodges',
      description: 'Great for vacations and getaways',
      type: 'lodge'
    }
  ];

  const featuredListings = mockListings.filter(listing => listing.featured).slice(0, 3);

  const stats = [
    { value: '15+', label: 'Properties Listed' },
    { value: '100%', label: 'Verified Owners' },
    { value: '4.8', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a2744] via-[#243b5e] to-[#2d4a6d] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#334155] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight" data-testid="landing-hero-title">
              Find Your Perfect <span className="text-[#D4A574]">Home</span> Today
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed" data-testid="landing-hero-subtitle">
              Discover rooms, houses, and lodges for short or long-term stays. Your next home is just a click away.
            </p>
          </div>
          
          <HeroSearch />

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#D4A574] mb-2">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-foreground">
            What are you looking for?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.type}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-secondary/30 group bg-card"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    navigate(`/listings?type=${type.type}`);
                  }}
                  data-testid={`property-type-card-${type.type}`}
                >
                  <CardContent className="p-8 text-center">
                    <div className="mb-4 inline-flex p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 group-hover:from-secondary/20 group-hover:to-accent/20 transition-colors">
                      <Icon className="h-12 w-12 text-secondary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-secondary transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Featured Properties
              </h2>
              <p className="text-muted-foreground mt-2">Hand-picked premium listings</p>
            </div>
            <Link to="/listings">
              <Button variant="outline" className="hidden sm:flex border-secondary text-secondary hover:bg-secondary hover:text-white transition-all">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Finding your perfect rental is easy with our simple three-step process
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-secondary/20 to-accent/20">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Search & Discover
              </h3>
              <p className="text-muted-foreground">
                Browse verified properties that match your needs
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-primary/10 to-primary/20">
                <Users className="h-8 w-8 text-primary dark:text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Connect & Visit
              </h3>
              <p className="text-muted-foreground">
                Contact owners and schedule property visits
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-accent/20 to-secondary/20">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Book & Move In
              </h3>
              <p className="text-muted-foreground">
                Secure your rental and move into your new space
              </p>
            </div>
          </div>
          <Link to="/how-it-works">
            <Button variant="outline" className="border-primary text-primary dark:border-secondary dark:text-secondary hover:bg-primary hover:text-white dark:hover:bg-secondary transition-all">
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                Why Choose RENTEASE?
              </h2>
              <ul className="space-y-4">
                {[
                  'Wide variety of properties across multiple locations',
                  'Flexible rental durations - night, week, or month',
                  'Verified listings with detailed information',
                  'Easy-to-use search and filter options',
                  'Save your favorite properties for later',
                  'Direct contact with verified property owners',
                  'Transparent pricing with no hidden fees'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full mr-3 flex items-center justify-center bg-gradient-to-br from-secondary to-accent">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop"
                alt="Happy renters"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a2744] via-[#243b5e] to-[#2d4a6d] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#334155] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Find Your <span className="text-[#D4A574]">Next Home</span>?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of happy renters and landlords on RENTEASE
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/listings')}
            className="text-lg px-8 py-6 bg-gradient-to-r from-[#E07A5F] to-[#D4A574] hover:from-[#d16a50] hover:to-[#c49565] text-white font-semibold shadow-xl hover:shadow-2xl transition-all border-0"
            data-testid="landing-cta-button"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
