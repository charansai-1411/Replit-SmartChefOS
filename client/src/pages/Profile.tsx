import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, User, Phone, MapPin, Utensils, Mail } from "lucide-react";

const updateProfileSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required").optional(),
  ownerName: z.string().min(1, "Owner name is required").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  address: z.string().min(1, "Address is required").optional(),
  cuisine: z.string().min(1, "Cuisine type is required").optional(),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

interface OwnerProfile {
  id: string;
  email: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  address: string;
  cuisine: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<OwnerProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      return response.json();
    },
  });

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: profile ? {
      restaurantName: profile.restaurantName,
      ownerName: profile.ownerName,
      phone: profile.phone,
      address: profile.address,
      cuisine: profile.cuisine,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileFormData) => {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Update failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restaurant Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your restaurant information and settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your restaurant at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Utensils className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Cuisine Type</p>
                <p className="text-sm text-muted-foreground">{profile?.cuisine}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{profile?.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>
            Update your restaurant and owner information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName">
                  <User className="w-4 h-4 inline mr-2" />
                  Owner Name
                </Label>
                <Input
                  id="ownerName"
                  placeholder="John Doe"
                  {...form.register("ownerName")}
                />
                {form.formState.errors.ownerName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.ownerName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurantName">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Restaurant Name
                </Label>
                <Input
                  id="restaurantName"
                  placeholder="My Restaurant"
                  {...form.register("restaurantName")}
                />
                {form.formState.errors.restaurantName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.restaurantName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1234567890"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">
                  <Utensils className="w-4 h-4 inline mr-2" />
                  Cuisine Type
                </Label>
                <Input
                  id="cuisine"
                  placeholder="Italian, Indian, etc."
                  {...form.register("cuisine")}
                />
                {form.formState.errors.cuisine && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.cuisine.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                {...form.register("address")}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
