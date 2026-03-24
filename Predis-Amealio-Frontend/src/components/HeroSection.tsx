import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-tight" style={{ color: '#001D51' }}>
            Create Faster{" "}
            <span style={{ color: '#001D51' }}>
              Post Smarter
            </span>{" "}
            and{" "}
            <span style={{ color: '#001D51' }}>
              Grow Bigger
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: '#001D51' }}>
            Generate, schedule, and optimize content effortlessly—so you can focus on growing your business, not creating posts
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent-orange fill-current" />
              ))}
            </div>
            <span style={{ color: '#001D51' }}>3k+ Reviews</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold group text-white border-0"
              style={{ backgroundColor: '#001D51' }}
            >
              Generate your Ad!
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" style={{color: 'white'}}></ArrowRight>
            </Button>
            {/* <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                Try for Free! No credit card required.
              </p>
            </div> */}
          </div>

          {/* Platform Logos
          <div className="flex items-center justify-center space-x-8 opacity-60">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">G2</span>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">Shopify</span>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">Play</span>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">App</span>
            </div>
          </div> */}

        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-primary rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-gradient-accent rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-gradient-hero rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
    </section>
  )
};

export default HeroSection;