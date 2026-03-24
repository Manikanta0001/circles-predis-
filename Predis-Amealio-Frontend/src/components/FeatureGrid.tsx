// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { 
//   Zap, 
//   Share2, 
//   ShoppingBag, 
//   Video, 
//   Calendar, 
//   Code, 
//   MessageSquare, 
//   Target,
//   Expand
// } from "lucide-react";

// const features = [
//   {
//     title: "AI Ad Generator",
//     description: "Create stunning ads in seconds",
//     icon: Target,
//     gradient: "from-blue-500 to-purple-600"
//   },
//   {
//     title: "Video Ads",
//     description: "Dynamic video content",
//     icon: Video,
//     gradient: "from-purple-500 to-pink-600"
//   },
//   {
//     title: "E-Commerce Product Ads",
//     description: "Product-focused advertising",
//     icon: ShoppingBag,
//     gradient: "from-green-500 to-blue-600"
//   },
//   {
//     title: "Social Media Post Maker",
//     description: "Ready-to-post content",
//     icon: Share2,
//     gradient: "from-orange-500 to-red-600"
//   },
//   {
//     title: "Auto Resize",
//     description: "Automatic format adaptation",
//     icon: Expand,
//     gradient: "from-cyan-500 to-blue-600"
//   },
//   {
//     title: "Auto Post",
//     description: "Scheduled publishing",
//     icon: Calendar,
//     gradient: "from-indigo-500 to-purple-600"
//   },
//   // {
//   //   title: "API",
//   //   description: "Developer integration",
//   //   icon: Code,
//   //   gradient: "from-gray-600 to-blue-600"
//   // },
//   // {
//   //   title: "AI Assistant",
//   //   description: "Smart content suggestions",
//   //   icon: MessageSquare,
//   //   gradient: "from-pink-500 to-orange-600"
//   // }
// ];

// const FeatureGrid = () => {
//   return (
//     <section className="py-24 bg-muted/30">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#001D51' }}>
//             Everything you need to{" "}
//             <span style={{ color: '#001D51' }}>
//               grow your business
//             </span>
//           </h2>
//           <p className="text-xl max-w-2xl mx-auto" style={{ color: '#001D51' }}>
//             Create, manage, and optimize your ad campaigns with our comprehensive AI-powered toolkit
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {features.map((feature, index) => {
//             const Icon = feature.icon;
//             return (
//               <Card 
//                 key={feature.title} 
//                 className="group hover:shadow-feature transition-all duration-300 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm"
//               >
//                 <CardContent className="p-6 text-center">
//                   <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
//                     <Icon className="w-8 h-8 text-white" />
//                   </div>
//                   <h3 className="text-lg font-semibold mb-2" style={{ color: '#001D51' }}>
//                     {feature.title}
//                   </h3>
//                   <p className="text-sm mb-4" style={{ color: '#001D51' }}>
//                     {feature.description}
//                   </p>
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     className="transition-colors"
//                     style={{ color: '#001D51', borderColor: '#001D51' }}
//                   >
//                     Try Now
//                   </Button>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FeatureGrid;

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Share2, 
  ShoppingBag, 
  Video, 
  Calendar, 
  Code, 
  MessageSquare, 
  Target,
  Expand
} from "lucide-react";

const features = [
  {
    title: "AI Ad Generator",
    description: "Create stunning ads in seconds",
    icon: Target,
    gradient: "from-blue-500 to-purple-600"
  },
  {
    title: "Video Ads",
    description: "Dynamic video content",
    icon: Video,
    gradient: "from-purple-500 to-pink-600"
  },
  {
    title: "E-Commerce Product Ads",
    description: "Product-focused advertising",
    icon: ShoppingBag,
    gradient: "from-green-500 to-blue-600"
  },
  {
    title: "Social Media Post Maker",
    description: "Ready-to-post content",
    icon: Share2,
    gradient: "from-orange-500 to-red-600"
  },
  {
    title: "Auto Resize",
    description: "Automatic format adaptation",
    icon: Expand,
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    title: "Auto Post",
    description: "Scheduled publishing",
    icon: Calendar,
    gradient: "from-indigo-500 to-purple-600"
  }
];

const FeatureGrid = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#001D51' }}>
            Everything you need to{" "}
            <span style={{ color: '#001D51' }}>
              grow your business
            </span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#001D51' }}>
            Create, manage, and optimize your ad campaigns with our comprehensive AI-powered toolkit
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="group hover:shadow-feature transition-all duration-300 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#001D51' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#001D51' }}>
                    {feature.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="transition-colors"
                    style={{ color: '#001D51', borderColor: '#001D51' }}
                  >
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
