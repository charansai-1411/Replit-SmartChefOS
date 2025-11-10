import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { ChefHat, ArrowRight, Loader2 } from 'lucide-react';

const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', timezone: 'Asia/Kolkata' },
  { code: 'US', name: 'United States', currency: 'USD', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London' },
  { code: 'AU', name: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney' },
  { code: 'CA', name: 'Canada', currency: 'CAD', timezone: 'America/Toronto' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', timezone: 'Asia/Singapore' },
  { code: 'AE', name: 'UAE', currency: 'AED', timezone: 'Asia/Dubai' },
];

export default function RestaurantWizard() {
  const [, setLocation] = useLocation();
  const { createRestaurant, userData, user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    country: 'IN',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    ownerName: user?.displayName || '',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if user already has a restaurant
  if (userData?.restaurantId) {
    setLocation('/');
    return null;
  }

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setFormData({
        ...formData,
        country: country.code,
        currency: country.currency,
        timezone: country.timezone,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.name.length < 3) {
      toast({
        title: 'Error',
        description: 'Restaurant name must be at least 3 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await createRestaurant({
        name: formData.name,
        country: formData.country,
        currency: formData.currency,
        timezone: formData.timezone,
        ownerName: formData.ownerName,
      });

      toast({
        title: 'Success',
        description: 'Restaurant created successfully!',
      });

      // Redirect to onboarding checklist
      setLocation('/onboarding');
    } catch (error: any) {
      console.error('Restaurant creation error:', error);
      
      let errorMessage = 'Failed to create restaurant';
      if (error.message) {
        errorMessage = error.message;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ChefHat className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Create Your Restaurant</CardTitle>
          <CardDescription>
            Let's set up your restaurant profile. You can add more details later.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Your Name</Label>
              <Input
                id="ownerName"
                type="text"
                placeholder="John Doe"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="The Golden Spoon"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed to your customers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  type="text"
                  value={formData.currency}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  type="text"
                  value={formData.timezone}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Next steps:</strong> After creating your restaurant, you'll be able to:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                <li>Add your restaurant address and contact details</li>
                <li>Set operating hours</li>
                <li>Upload your logo</li>
                <li>Invite staff members</li>
                <li>Configure tax and payment settings</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Restaurant...
                </>
              ) : (
                <>
                  Create Restaurant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
