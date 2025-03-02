
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F6F6F7]">
      <NavBar />
      
      {isHeroVisible && <Hero />}
      
      <Features />
      
      <Pricing />
      
      <footer className="bg-[#F1F1F1] py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-[#555555]">
            © {new Date().getFullYear()} Image Analysis Platform. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <Button variant="link" size="sm" className="text-[#0FA0CE] hover:text-[#1EAEDB]">Terms of Service</Button>
            <Button variant="link" size="sm" className="text-[#0FA0CE] hover:text-[#1EAEDB]">Privacy Policy</Button>
            <Button variant="link" size="sm" className="text-[#0FA0CE] hover:text-[#1EAEDB]">Contact Us</Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
