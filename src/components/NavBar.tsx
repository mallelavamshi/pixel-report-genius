
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, Settings, LogIn, UserPlus, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import ApiKeyManager from '@/components/ApiKeyManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('userRole') === 'admin');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('userLoggedIn') === 'true');
  const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signUpDialogOpen, setSignUpDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');

  // Update login state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('userLoggedIn') === 'true');
      setIsAdmin(localStorage.getItem('userRole') === 'admin');
      setUserEmail(localStorage.getItem('userEmail') || '');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const handleLogin = () => {
    // Validate form
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // For demonstration purposes, we'll simulate a login by setting a localStorage value
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userTier', 'basic');
    localStorage.setItem('userEmail', email);
    
    setIsLoggedIn(true);
    setUserEmail(email);
    setLoginDialogOpen(false);
    toast.success('Successfully logged in!');
    
    // Clear form
    setEmail('');
    setPassword('');
    
    // Navigate to tasks
    navigate('/tasks');
  };

  const handleSignUp = () => {
    // Validate form
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // For demonstration purposes, we'll simulate a signup by setting a localStorage value
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', 'user');
    localStorage.setItem('userTier', 'free');
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    
    setIsLoggedIn(true);
    setUserEmail(email);
    setSignUpDialogOpen(false);
    toast.success('Account created successfully!');
    
    // Clear form
    setName('');
    setEmail('');
    setPassword('');
    
    // Navigate to tasks
    navigate('/tasks');
  };

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userTier');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    setIsLoggedIn(false);
    setUserEmail('');
    toast.success('Successfully logged out!');
    
    // Navigate to home
    navigate('/');
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
              {isLoggedIn && (
                <>
                  <Link to="/tasks" className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/tasks' ? 'font-medium text-primary' : ''}`}>
                    Tasks
                  </Link>
                  <Link to="/dashboard" className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/dashboard' ? 'font-medium text-primary' : ''}`}>
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={`text-gray-600 hover:text-gray-900 ${location.pathname === '/admin' ? 'font-medium text-primary' : ''}`}>
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
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
                
                <div className="text-sm font-medium mr-2">
                  {userEmail}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className={isAdmin ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
                  onClick={toggleAdminRole}
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
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLoginDialogOpen(true)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setSignUpDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </>
            )}
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
      
      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login to your account</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleLogin}>
              Login
            </Button>
          </DialogFooter>
          <div className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <button
              className="text-primary underline"
              onClick={() => {
                setLoginDialogOpen(false);
                setSignUpDialogOpen(true);
              }}
            >
              Sign up
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Sign Up Dialog */}
      <Dialog open={signUpDialogOpen} onOpenChange={setSignUpDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create an account</DialogTitle>
            <DialogDescription>
              Enter your details to create a new account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignUpDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSignUp}>
              Sign Up
            </Button>
          </DialogFooter>
          <div className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <button
              className="text-primary underline"
              onClick={() => {
                setSignUpDialogOpen(false);
                setLoginDialogOpen(true);
              }}
            >
              Login
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default NavBar;
