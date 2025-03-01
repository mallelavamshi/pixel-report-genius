
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    // For demonstration purposes, set a user as logged in with free tier
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userTier', 'free');
    
    // Navigate to tasks page
    navigate('/tasks');
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Intelligent Image Analysis Platform
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Upload images and get detailed analysis using cutting-edge AI technology.
              Perfect for product research, comparison, and market analysis.
            </p>
          </div>
          <div className="space-x-4">
            <Button size="lg" onClick={handleGetStarted}>
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
