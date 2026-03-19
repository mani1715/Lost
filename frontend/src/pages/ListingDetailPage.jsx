import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { ImageCarousel } from '@/components/ImageCarousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Heart, MapPin, Bed, Bath, Maximize, CheckCircle2, 
  Share2, Navigation, User, Phone, Send
} from 'lucide-react';
import { addFavorite, removeFavorite, isFavorite } from '@/utils/localStorage';
import ChatButton from '@/components/ChatButton';
import ChatModal from '@/components/ChatModal';
import { ReviewsSection } from '@/components/ReviewsSection';
import { BookingModal } from '@/components/BookingModal';
import { DEMO_MODE } from '@/config/demo';
import { mockListings } from '@/data/mockListings';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function ListingDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchListingDetails();
  }, [params.id]);

  useEffect(() => {
    if (listing) {
      setFavorite(isFavorite(listing._id));
    }
  }, [listing]);

  const fetchListingDetails = async () => {
    try {
      // Demo Mode: Use mock data
      if (DEMO_MODE) {
        const mockListing = mockListings.find(l => l.id == params.id);
        if (mockListing) {
          // Convert mock listing to API format
          setListing({
            _id: mockListing.id,
            title: mockListing.title,
            type: mockListing.type,
            price: mockListing.price,
            addressText: mockListing.location,
            description: mockListing.description,
            facilities: mockListing.features || [],
            bedrooms: mockListing.bedrooms,
            bathrooms: mockListing.bathrooms,
            squareFeet: mockListing.size,
            images: mockListing.images,
            owner: mockListing.owner,
            googleMapsLink: `https://www.google.com/maps?q=${mockListing.coordinates?.lat},${mockListing.coordinates?.lng}`,
            latitude: mockListing.coordinates?.lat,
            longitude: mockListing.coordinates?.lng
          });
        }
        setLoading(false);
        return;
      }
      
      // Real Mode: Fetch from backend
      const response = await axios.get(`${API_URL}/api/listings/${params.id}`);
      if (response.data.success) {
        setListing(response.data.listing);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      // Fallback to mock data
      const mockListing = mockListings.find(l => l.id == params.id);
      if (mockListing) {
        setListing({
          _id: mockListing.id,
          title: mockListing.title,
          type: mockListing.type,
          price: mockListing.price,
          addressText: mockListing.location,
          description: mockListing.description,
          facilities: mockListing.features || [],
          bedrooms: mockListing.bedrooms,
          bathrooms: mockListing.bathrooms,
          squareFeet: mockListing.size,
          images: mockListing.images,
          owner: mockListing.owner || { name: 'Property Owner' }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    if (!listing) return;
    
    if (favorite) {
      removeFavorite(listing._id);
      setFavorite(false);
    } else {
      addFavorite(listing._id);
      setFavorite(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: listing?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleOpenInMaps = () => {
    if (listing?.googleMapsLink) {
      window.open(listing.googleMapsLink, '_blank');
    } else if (listing?.latitude && listing?.longitude) {
      window.open(`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`, '_blank');
    } else {
      alert('Location coordinates not available');
    }
  };

  const handleRequestBooking = async () => {
    if (!listing || bookingLoading) return;
    
    if (!isAuthenticated) {
      alert('Please login to request a booking');
      navigate('/login');
      return;
    }
    
    setBookingLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/bookings`,
        { listingId: listing._id || listing.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert('Booking request sent successfully! The owner will contact you soon.');
      }
    } catch (error) {
      console.error('Booking request error:', error);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.message || 
                       'Failed to send booking request';
      alert(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  const isOwner = user && listing && listing.ownerId?._id === user._id;
  const isCustomer = user?.role === 'CUSTOMER';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xl text-muted-foreground">Property not found</p>
      </div>
    );
  }

  const typeColors = { room: '#2563EB', house: '#10B981', lodge: '#1F2937', pg: '#F59E0B', hostel: '#8B5CF6' };
  const badgeColor = typeColors[listing.type] || '#1F2937';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Listings
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleShare} className="border-border">
              <Share2 className="h-5 w-5" />
            </Button>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavorite}
                className="border-border"
                style={{ color: favorite ? '#EF4444' : undefined }}
              >
                <Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Image Carousel */}
        <div className="mb-8">
          <ImageCarousel images={listing.images || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {listing.title}
                    </h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{listing.addressText}</span>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: badgeColor, color: 'white' }}>
                    {listing.type.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-2" />
                    <span>{listing.bedrooms} Bed</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-2" />
                    <span>{listing.bathrooms} Bath</span>
                  </div>
                  <div className="flex items-center">
                    <Maximize className="h-5 w-5 mr-2" />
                    <span>{listing.squareFeet} sq ft</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-secondary">
                  ₹ {listing.price.toLocaleString('en-IN')} / month
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {listing.description && (
              <Card className="bg-card">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Facilities */}
            {listing.facilities && listing.facilities.length > 0 && (
              <Card className="bg-card">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Amenities & Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listing.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location & Navigation */}
            <Card className="bg-card">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Location
                </h2>
                <p className="text-muted-foreground mb-4">{listing.addressText}</p>
                {(listing.latitude && listing.longitude) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                      <strong>Coordinates:</strong> {listing.latitude}, {listing.longitude}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleOpenInMaps}
                  className="w-full bg-secondary hover:bg-secondary/90"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  Open in Google Maps
                </Button>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            {isAuthenticated && (
              <ReviewsSection
                propertyId={params.id}
                currentUserId={user?._id}
                userRole={user?.role}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            {listing.ownerId && (
              <Card className="bg-card">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-4">Owner Information</h3>
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-foreground">
                        {listing.ownerId.name || 'Property Owner'}
                      </p>
                      <p className="text-sm text-muted-foreground">{listing.ownerId.email}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => alert('Contact feature coming soon!')}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Owner
                  </Button>
                  
                  {/* Request Booking Button - Only show for customers */}
                  {isAuthenticated && user?.role === 'CUSTOMER' && (
                    <div className="mt-3">
                      <Button
                        className="w-full bg-secondary hover:bg-secondary/90"
                        onClick={handleRequestBooking}
                        disabled={bookingLoading}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {bookingLoading ? 'Sending...' : 'Request Booking'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Chat with Owner Button - Only show for customers */}
                  {isAuthenticated && user?.role === 'CUSTOMER' && (
                    <div className="mt-3">
                      <ChatButton onClick={() => setChatOpen(true)} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Property Status */}
            <Card className="bg-card">
              <CardContent className="pt-6">
                <h3 className="font-bold text-foreground mb-4">Property Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge style={{ backgroundColor: '#10B981', color: 'white' }}>
                      {listing.status || 'Available'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listed</span>
                    <span className="font-medium text-foreground">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      {isAuthenticated && user?.role === 'CUSTOMER' && listing && (
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          ownerId={listing.ownerId?._id || listing.owner}
          listingId={listing._id}
        />
      )}
    </div>
  );
}
