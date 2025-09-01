import React, { useEffect, useState } from 'react';
import Navbar from './sections/navbar';
import Footer from './sections/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const endpoints = [
  { key: 'users', url: 'http://localhost:3000/api/users', label: 'Users' },
  { key: 'bookings', url: 'http://localhost:3000/api/bookings', label: 'Bookings' },
  { key: 'services', url: 'http://localhost:3000/api/services', label: 'Services' },
];

function getUserStats(users) {
  if (!Array.isArray(users)) return { total: 0, admins: 0, technicians: 0, customers: 0 };
  const stats = { total: users.length, admins: 0, technicians: 0, customers: 0 };
  users.forEach(u => {
    if (u.role === 'admin') stats.admins++;
    else if (u.role === 'technician') stats.technicians++;
    else stats.customers++;
  });
  return stats;
}

function getBookingStats(bookings) {
  if (!Array.isArray(bookings)) return { total: 0, pending: 0, accepted: 0, completed: 0, cancelled: 0, inProgress: 0 };
  const stats = { total: bookings.length, pending: 0, accepted: 0, completed: 0, cancelled: 0, inProgress: 0 };
  bookings.forEach(b => {
    switch(b.status) {
      case 'pending': stats.pending++; break;
      case 'accepted': stats.accepted++; break;
      case 'completed': stats.completed++; break;
      case 'cancelled': stats.cancelled++; break;
      case 'in-progress': stats.inProgress++; break;
    }
  });
  return stats;
}

function getServiceStats(services) {
  if (!services?.services || !Array.isArray(services.services)) return { total: 0, categories: {} };
  const stats = { total: services.services.length, categories: {} };
  services.services.forEach(s => {
    stats.categories[s.category] = (stats.categories[s.category] || 0) + 1;
  });
  return stats;
}

function AdminDashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError('');
      const results = {};
      try {
        for (const ep of endpoints) {
          const res = await fetch(ep.url);
          const json = await res.json();
          results[ep.key] = json;
        }
        setData(results);
      } catch (err) {
        setError('Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const userStats = getUserStats(data.users);
  const bookingStats = getBookingStats(data.bookings);
  const serviceStats = getServiceStats(data.services);

  const userChartData = {
    labels: ['Customers', 'Technicians', 'Admins'],
    datasets: [{
      data: [userStats.customers, userStats.technicians, userStats.admins],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }],
  };

  const bookingChartData = {
    labels: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [{
      label: 'Bookings',
      data: [bookingStats.pending, bookingStats.accepted, bookingStats.inProgress, bookingStats.completed, bookingStats.cancelled],
      backgroundColor: ['#fbbf24', '#22c55e', '#3b82f6', '#10b981', '#ef4444'],
      borderWidth: 1,
      borderColor: '#e5e7eb',
    }],
  };

  const serviceChartData = {
    labels: Object.keys(serviceStats.categories),
    datasets: [{
      data: Object.values(serviceStats.categories),
      backgroundColor: ['#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="text-foreground font-inter min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-foreground font-inter min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-red-500">
            <p className="text-xl mb-2">⚠️ Error</p>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="text-foreground font-inter min-h-screen ">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto py-8 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your repair portal</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
                <div className="text-blue-600 text-3xl">👥</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookingStats.total}</p>
                </div>
                <div className="text-green-600 text-3xl">📋</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-2xl font-bold text-gray-900">{serviceStats.total}</p>
                </div>
                <div className="text-purple-600 text-3xl">🔧</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{bookingStats.completed}</p>
                </div>
                <div className="text-emerald-600 text-3xl">✅</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={userChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Booking Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar data={bookingChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Service Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut data={serviceChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Customers
                    <Badge variant="secondary">{userStats.customers}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Regular users who book services</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Technicians
                    <Badge variant="secondary">{userStats.technicians}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Service providers</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Admins
                    <Badge variant="secondary">{userStats.admins}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">System administrators</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.users?.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'technician' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Pending', count: bookingStats.pending, color: 'bg-yellow-100 text-yellow-800' },
                { label: 'Accepted', count: bookingStats.accepted, color: 'bg-green-100 text-green-800' },
                { label: 'In Progress', count: bookingStats.inProgress, color: 'bg-blue-100 text-blue-800' },
                { label: 'Completed', count: bookingStats.completed, color: 'bg-emerald-100 text-emerald-800' },
                { label: 'Cancelled', count: bookingStats.cancelled, color: 'bg-red-100 text-red-800' },
              ].map((stat) => (
                <Card key={stat.label} className="bg-white">
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${stat.color} mb-2`}>
                      {stat.label}
                    </div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.bookings?.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{booking.service?.name}</p>
                        <p className="text-sm text-gray-600">{booking.user?.name} • {booking.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          booking.status === 'completed' ? 'default' :
                          booking.status === 'cancelled' ? 'destructive' :
                          booking.status === 'accepted' ? 'secondary' : 'outline'
                        }>
                          {booking.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.services?.services?.map((service) => (
                <Card key={service._id} className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {service.name}
                      <Badge variant="secondary">{service.category}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>Duration: {service.estimatedDuration}min</span>
                      <span className="font-medium">৳{service.estimatedPrice.min}-{service.estimatedPrice.max}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboard;