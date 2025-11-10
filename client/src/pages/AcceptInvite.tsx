import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptInvite() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { user, acceptInvite } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  const restaurantId = searchParams.get('rid');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!restaurantId || !token) {
      setStatus('error');
      setMessage('Invalid invite link');
      return;
    }

    // If user is not logged in, redirect to login with return URL
    if (!user) {
      const returnUrl = `/accept-invite?rid=${restaurantId}&token=${token}`;
      setLocation(`/login?return=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Auto-accept invite if user is logged in
    handleAcceptInvite();
  }, [user, restaurantId, token]);

  const handleAcceptInvite = async () => {
    if (!restaurantId || !token) return;

    setLoading(true);

    try {
      const result = await acceptInvite(restaurantId, token);
      
      setStatus('success');
      setMessage('Successfully joined the restaurant!');
      
      toast({
        title: 'Success',
        description: 'You have joined the restaurant team',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    } catch (error: any) {
      console.error('Accept invite error:', error);
      
      setStatus('error');
      let errorMessage = 'Failed to accept invite';
      
      if (error.message.includes('not found')) {
        errorMessage = 'Invite not found or invalid';
      } else if (error.message.includes('expired')) {
        errorMessage = 'This invite has expired';
      } else if (error.message.includes('already used')) {
        errorMessage = 'This invite has already been used';
      } else if (error.message.includes('another restaurant')) {
        errorMessage = 'You already belong to another restaurant';
      }
      
      setMessage(errorMessage);
      
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Restaurant Invite</CardTitle>
          <CardDescription>
            {loading && 'Processing your invitation...'}
            {status === 'success' && 'Invitation accepted!'}
            {status === 'error' && 'Unable to accept invitation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8">
            {loading && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                <p className="text-center text-lg font-medium">{message}</p>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Redirecting to dashboard...
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-red-600 mb-4" />
                <p className="text-center text-lg font-medium">{message}</p>
                <Button
                  onClick={() => setLocation('/')}
                  className="mt-4"
                >
                  Go to Home
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
