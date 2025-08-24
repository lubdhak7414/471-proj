import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from './sections/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const getServiceImage = (name) => {
  const capitalizedServiceName = name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  const serviceName = encodeURIComponent(capitalizedServiceName);
  return `https://placehold.co/400x200/F0F9FF/0C4A6E?text=${serviceName}`;
};

export function RepairService() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/services/');
      const data = await response.json();
      if (data.services) {
        setServices(data.services);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      setError('Error fetching services. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = useMemo(() => {
    let result = services;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          service.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          service.category.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (service) => service.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    result = result.filter(
      (service) =>
        service.estimatedPrice.min >= priceRange[0] &&
        service.estimatedPrice.max <= priceRange[1]
    );

    return result;
  }, [searchTerm, services, selectedCategory, priceRange]);

  const handleViewDetailsClick = (service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(services.map(service => service.category));
    return ['All Categories', ...uniqueCategories];
  }, [services]);

  return (
    <div className="min-h-screen text-foreground font-inter">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto py-8 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6">
          Browse Our Repair Services
        </h1>
        <p className="text-lg text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Explore a comprehensive catalog of professional repair services. Find the help you need quickly and efficiently.
        </p>

        {/* Filters Section with improved layout */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12 max-w-4xl mx-auto">
          <div className="relative w-full md:w-1/3">
            <Input
              type="text"
              placeholder="Search for services..."
              className="w-full p-3 pl-10 pr-4 rounded-lg shadow-sm focus:ring-2 focus:ring-primary transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="w-full md:w-1/3">
            <Select onValueChange={(value) => setSelectedCategory(value === 'All Categories' ? '' : value)}>
              <SelectTrigger className="w-full p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Adjusted Price Filter Layout */}
          <div className="w-full md:w-1/3 flex items-center gap-4">
            <Label htmlFor="price-range" className="text-sm font-medium whitespace-nowrap">
              Price: ${priceRange[0]} - ${priceRange[1]}
            </Label>
            <Slider
              id="price-range"
              defaultValue={[0, 5000]}
              max={5000}
              step={100}
              value={priceRange}
              onValueChange={setPriceRange}
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-lg text-muted-foreground py-10">
              Loading services, please wait...
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-lg text-red-500 py-10">
              {error}
            </div>
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Card
                key={service._id}
                className="group flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={getServiceImage(service.name)}
                  alt={`Image for ${service.name}`}
                  className="w-full h-48 object-cover object-center group-hover:opacity-80 transition-opacity duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x200/F0F9FF/0C4A6E?text=Service';
                  }}
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
                  <Button className="w-full rounded-md" onClick={() => handleViewDetailsClick(service)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-lg text-muted-foreground py-10">
              No services found matching your search or filter criteria.
            </div>
          )}
        </div>

        {selectedService && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedService.name}</DialogTitle>
                <DialogDescription>{selectedService.description}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <img
                  src={getServiceImage(selectedService.name)}
                  alt={`Image for ${selectedService.name}`}
                  className="w-full h-48 object-cover object-center rounded-lg"
                />
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-sm">Category:</p>
                  <Badge className="w-fit">{selectedService.category}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-sm">Estimated Price:</p>
                    <p>${selectedService.estimatedPrice.min} - ${selectedService.estimatedPrice.max}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Estimated Duration:</p>
                    <p>{selectedService.estimatedDuration} days</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}