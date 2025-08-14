// SignedOutMenu.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { NavigationMenuItem } from '@/components/ui/navigation-menu';

export function AdminMenu({ onOpenLogin }) {
  return (
    <NavigationMenuItem>
      <Button onClick={onOpenLogin}>Sign In</Button>
    </NavigationMenuItem>
  );
}