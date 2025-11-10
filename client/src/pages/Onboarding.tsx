import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route?: string;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    if (!userData?.restaurantId) {
      setLocation('/restaurant-wizard');
      return;
    }

    const restaurantRef = ref(database, `restaurants/${userData.restaurantId}`);
    
    const unsubscribe = onValue(restaurantRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRestaurant(data);
        
        // Calculate onboarding steps
        const onboardingSteps: OnboardingStep[] = [
          {
            id: 'basic-info',
            title: 'Restaurant Created',
            description: 'Basic restaurant information set up',
            completed: true,
          },
          {
            id: 'address',
            title: 'Add Address',
            description: 'Set your restaurant location and contact details',
            completed: !!(data.address?.street && data.address?.city),
            route: '/settings/restaurant',
          },
          {
            id: 'hours',
            title: 'Set Operating Hours',
            description: 'Configure when your restaurant is open',
            completed: false, // Check branches for hours
            route: '/settings/branches',
          },
          {
            id: 'logo',
            title: 'Upload Logo',
            description: 'Add your restaurant branding',
            completed: !!data.logoUrl,
            route: '/settings/restaurant',
          },
          {
            id: 'tax',
            title: 'Configure Tax Settings',
            description: 'Set up GST/tax information (optional)',
            completed: !!data.gstin,
            route: '/settings/restaurant',
          },
          {
            id: 'staff',
            title: 'Invite Staff',
            description: 'Add your team members',
            completed: false, // Would need to check restaurantUsers count
            route: '/staff',
          },
        ];
        
        setSteps(onboardingSteps);
      }
    });

    return () => off(restaurantRef);
  }, [userData?.restaurantId]);

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  const handleStepClick = (step: OnboardingStep) => {
    if (step.route) {
      setLocation(step.route);
    }
  };

  const handleSkip = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Welcome to SmartChefOS! 🎉</CardTitle>
            <CardDescription>
              Let's get your restaurant set up. Complete these steps to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Setup Progress</span>
                <span className="text-muted-foreground">
                  {completedCount} of {steps.length} completed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    step.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => !step.completed && handleStepClick(step)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {step.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold mt-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                  
                  {!step.completed && step.route && (
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSkip} variant="outline" className="flex-1">
                Skip for Now
              </Button>
              {completedCount === steps.length && (
                <Button onClick={() => setLocation('/')} className="flex-1">
                  Go to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check out our documentation or contact support if you need assistance.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Docs
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
