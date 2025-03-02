
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ApiKeyManager from '@/components/ApiKeyManager';
import { useAuth } from '@/contexts/AuthContext';

const CustomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, signOut } = useAuth();
  const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
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
              <Link 
                to="/tasks" 
                className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/tasks' ? 'font-medium text-primary' : ''}`}
              >
                Tasks
              </Link>
              <Link 
                to="/dashboard" 
                className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/dashboard' ? 'font-medium text-primary' : ''}`}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/admin' ? 'font-medium text-primary' : ''}`}
                >
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setApiKeyManagerOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                API Settings
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              className={isAdmin ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
            >
              {isAdmin ? <ShieldCheck className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
              {isAdmin ? 'Admin Mode' : 'User Mode'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {isAdmin && (
        <ApiKeyManager
          open={apiKeyManagerOpen}
          onOpenChange={setApiKeyManagerOpen}
          adminMode={isAdmin}
        />
      )}
    </header>
  );
};

export default CustomNavBar;
