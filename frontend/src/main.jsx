import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import { TechnicianOnboarding } from '../pages/TechnicianOnboarding.jsx';
import { RepairService } from './RepairService.jsx';
import { ServiceBooking } from './ServiceBooking.jsx';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes from './context/ProtectedRoutes.jsx'; // Make sure the path is correct
import './index.css';
import Layout from './Layout.jsx'; //



import SearchTechnicians from './components/SearchTechnician.jsx';
import PaymentGateway from './components/PaymentGateway.jsx';
import TechnicianDashboard from './components/TechnicianDashboard.jsx';

import { SocketProvider } from './context/socket.provider.jsx'; // Import SocketProvider



// Define your routes
const router = createBrowserRouter([
  {
    path:'/search',
    element: <SearchTechnicians />
  },
  {
    path:'/dashboard',
    element: <TechnicianDashboard />
  },
    {
    path:'/payment',
    element: <PaymentGateway />
  },
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/technician-onboarding/:userId',
    element: <TechnicianOnboarding />,
  },
  // Use a layout route to protect multiple paths
  {
    element: <ProtectedRoutes allowedRoles={['user']} />, // Pass the allowed role
    children: [
      {
        path: '/repair-service',
        element: <RepairService />,
      },
      {
        path: '/service-booking',
        element: <ServiceBooking />,
      },
    ],
  },
]);

// Wrap the RouterProvider with the AuthProvider to provide authentication context globally
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider> {/* Add SocketProvider here */}
        <Layout>
          <RouterProvider router={router} />
        </Layout>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
