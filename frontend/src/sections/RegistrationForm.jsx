"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/context/AuthContext'; // Import AuthContext hook

export function RegistrationForm({ onSwitchToLogin }) {
  const [isTechnician, setIsTechnician] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    street: '',
    city: '',
    area: '',
    postalCode: '',
    picture: '',
  });

  const { login } = useAuth(); // Destructure login from AuthContext
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: isTechnician ? 'technician' : 'user',
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        area: formData.area,
        postalCode: formData.postalCode,
      },
      picture: formData.picture || 'https://example.com/avatar.jpg', // Use the URL from the form, fallback to a default picture
    };

    // Register user by sending a POST request to the API
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const result = await response.json();
      
      // After successful registration, log the user in
      login(result.user, result.token); // Assuming the API sends back user and token

      // Redirect to the appropriate page based on the role
      if (isTechnician) {
        // Redirect to technician-specific page
        navigate('/technician-dashboard');
      } else {
        // Redirect to the regular user dashboard
        navigate('/dashboard');
      }
    } else {
      // Handle API errors (e.g., email already exists)
      const errorData = await response.json();
      console.error('Registration failed:', errorData);
      // Optionally show a user-friendly error message
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checkbox for technician role */}
            <div className="flex items-center space-x-2 col-span-2">
              <Checkbox
                id="isTechnician"
                checked={isTechnician}
                onCheckedChange={setIsTechnician}
              />
              <Label htmlFor="isTechnician">Sign up as a technician</Label>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                name="name"
                required
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                name="email"
                required
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                name="password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                required
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="text"
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
                name="phone"
              />
            </div>

            {/* Address - Street */}
            <div className="grid gap-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                type="text"
                placeholder="123 Main St"
                value={formData.street}
                onChange={handleChange}
                name="street"
              />
            </div>

            {/* Address - City */}
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Dhaka"
                value={formData.city}
                onChange={handleChange}
                name="city"
              />
            </div>

            {/* Address - Area */}
            <div className="grid gap-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                type="text"
                placeholder="Gulshan"
                value={formData.area}
                onChange={handleChange}
                name="area"
              />
            </div>

            {/* Address - Postal Code */}
            <div className="grid gap-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                type="text"
                placeholder="1212"
                value={formData.postalCode}
                onChange={handleChange}
                name="postalCode"
              />
            </div>

            {/* Profile Picture */}
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="picture">Profile Picture URL</Label>
              <Input
                id="picture"
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={formData.picture}
                onChange={handleChange}
                name="picture"
              />
            </div>
          </div>
          
          <CardFooter className="flex-col gap-2 mt-6 p-0">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onSwitchToLogin ? onSwitchToLogin : () => {}}
            >
              Already have an account? Log in
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
