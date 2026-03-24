import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Award, TrendingUp } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { icon: Users, label: "Active Users", value: "10,000+" },
    { icon: Sparkles, label: "Content Generated", value: "500K+" },
    { icon: Award, label: "AI Models", value: "8+" },
    { icon: TrendingUp, label: "Success Rate", value: "95%" },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-center" style={{ color: '#001D51' }}>About Amealio</h1>
          <p className="text-xl text-center mb-16" style={{ color: '#777777' }}>
            Revolutionizing social media management with AI-powered content creation
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6 text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="prose max-w-none">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Amealio empowers businesses and creators to harness the power of artificial intelligence 
              for social media content creation. We believe that everyone should have access to 
              professional-grade content tools, regardless of their budget or technical expertise.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12">Why Choose Amealio?</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">🤖 Cutting-Edge AI</h3>
                  <p className="text-muted-foreground">
                    Access to GPT-5, Claude, Gemini, and more - the most advanced AI models available
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">⚡ Lightning Fast</h3>
                  <p className="text-muted-foreground">
                    Generate professional content in seconds, not hours
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">📊 Data-Driven</h3>
                  <p className="text-muted-foreground">
                    Real-time analytics and insights to optimize your content strategy
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">🔐 Secure & Reliable</h3>
                  <p className="text-muted-foreground">
                    Enterprise-grade security with 99.9% uptime guarantee
                  </p>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Built by a team of AI experts, social media strategists, and software engineers 
              passionate about democratizing access to advanced content creation tools.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
