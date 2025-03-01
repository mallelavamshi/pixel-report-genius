
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out our platform",
    features: [
      "5 image analyses per month",
      "Basic object detection",
      "Basic PDF reports",
      "Email support"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$19",
    description: "Ideal for professionals and small teams",
    features: [
      "100 image analyses per month",
      "Advanced object detection",
      "Detailed PDF reports",
      "Color analysis",
      "Priority support"
    ],
    cta: "Go Pro",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs",
    features: [
      "Unlimited image analyses",
      "Advanced AI features",
      "Custom PDF templates",
      "API access",
      "Dedicated support"
    ],
    cta: "Contact Us",
    popular: false
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for your needs. All plans include our 
            core features with different usage limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-xl p-6 transition-all hover:scale-[1.02] ${
                plan.popular 
                  ? 'border-2 border-primary bg-white shadow-lg relative' 
                  : 'border border-border/50 bg-white shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 mx-auto bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full w-fit">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground ml-1">/month</span>}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                asChild
                className={`w-full ${plan.popular ? '' : 'bg-accent/70 text-primary hover:bg-accent'}`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link to="/dashboard">
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
