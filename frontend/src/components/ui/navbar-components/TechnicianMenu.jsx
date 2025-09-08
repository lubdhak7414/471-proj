import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDownIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '@/context/AuthContext'; // Import useAuth to get user data

const TechnicianMenu = ({ onItemClick }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { user, logout } = useAuth(); // Get user data and logout function from AuthContext

  // Fallback user data if not available
  const userName = user?.name || 'John Doe';
  const userEmail = user?.email || 'john@example.com';
  const userAvatar = user?.picture || ''; // Default avatar or use a placeholder

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext to clear user data
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="text-xs">
              {userName.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <ChevronDownIcon className="h-3 w-3 ml-1" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onItemClick?.('profile')}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick?.('settings')}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick?.('billing')}>
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TechnicianMenu;
