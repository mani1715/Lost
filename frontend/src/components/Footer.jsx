import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#1a2744] to-[#243b5e] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Home className="h-6 w-6 text-[#D4A574]" />
              <span className="text-lg font-bold text-white">RENTEASE</span>
            </div>
            <p className="text-sm text-white/70">
              Connecting Owners and Tenants with Ease
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[#D4A574]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/listings" className="text-white/70 hover:text-white transition-colors">Browse Listings</Link>
              </li>
              <li>
                <Link to="/add-listing" className="text-white/70 hover:text-white transition-colors">List Property</Link>
              </li>
              <li>
                <Link to="/favorites" className="text-white/70 hover:text-white transition-colors">My Favorites</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[#D4A574]">Property Types</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/listings?type=room" className="text-white/70 hover:text-white transition-colors">Rooms</Link>
              </li>
              <li>
                <Link to="/listings?type=house" className="text-white/70 hover:text-white transition-colors">Houses</Link>
              </li>
              <li>
                <Link to="/listings?type=lodge" className="text-white/70 hover:text-white transition-colors">Lodges</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[#D4A574]">Contact</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-[#E07A5F]" />
                info@rentease.com
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-[#E07A5F]" />
                (555) 123-4567
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-[#E07A5F]" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-white/60">
            © 2025 RENTEASE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
