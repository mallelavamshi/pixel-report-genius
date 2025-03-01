
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash, Edit, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

type Plan = {
  id: string;
  name: string;
  price: number;
  imageLimit: number;
  description: string;
};

// Mock data - in a real app, this would come from a database
const initialPlans: Plan[] = [
  { id: '1', name: 'Basic', price: 0, imageLimit: 5, description: 'Free tier with limited images' },
  { id: '2', name: 'Pro', price: 19.99, imageLimit: 50, description: 'Professional tier with more images' },
  { id: '3', name: 'Enterprise', price: 99.99, imageLimit: 1000, description: 'Enterprise tier with unlimited features' },
];

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState<Omit<Plan, 'id'>>({
    name: '',
    price: 0,
    imageLimit: 10,
    description: '',
  });

  const handleAddPlan = () => {
    if (!newPlan.name) {
      toast.error('Plan name is required');
      return;
    }

    const planToAdd: Plan = {
      id: Date.now().toString(),
      ...newPlan,
    };

    setPlans([...plans, planToAdd]);
    setNewPlan({
      name: '',
      price: 0,
      imageLimit: 10,
      description: '',
    });
    setIsAddingPlan(false);
    toast.success('Subscription plan added successfully');
  };

  const handleDeletePlan = (id: string) => {
    setPlans(plans.filter(plan => plan.id !== id));
    toast.success('Subscription plan removed successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
        <Button onClick={() => setIsAddingPlan(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="border rounded-md">
        <div className="grid grid-cols-6 font-medium p-3 border-b bg-muted/50">
          <div>Name</div>
          <div>Price</div>
          <div>Image Limit</div>
          <div className="col-span-2">Description</div>
          <div>Actions</div>
        </div>
        {plans.map((plan) => (
          <div key={plan.id} className="grid grid-cols-6 p-3 border-b last:border-b-0 items-center">
            <div>{plan.name}</div>
            <div>${plan.price.toFixed(2)}</div>
            <div>{plan.imageLimit}</div>
            <div className="col-span-2 truncate">{plan.description}</div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/90" onClick={() => handleDeletePlan(plan.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isAddingPlan} onOpenChange={setIsAddingPlan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subscription Plan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageLimit" className="text-right">
                Image Limit
              </Label>
              <Input
                id="imageLimit"
                type="number"
                value={newPlan.imageLimit}
                onChange={(e) => setNewPlan({ ...newPlan, imageLimit: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddingPlan(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddPlan}>
              Add Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlans;
