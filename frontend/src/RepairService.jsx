import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './sections/navbar';
// Import the real Shadcn UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchIcon } from 'lucide-react';

export function RepairService() {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);

  // Fetch the services from the API
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('http://localhost:3000/api/services/');
        const data = await response.json();
        setServices(data.services);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }

    fetchServices();
  }, []);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm) {
      return services;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return services.filter(service =>
      service.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      service.category.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, services]);

  // Function to return a mock image URL based on service name
  const getServiceImage = (name) => {
    const serviceName = name.toLowerCase();
    if (serviceName.includes('plumbing')) return 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=Plumbing';
    if (serviceName.includes('hvac')) return 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=HVAC';
    if (serviceName.includes('electrical')) return 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=Electrical';
    if (serviceName.includes('appliance')) return 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=Appliance';
    if (serviceName.includes('roof')) return 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=Roofing';
    if (serviceName.includes('carpentry')) return 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=Carpentry';
    return 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=Service';
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto py-8 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6">
          Browse Our Repair Services
        </h1>
        <p className="text-lg text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Explore a comprehensive catalog of professional repair services. Find the help you need quickly and efficiently.
        </p>

        {/* Search Bar */}
        <div className="relative mb-12 max-w-xl mx-auto">
          <Input
            type="text"
            placeholder="Search for services (e.g., plumbing, HVAC, electrical)..."
            className="w-full p-3 pl-10 pr-4 rounded-lg shadow-sm focus:ring-2 focus:ring-primary transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <Card key={service._id} className="flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src={getServiceImage(service.name)}
                  alt={service.name}
                  className="w-full h-48 object-cover object-center"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=Service'; }}
                />
                <CardHeader className="p-4 pb-2">
                  <Badge className="w-fit mb-2">{service.category}</Badge>
                  <CardTitle className="text-xl font-semibold">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {service.description}
                  </CardDescription>
                  <p className="text-md font-medium text-foreground">
                    Price: ${service.estimatedPrice.min} - ${service.estimatedPrice.max}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full rounded-md">View Details</Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-lg text-muted-foreground py-10">
              No services found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
