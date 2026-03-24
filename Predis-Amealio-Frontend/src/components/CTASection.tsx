import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to transform your{" "}
            <span className="text-accent-orange">marketing?</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using AI to create stunning ads and boost their ROI
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style = {{ color: '#001D51'}}>
            <Button 
              variant="primary" 
              size="xl" 
              className="px-8 text-[14px] font-medium group"
              style={{ backgroundColor: '#001D51' }}
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Creating for Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {/* <div className="text-sm" style={{ color: '#001D51' }}>
              ✓ No credit card required<br />
              ✓ 7-day free trial<br />
              ✓ Cancel anytime
            </div> */}
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-300/20 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default CTASection;