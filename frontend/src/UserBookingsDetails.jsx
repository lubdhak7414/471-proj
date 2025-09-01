import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './sections/navbar';
import Footer from './sections/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, AlertCircle, DollarSign } from 'lucide-react';

export function UserBookings() {
  const { user } = useAuth();
  const [userLoading, setUserLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDateTime, setNewDateTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);

  useEffect(() => {
    if (user !== null) {
      setUserLoading(false);
    }

    const fetchBookings = async () => {
      if (!user || !user.id) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/bookings/user/${user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setBookings(data.bookings);
        } else {
          throw new Error(data.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchBookings();
    }
  }, [user, userLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'bidding':
        return 'bg-orange-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCardClick = async (booking) => {
    setSelectedBooking(booking);
    setNewDateTime(booking.preferredTime);
    setDialogOpen(true);
    
    // If booking status is "bidding", fetch the bids
    if (booking.status === 'bidding') {
      setBidsLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/bids/booking/${booking._id}`);
        const data = await response.json();
        
        if (response.ok) {
          setBids(data.bids);
        } else {
          throw new Error(data.message || 'Failed to fetch bids');
        }
      } catch (err) {
        console.error('Error fetching bids:', err);
        setBids([]);
      } finally {
        setBidsLoading(false);
      }
    } else {
      setBids([]);
    }
  };

  const handleAcceptBid = async (bidId) => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/bids/${bidId}/accept`, { method: 'PUT' });
      const data = await response.json();
      if (response.ok) {
        setSelectedBooking({ ...selectedBooking, status: 'confirmed' });
        alert('Bid accepted successfully!');
      } else {
        alert(data.message || 'Failed to accept bid');
      }
    } catch (err) {
      alert(err.message || 'Failed to accept bid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert('Booking cancelled successfully!');
      setActionLoading(false);
      setDialogOpen(false);
    }, 1000);
  };

  const handleReschedule = async () => {
    if (!newDateTime) {
      alert('Please select a new date and time');
      return;
    }
    
    if (new Date(newDateTime) < new Date()) {
      alert('New date and time cannot be in the past');
      return;
    }

    setActionLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert('Booking rescheduled successfully!');
      setActionLoading(false);
      setDialogOpen(false);
    }, 1000);
  };

  if (userLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="text-foreground font-inter min-h-screen">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto py-8 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6">
          My Bookings
        </h1>
        <p className="text-lg text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          View and manage all your service bookings. Click on any booking to reschedule or cancel.
        </p>

        {loading ? (
          <div className="text-center">Loading bookings...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error: {error}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>No bookings found.</p>
            <p className="mt-2">Ready to book your first service?</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <Card 
                key={booking._id} 
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() => handleCardClick(booking)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{booking.service.name}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {booking.service.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {booking.description}
                  </p>
                  

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(booking.preferredDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(booking.preferredTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">{booking.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.estimatedCost > 0 
                          ? `$${booking.estimatedCost}` 
                          : `$${booking.service.estimatedPrice.min} - $${booking.service.estimatedPrice.max}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className={getUrgencyColor(booking.urgency)}>
                      {booking.urgency} priority
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Management Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Booking</DialogTitle>
              <DialogDescription>
                {selectedBooking?.service.name} - {selectedBooking && formatDate(selectedBooking.preferredDate)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Current Details:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Service:</strong> {selectedBooking?.service.name}</p>
                  <p><strong>Date:</strong> {selectedBooking && formatDate(selectedBooking.preferredDate)}</p>
                  <p><strong>Time:</strong> {selectedBooking && formatTime(selectedBooking.preferredTime)}</p>
                  <p><strong>Address:</strong> {selectedBooking?.address}</p>
                  <p><strong>Status:</strong> {selectedBooking?.status}</p>
                </div>
              </div>

              {selectedBooking?.status !== 'completed' && selectedBooking?.status !== 'cancelled' && (
                <div className="space-y-2">
                  <label htmlFor="reschedule-time" className="text-sm font-medium">
                    Reschedule to:
                  </label>
                  <Input
                    id="reschedule-time"
                    type="datetime-local"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                  />
                </div>
              )}

              {/* Show bids if booking status is "bidding" */}
              {selectedBooking?.status === 'bidding' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Available Bids:</h4>
                  {bidsLoading ? (
                    <div className="text-center text-sm text-muted-foreground">Loading bids...</div>
                  ) : bids.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">No bids available yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {bids.map((bid) => (
                        <Card key={bid._id} className="border border-muted">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h5 className="font-medium">{bid.technician.name}</h5>
                                <p className="text-sm text-muted-foreground">{bid.technician.phone}</p>
                              </div>
                              <Badge className="bg-green-500">
                                ${bid.bidAmount}
                              </Badge>
                            </div>
                            <p className="text-sm mb-3">{bid.message}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                Duration: {bid.estimatedDuration}h
                              </span>
                              <Button 
                                size="sm" 
                                onClick={() => handleAcceptBid(bid._id)}
                                disabled={actionLoading}
                              >
                                Accept Bid
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={actionLoading}
              >
                Close
              </Button>
              
              {selectedBooking?.status !== 'completed' && selectedBooking?.status !== 'cancelled' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleReschedule}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Rescheduling...' : 'Reschedule'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancel}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
