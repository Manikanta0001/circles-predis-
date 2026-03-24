import { Button } from "@/components/ui/button";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              {/* <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div> */}
              <span className="text-xl font-bold" style={{ color: '#001D51' }}>Amealio</span>
            </div>
            <p className="mb-4 max-w-md" style={{ color: '#777777', fontSize: '14px' }}>
              The most powerful AI-driven ad creative generator and social media management platform. 
              Boost your ROI with intelligent automation.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" style={{ borderColor: '#001D51', color: '#001D51', borderRadius: '12px' }}>
                Download App
              </Button>
              <Button variant="outline" size="sm" style={{ borderColor: '#001D51', color: '#001D51', borderRadius: '12px' }}>
                API Docs
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: '#001D51' }}>Product</h3>
            <ul className="space-y-2 text-sm" style={{ color: '#777777' }}>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>AI Ad Generator</a></li>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>Video Creator</a></li>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>Social Media Tool</a></li>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>Auto Posting</a></li>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>Analytics</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: '#001D51' }}>Company</h3>
            <ul className="space-y-2 text-sm" style={{ color: '#777777' }}>
              <li><Link href="/about" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>About</Link></li>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>Careers</a></li>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>Press</a></li>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>Contact</a></li>
              <li><a href="#" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm" style={{ color: '#777777' }}>
          <p>&copy; 2024 Amealio. All rights reserved. AI-Powered Social Media Management Platform.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;