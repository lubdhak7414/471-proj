import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlignJustify } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegistrationForm } from './RegistrationForm';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for the mobile menu
  const [activePanel, setActivePanel] = useState(null);

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);
  };

  // Add the missing function here
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignInClick = () => {
    setActivePanel('login');
  };

  const handleSignUpClick = () => {
    setActivePanel('register');
  };

  const handleClosePanel = () => {
    setActivePanel(null);
  };
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClosePanel();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <nav
        className={`
          py-4 mx-auto sticky top-0 z-10
          ${isScrolled ? 'backdrop-blur-xl backdrop-filter bg-background/50 shadow-lg' : 'bg-transparent'}
        `}
      >
        <div className="flex container justify-between px-4">
          <div className="flex items-center">
            <img src="/assets/lyfelynk.svg" alt="LyfeLynk Logo" className="w-8 h-8 mr-2" />
            <a href="/" className="scroll-m-20 text-2xl lg:text-3xl font-semibold tracking-tight">
              LyfeLynk
            </a>
          </div>

          <Button
            onClick={handleMenuToggle} // The function is now defined and can be used here
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            className="md:hidden focus:outline-hidden"
          >
            <AlignJustify className='h-4 w-4' />
          </Button>

          <ul className="hidden md:flex items-center space-x-8">
            <li><a href="#" className="hover:text-primary font-semibold">Lorem</a></li>
            <li><a href="#" className="hover:text-primary font-semibold">Ipsum</a></li>
            <li><a href="#" className="hover:text-primary font-semibold">Blog</a></li>
            <li><a href="#" className="hover:text-primary font-semibold">Contact</a></li>
            <li><a href="#" className="hover:text-primary font-semibold">About</a></li>
          </ul>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" onClick={handleSignInClick}>Sign In</Button>
            <Button onClick={handleSignUpClick}>Get Started</Button>
          </div>
        </div>
      </nav>

      {activePanel && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xl z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {activePanel === 'login' && <LoginForm onSwitchToRegister={handleSignUpClick} />}
            {activePanel === 'register' && <RegistrationForm onSwitchToLogin={handleSignInClick} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;