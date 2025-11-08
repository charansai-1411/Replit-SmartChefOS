import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const mockCustomers = [
  { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', lastVisit: '2 days ago', lifetimeValue: '₹45,000', favorites: 'Paneer Butter Masala, Dal Makhani' },
  { id: '2', name: 'Priya Sharma', phone: '+91 98765 43211', lastVisit: '1 week ago', lifetimeValue: '₹32,000', favorites: 'Chicken Biryani, Butter Chicken' },
  { id: '3', name: 'Amit Patel', phone: '+91 98765 43212', lastVisit: '3 days ago', lifetimeValue: '₹28,500', favorites: 'Masala Dosa, Gulab Jamun' },
  { id: '4', name: 'Sneha Reddy', phone: '+91 98765 43213', lastVisit: 'Today', lifetimeValue: '₹52,000', favorites: 'Vegetable Korma, Paneer Tikka' },
  { id: '5', name: 'Vikram Singh', phone: '+91 98765 43214', lastVisit: '5 days ago', lifetimeValue: '₹38,200', favorites: 'Chicken Tikka, Biryani' },
];

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleCreateOrder = (customerId: string, name: string) => {
    toast({ 
      description: `Creating order for ${name}` 
    });
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customers</h1>
          <Button className="rounded-xl" data-testid="button-add-customer">
            <Plus className="w-4 h-4 mr-2" />
            Add New Customer
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
            data-testid="input-search-customers"
          />
        </div>

        <div className="bg-card rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">Name</th>
                <th className="text-left p-4 font-semibold text-sm">Phone</th>
                <th className="text-left p-4 font-semibold text-sm">Last Visit</th>
                <th className="text-left p-4 font-semibold text-sm">Lifetime Value</th>
                <th className="text-left p-4 font-semibold text-sm">Favorites</th>
                <th className="text-left p-4 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="border-t hover-elevate"
                  data-testid={`row-customer-${customer.id}`}
                >
                  <td className="p-4">
                    <p className="font-medium" data-testid={`text-customer-name-${customer.id}`}>{customer.name}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground tabular-nums">{customer.phone}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="rounded-md">{customer.lastVisit}</Badge>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold tabular-nums" data-testid={`text-ltv-${customer.id}`}>{customer.lifetimeValue}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-muted-foreground">{customer.favorites}</p>
                  </td>
                  <td className="p-4">
                    <Button 
                      size="sm" 
                      className="rounded-xl"
                      onClick={() => handleCreateOrder(customer.id, customer.name)}
                      data-testid={`button-create-order-${customer.id}`}
                    >
                      Create Order
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
