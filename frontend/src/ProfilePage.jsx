import React, { useState } from 'react';
import Navbar from './sections/navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from './context/AuthContext';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    picture: user?.picture || '',
    password: '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    area: user?.address?.area || '',
    postalCode: user?.address?.postalCode || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build payload
    const payload = {
      name: formData.name,
      phone: formData.phone,
      picture: formData.picture,
      address: {
        street: formData.street,
        city: formData.city,
        area: formData.area,
        postalCode: formData.postalCode,
      },
      isActive: true,
    };
    // Only include password if it's set
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      const response = await fetch(`${apiUrl}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated!');
        // Optionally update local user state here
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground font-inter">
      <Navbar />
      <div className="max-w-xl mx-auto mt-12 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar URL</label>
                <Input
                  name="picture"
                  value={formData.picture}
                  onChange={handleChange}
                  placeholder="Avatar URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New password"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Street</label>
                <Input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Area</label>
                <Input
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <Input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal Code"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;