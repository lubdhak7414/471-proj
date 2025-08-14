// RegistrationForm.jsx
"use client";

import { useState } from 'react';
// Import useNavigate hook
import { useNavigate } from 'react-router-dom'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function RegistrationForm({ onSwitchToLogin }) {
  const [isTechnician, setIsTechnician] = useState(false);
  // Initialize the useNavigate hook
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For this example, we'll simulate a user registration process
    // In a real application, you would make an API call here
    // to your backend, which would return the newly created user's data,
    // including their unique ID.
    
    // Example: await fetch('/api/register', { ... });
    // const userData = await response.json();
    
    // Simulate a successful registration that returns a userId
    const simulatedUserId = "abc-123-def-456"; 
    
    console.log("Registering user...", {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      isTechnician: isTechnician,
    });

    if (isTechnician) {
      // Use the navigate function to redirect the user
      // to the technician onboarding page, passing the userId in the URL.
      navigate(`/technician-onboarding/${simulatedUserId}`);
    } else {
      // Handle non-technician registration (e.g., redirect to a dashboard)
      // navigate('/dashboard');
      console.log('User registered as a regular user.');
    }
  };

  return (
    // ... rest of your component code is the same}
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* The checkbox to toggle technician registration */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTechnician"
                checked={isTechnician}
                onCheckedChange={setIsTechnician}
              />
              <Label htmlFor="isTechnician">Sign up as a technician</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required />
            </div>
          </div>
          <CardFooter className="flex-col gap-2 mt-6 p-0"> {/* Adjusted margin-top and padding */}
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onSwitchToLogin ? onSwitchToLogin : () => {}} // Ensure fallback function is in place
            >
              Already have an account? Log in
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
