
import { useEffect } from 'react';
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const Index = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        
        {/* Call to action */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4">Ready to analyze your images?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto opacity-90">
              Start extracting valuable insights from your images today with our AI-powered platform.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/dashboard">
                Get Started Now
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-10 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <Link to="/" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">V</span>
                  </div>
                  <span className="font-medium text-xl">Visio</span>
                </Link>
              </div>
              
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-muted-foreground">
                  &copy; {new Date().getFullYear()} Visio. All rights reserved.
                </p>
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={scrollToTop}
                  className="rounded-full"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
