import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn, resetPassword } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMode) {
        await resetPassword(formData.email);
        toast({
          title: 'Success',
          description: 'Password reset email sent. Check your inbox.',
        });
        setResetMode(false);
      } else {
        await signIn(formData.email, formData.password);
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
        });
        setLocation('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Try again later.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {resetMode ? 'Reset Password' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {resetMode 
              ? 'Enter your email to receive a password reset link'
              : 'Sign in to your restaurant account'
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            
            {!resetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? (resetMode ? 'Sending...' : 'Signing In...') 
                : (resetMode ? 'Send Reset Link' : 'Sign In')
              }
            </Button>
            
            {!resetMode && (
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                Forgot password?
              </button>
            )}
            
            {resetMode && (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                Back to sign in
              </button>
            )}
            
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setLocation('/signup')}
                className="text-primary hover:underline"
                disabled={loading}
              >
                Sign Up
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
