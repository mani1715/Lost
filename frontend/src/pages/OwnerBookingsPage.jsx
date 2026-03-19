import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, MessageSquare, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { bookingService } from '@/services/bookingService';

export default function OwnerBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getOwnerBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this booking request?`)) return;

    setProcessingId(bookingId);
    try {
      const response = await bookingService.updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
      
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status } : b
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} booking`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Requests</h1>
          <p className="text-gray-600">Manage booking requests for your properties</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No booking requests yet</h3>
              <p className="text-gray-600">When customers request bookings for your properties, they will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Property Image */}
                    <div className="md:w-64 h-48 md:h-auto">
                      <img
                        src={booking.property?.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={booking.property?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {booking.property?.title}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{booking.property?.addressText}</span>
                          </div>
                        </div>

                        <Badge className={`${getStatusColor(booking.status)} text-white capitalize`}>
                          {booking.status}
                        </Badge>
                      </div>

                      {/* Customer Info */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {booking.customer?.name}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Requested on {formatDate(booking.createdAt)}</span>
                        </div>
                        {booking.message && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex items-start">
                              <MessageSquare className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900 mb-1">Message:</p>
                                <p className="text-sm text-gray-700">{booking.message}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹ {booking.property?.price?.toLocaleString('en-IN')} / month
                        </div>

                        <div className="flex gap-2">
                          {booking.status === 'pending' ? (
                            <>
                              <Button
                                onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                disabled={processingId === booking._id}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                disabled={processingId === booking._id}
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/listing/${booking.property?._id}`)}
                              size="sm"
                            >
                              View Property
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
