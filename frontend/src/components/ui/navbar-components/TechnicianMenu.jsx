// TechnicianMenu.jsx
import React from 'react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';

export function TechnicianMenu({ onLogout }) {
  return (
    <>
      <NavigationMenu> {/* ADD THIS WRAPPER */}
      <NavigationMenuList> {/* ADD THIS TOO */}
      <NavigationMenuItem>
        <NavigationMenuLink href="/dashboard">Tech Dashboard</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="/tickets">View Tickets</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Button onClick={onLogout}>Logout</Button>
      </NavigationMenuItem>
     </NavigationMenuList>
    </NavigationMenu>
    </>
  );
}
