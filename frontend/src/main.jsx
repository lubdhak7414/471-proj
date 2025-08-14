import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import NotFoundPage from './NotFoundPage.jsx';
// Import the new TechnicianOnboarding component
import { TechnicianOnboarding } from '../pages/TechnicianOnboarding.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <NotFoundPage />
  },
  {
    // Add a new route for technician onboarding
    // The ':userId' part is a route parameter that captures the ID from the URL.
    path: '/technician-onboarding/:userId',
    element: <TechnicianOnboarding />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);