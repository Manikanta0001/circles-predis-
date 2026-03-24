import { Button } from "@/components/ui/button";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div> */}
            <span className="text-xl font-bold" style={{ color: '#001D51' }}>Amealio</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>
                Use Cases
              </button>
            </div>
            <div className="relative group">
              <button className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>
                Solutions
              </button>
            </div>
            <button className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>
              Features
            </button>
            <button className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>
              API
            </button>
            <Link href="/pricing" className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>
              Pricing
            </Link>
            <button className="transition-colors hover:opacity-80" style={{ color: '#777777' }}>
              Demo
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" style={{ color: '#777777', borderRadius: '12px' }} asChild>
              <Link href="/login">Login</Link>
            </Button>
            {/* <Button variant="gradient" className="px-6" asChild>
              <Link href="/signup">Try for free</Link>
            </Button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;