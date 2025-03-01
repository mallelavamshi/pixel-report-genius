
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  const handleLogin = () => {
    // For demonstration purposes, we'll simulate a login by setting a localStorage value
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userTier', 'basic');
    
    toast.success('Successfully logged in!');
    navigate('/tasks');
  };

  const handleSignUp = () => {
    // For demonstration purposes, we'll simulate a signup by setting a localStorage value
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userTier', 'free');
    
    toast.success('Account created successfully!');
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen">
      <NavBar onLogin={handleLogin} onSignUp={handleSignUp} />
      
      {isHeroVisible && <Hero onGetStarted={handleSignUp} />}
      
      <Features />
      
      <Pricing onSignUp={handleSignUp} />
      
      <footer className="bg-background py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Image Analysis Platform. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <Button variant="link" size="sm">Terms of Service</Button>
            <Button variant="link" size="sm">Privacy Policy</Button>
            <Button variant="link" size="sm">Contact Us</Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
