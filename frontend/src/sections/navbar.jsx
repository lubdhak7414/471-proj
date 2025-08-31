'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlignJustify, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoginForm } from './LoginForm';
import { RegistrationForm } from './RegistrationForm';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/components/ui/navbar-components/UserMenu';
import  TechnicianMenu  from '@/components/ui/navbar-components/TechnicianMenu';
import  AdminMenu  from '@/components/ui/navbar-components/AdminMenu';
const MobileNavItem = React.forwardRef(({ href, title, onClick }, ref) => {
  return (
    <NavigationMenuItem className="w-full">
      <Button
        asChild
        variant="ghost"
        className="w-full justify-start text-lg font-semibold"
        onClick={onClick}
      >
        <a href={href} ref={ref}>
          {title}
        </a>
      </Button>
    </NavigationMenuItem>
  );
});
MobileNavItem.displayName = 'MobileNavItem';
const SignedOutMenu = ({ onSignInClick, onSignUpClick }) => {
  return (
    <div className="flex items-center space-x-4">
      <Button variant="outline" onClick={onSignInClick}>
        Sign In
      </Button>
      <Button onClick={onSignUpClick}>Get Started</Button>
    </div>
  );
};
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const { user, token, role, logout } = useAuth();
  const isLoggedIn = !!token && !!user;
  const userRole = role;
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);
  };
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleSignInClick = () => {
    setActivePanel('login');
    setIsMenuOpen(false);
  };
  const handleSignUpClick = () => {
    setActivePanel('register');
    setIsMenuOpen(false);
  };
  const handleClosePanel = () => {
    setActivePanel(null);
  };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClosePanel();
    }
  };
  const handleUserMenuItemClick = (action) => {
    if (action === 'logout') {
      logout();
      console.log('Logging out...');
    }
  };
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navigationLinks = [
    { href: '#', label: 'Lorem' },
    { href: '#', label: 'Ipsum' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Contact' },
    { href: '#', label: 'About' },
  ];
  return (
    <div>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-0',
          isScrolled ? 'bg-transparent' : 'bg-transparent'
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <a
            href="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors"
          >
            <span className="font-bold text-xl sm:text-2xl">Repair Portal</span>
          </a>
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      href={link.href}
                      className="text-muted-foreground hover:text-primary font-medium transition-colors cursor-pointer group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                userRole === 'user' ? (
                  <UserMenu onItemClick={handleUserMenuItemClick} />
                ) : userRole === 'technician' ? (
                  <TechnicianMenu onItemClick={handleUserMenuItemClick} />
                ) : userRole === 'admin' ? (
                  <AdminMenu onItemClick={handleUserMenuItemClick} />
                ) : null
              ) : (
                <SignedOutMenu
                  onSignInClick={handleSignInClick}
                  onSignUpClick={handleSignUpClick}
                />
              )}
            </div>
          </div>
          <div className="md:hidden">
            <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="group h-9 w-9"
                  onClick={handleMenuToggle}
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <AlignJustify className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle mobile menu</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-1 mt-2">
                <NavigationMenu className="max-w-none">
                  <NavigationMenuList className="flex-col items-start gap-1">
                    {navigationLinks.map((link, index) => (
                      <MobileNavItem
                        key={index}
                        href={link.href}
                        title={link.label}
                        onClick={handleMenuToggle}
                      />
                    ))}
                    <div className="flex flex-col gap-2 mt-4 w-full">
                      {isLoggedIn ? (
                        userRole === 'user' ? (
                          <UserMenu
                            onItemClick={(action) => {
                              handleUserMenuItemClick(action);
                              handleMenuToggle();
                            }}
                          />
                        ) : userRole === 'technician' ? (
                          <TechnicianMenu
                            onItemClick={(action) => {
                              handleUserMenuItemClick(action);
                              handleMenuToggle();
                            }}
                          />
                        ) : userRole === 'admin' ? (
                          <AdminMenu
                            onItemClick={(action) => {
                              handleUserMenuItemClick(action);
                              handleMenuToggle();
                            }}
                          />
                        ) : null
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => {
                              handleSignInClick();
                              handleMenuToggle();
                            }}
                          >
                            Sign In
                          </Button>
                          <Button
                            onClick={() => {
                              handleSignUpClick();
                              handleMenuToggle();
                            }}
                          >
                            Get Started
                          </Button>
                        </>
                      )}
                    </div>
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
      {activePanel && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[100]"
          onClick={handleOverlayClick}
        >
          <div
            
            onClick={(e) => e.stopPropagation()}
          >
            {activePanel === 'login' && (
              <LoginForm onSwitchToRegister={handleSignUpClick} />
            )}
            {activePanel === 'register' && (
              <RegistrationForm onSwitchToLogin={handleSignInClick} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Navbar;