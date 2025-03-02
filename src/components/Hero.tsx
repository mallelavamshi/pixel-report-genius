import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#FFFFFF] to-[#E5DEFF]">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">
              Intelligent Lots Analysis Platform
            </h1>
            <p className="mx-auto max-w-[700px] text-[#555555] md:text-xl">
              Upload images and get detailed analysis using cutting-edge AI technology.
              Perfect for items research, price discovery, and market analysis for Estate sales companies, Appraisers and Auction Houses.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="sm" 
              onClick={handleGetStarted}
              className="bg-[#8B5CF6] hover:bg-[#7E69AB] text-white px-5 py-2 rounded-md shadow-md"
            >
              {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#E5DEFF] px-5 py-2 rounded-md"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
