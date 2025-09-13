import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Import useAuth from your AuthContext
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ onSwitchToRegister }) {
  // 1. Use state to manage email and password inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2. Initialize navigate here
  const navigate = useNavigate();  // Use useNavigate inside the functional component

  // 3. Use login from AuthContext
  const { login } = useAuth();  // Destructure login function from AuthContext
  const apiUrl = import.meta.env.VITE_API_URL; // <-- Add this line
  console.log("API URL:", apiUrl); // <-- Debugging line to check the API URL

  // 4. Create an async function to handle the form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/users/login`, { // <-- Use backticks and apiUrl variable
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Save the user data, including role
      const { token, user } = data;

      // Store the token and user info in AuthContext
      login(user, token);
      if (user.role === 'admin') {
        navigate('/admin-dashboard'); // Redirect to admin dashboard if role is admin
      }
      else if (user.role === 'technician'){
        navigate('/dashboard')
      } else {
        navigate('/service-booking'); // Redirect to booking page for regular user
      }

      // Navigate to the service booking page
      //navigate('/service-booking'); // Redirect after successful login
      
    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your credentials to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Attach the handleSubmit function to the form's onSubmit event */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="saf1@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {/* Display an error message if there is one */}
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {/* Disable the button while loading */}
          <CardFooter className="flex-col gap-2 p-0 mt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="outline" className="w-full" onClick={onSwitchToRegister}>
              Don't have an account? Sign Up
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
