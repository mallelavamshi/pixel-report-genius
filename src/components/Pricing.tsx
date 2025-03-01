
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Pricing = () => {
  const navigate = useNavigate();
  
  const handleSignUp = (tier: string) => {
    // For demonstration purposes, set a user as logged in with the selected tier
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userTier', tier);
    
    toast.success(`Subscribed to ${tier} plan successfully!`);
    navigate('/tasks');
  };

  return (
    <section id="pricing" className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Choose the plan that's right for you and start analyzing images today.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 mt-8">
          {/* Free Tier */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>For individual use and testing</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mt-4 text-4xl font-bold">$0</div>
              <p className="text-muted-foreground">per month</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>5 single-lot analyses per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Basic image analysis</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Excel reports</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSignUp('free')}>
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Basic Tier */}
          <Card className="flex flex-col border-primary">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-2xl">Basic</CardTitle>
              <CardDescription className="text-primary-foreground/90">For professionals</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mt-4 text-4xl font-bold">$29</div>
              <p className="text-muted-foreground">per month</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>50 analyses per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Multi-lot processing (up to 10 images)</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Advanced analysis with Claude AI</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>PDF & Excel reports</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSignUp('basic')}>
                Subscribe
              </Button>
            </CardFooter>
          </Card>
          
          {/* Premium Tier */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>For enterprises</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mt-4 text-4xl font-bold">$99</div>
              <p className="text-muted-foreground">per month</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Unlimited analyses</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Multi-lot processing (unlimited images)</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Priority processing</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Dedicated support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSignUp('premium')}>
                Subscribe
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
