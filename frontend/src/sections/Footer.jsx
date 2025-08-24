import { Facebook, Mail, Twitter, Linkedin } from 'lucide-react';

function Footer() {
  return (
    <footer className="py-12 px-4 text-gray-400 border-t border-gray-700">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12  pb-8">
        {/* Company Info */}
        <div className="space-y-4">
          <div className="flex items-center">
            
            <span className="text-gray-50 text-3xl font-bold tracking-tight">
              Repair Portal
            </span>
          </div>
          <p className="max-w-xs leading-relaxed">
            Repair Portal is your all-in-one solution for seamless digital connections and services.
          </p>
          <p>
            &copy; {new Date().getFullYear()} Repair Portal. All rights reserved.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">About Us</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Services</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Contact Us</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Help Center</a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Legal</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Terms of Service</a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" aria-label="Mail" className="hover:text-blue-500 transition-colors duration-200">
              <Mail className="h-6 w-6" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-blue-500 transition-colors duration-200">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-blue-500 transition-colors duration-200">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-blue-500 transition-colors duration-200">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;