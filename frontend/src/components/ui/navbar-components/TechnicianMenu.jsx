// TechnicianMenu.jsx
import React from 'react';
import {
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';

export function TechnicianMenu({ onLogout }) {
  return (
    <>
      <NavigationMenuItem>
        <NavigationMenuLink href="/tech-dashboard">Tech Dashboard</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="/tickets">View Tickets</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Button onClick={onLogout}>Logout</Button>
      </NavigationMenuItem>
    </>
  );
}