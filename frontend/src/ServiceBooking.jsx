import React, { useState, useEffect } from 'react';
import Navbar from './sections/navbar'; // Assuming you already have a Navbar
import Footer from './sections/Footer'; // Assuming you have a Footer component
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea'; // For issue description

export function ServiceBooking() {
  const [selectedService, setSelectedService] = useState(''); // Initially empty
  const [technician, setTechnician] = useState(''); // This is hardcoded now in the backend as "111"
  const [issueDescription, setIssueDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('');  // Initializing preferredTime
  const [urgency, setUrgency] = useState(''); // Placeholder for urgency
  const [address, setAddress] = useState(''); // Address input
  //const [estimatedCost, setEstimatedCost] = useState('');  // Placeholder for cost
  const [images, setImages] = useState([]);  // Handle image upload
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState([]); // For storing fetched services

  const [estimatedCost, setEstimatedCost] = useState(0);

  // Fetch the services from the API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/services/');
        const data = await response.json();

        if (response.ok) {
          setServices(data.services); // Store fetched services
        } else {
          throw new Error(data.message || 'Failed to fetch services');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchServices();
  }, []);

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const userID = '689e15f590274d2874e87be8';  
    const technicianID = '689dbc1e7f68c9bd1ffb7cdd'; // Hardcoded technician ID

    try {
      const response = await fetch('http://localhost:3000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userID,
          technician: technicianID,
          service: selectedService,
          description: issueDescription,
          images,
          preferredDate: preferredTime.split('T')[0],
          preferredTime,
          urgency,
          address,
          estimatedCost
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Booking failed. Please try again.');
      }

      alert('Booking created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-foreground font-inter">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto py-8 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6">
          Service Booking
        </h1>
        <p className="text-lg text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Book a service for repair or maintenance. Select a service, describe the issue, and we'll get it scheduled.
        </p>

        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Book Your Service</CardTitle>
            <CardDescription>Select your service and provide details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBookingSubmit}>
              <div className="flex flex-col gap-6">
                {/* Service Selection */}
                <div className="grid gap-2">
                  <label htmlFor="service">Service</label>
                  <select
                    id="service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="border p-2 rounded-md bg-gray-900 text-white focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Select a Service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Technician (Hardcoded ID) */}
                {/* <div className="grid gap-2">
                  <label htmlFor="technician">Technician</label>
                  <Input
                    id="technician"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    placeholder="Technician ID is hardcoded"
                    disabled
                  />
                </div> */}

                {/* Issue Description */}
                <div className="grid gap-2">
                  <label htmlFor="description">Issue Description</label>
                  <Textarea
                    id="description"
                    placeholder="Describe the problem in detail"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Time Selection */}
                <div className="grid gap-2">
                  <label htmlFor="time">Preferred Time</label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    required
                  />
                </div>

                {/* Urgency Level Dropdown */}
                <div className="grid gap-2">
                  <label htmlFor="urgency">Urgency Level</label>
                  <select
                    id="urgency"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="border p-2 rounded-md bg-gray-900 text-white focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Select Urgency Level</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Address */}
                <div className="grid gap-2">
                  <label htmlFor="address">Address</label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter the service address"
                    required
                  />
                </div>

                {/* Estimated Cost */}
                {/* <div className="grid gap-2">
                  <label htmlFor="estimatedCost">Estimated Cost</label>
                  <Input
                    id="estimatedCost"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="Enter the estimated cost"
                    required
                  />
                </div> */}

                {/* Images (Optional, for now as a basic input) */}
                <div className="grid gap-2">
                  <label htmlFor="images">Upload Images (Optional)</label>
                  <Input
                    id="images"
                    type="file"
                    onChange={(e) => setImages([...images, ...e.target.files])}
                    multiple
                  />
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              </div>

              <CardFooter className="flex-col gap-2 p-0 mt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Booking'}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
