
import { 
  Camera, 
  Eye, 
  FileText, 
  Palette, 
  Zap, 
  Shield
} from 'lucide-react';

const features = [
  {
    icon: <Camera className="h-8 w-8 text-primary" />,
    title: "Instant Image Analysis",
    description: "Upload an image and get instant analysis powered by state-of-the-art AI algorithms."
  },
  {
    icon: <Eye className="h-8 w-8 text-primary" />,
    title: "Object Detection",
    description: "Identify and locate multiple objects within your images with precision and accuracy."
  },
  {
    icon: <Palette className="h-8 w-8 text-primary" />,
    title: "Color Analysis",
    description: "Extract color palettes and understand color distribution across your images."
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "PDF Report Generation",
    description: "Generate comprehensive PDF reports with detailed analysis of your images."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Lightning Fast",
    description: "Get results in seconds, not minutes, thanks to our optimized processing pipeline."
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Privacy Focused",
    description: "Your images and data are processed securely and never shared with third parties."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform offers a comprehensive set of features to help you extract valuable 
            insights from your images.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm border border-border/50 transition-all hover:shadow-md hover:translate-y-[-2px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-2 bg-accent inline-block rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
