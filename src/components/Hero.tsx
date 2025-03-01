
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="inline-block mb-4 rounded-full px-3 py-1 text-sm font-medium bg-accent text-primary">
            Analyze images with AI
          </div>
          <h1 className="mb-6 font-medium leading-tight">
            Unlock the power of <span className="font-semibold">AI image analysis</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our advanced AI technology analyses your images, detects objects, extracts key information, 
            and generates comprehensive PDF reports in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="group">
              <Link to="/dashboard">
                Get Started 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute top-1/3 -left-12 w-64 h-64 bg-accent/50 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-1/4 -right-12 w-64 h-64 bg-accent/30 rounded-full filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
    </section>
  );
};

export default Hero;
