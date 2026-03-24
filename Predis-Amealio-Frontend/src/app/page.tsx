import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeatureGrid from "@/components/FeatureGrid";
import TestimonialSection from "@/components/TestimonialSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeatureGrid />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  );
}
