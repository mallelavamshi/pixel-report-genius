import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, Settings } from 'lucide-react';
import { toast } from 'sonner';
import ApiKeyManager from '@/components/ApiKeyManager';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('userRole') === 'admin');
  const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);

  // Toggle admin role (for demo purposes only)
  const toggleAdminRole = () => {
    const newRole = isAdmin ? 'user' : 'admin';
    localStorage.setItem('userRole', newRole);
    setIsAdmin(!isAdmin);
    toast.success(`You are now logged in as ${newRole}`);
    
    // Redirect to appropriate dashboard
    if (newRole === 'admin' && !location.pathname.includes('/admin')) {
      navigate('/admin');
    } else if (newRole === 'user' && location.pathname.includes('/admin')) {
      navigate('/dashboard');
    }
  };

  return (
    <header className="fixed w-full bg-white z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Image Analysis Platform
            </Link>
            
            <nav className="ml-10 space-x-4 hidden md:flex">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setApiKeyManagerOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              API Settings
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className={isAdmin ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
              onClick={toggleAdminRole}
            >
              {isAdmin ? <ShieldCheck className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
              {isAdmin ? 'Admin Mode' : 'User Mode'}
            </Button>
          </div>
        </div>
      </div>
      
      <ApiKeyManager
        open={apiKeyManagerOpen}
        onOpenChange={setApiKeyManagerOpen}
        adminMode={isAdmin}
      />
    </header>
  );
};

export default NavBar;
