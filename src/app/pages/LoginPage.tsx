import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, UserRole } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Logo from '../components/Logo';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const success = login(email, password, role);

    if (success) {
      toast.success('Login successful!', { duration: 3000 });
      if (role === 'student') {
        navigate('/student-dashboard');
      } else if (role === 'mentor') {
        navigate('/mentor-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      }
    } else {
      toast.error('Invalid credentials. Please try again.', { duration: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Button>

        <Card className="shadow-lg border-gray-200">
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!showAdminLogin ? (
              <>
                <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-6">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="mentor">Mentor</TabsTrigger>
                  </TabsList>
                </Tabs>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={`Enter your ${role} email`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  {role === 'mentor' && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Sign In
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-3">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Admin Access
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <ArrowLeft className="size-3" />
                    Back to Login
                  </button>
                </div>

                <form onSubmit={(e) => { setRole('admin'); handleLogin(e); }} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Admin Sign In
                  </Button>
                </form>
              </>
            )}

            {/* Demo Credentials */}
            <div className="mt-6 p-3 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Student:</strong> rahul@student.edu</p>
                <p><strong>Mentor:</strong> suresh@mentor.edu / mentor123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
