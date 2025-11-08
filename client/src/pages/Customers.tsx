import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const handleCreateOrder = (customerId: string, name: string) => {
    toast({ 
      description: `Creating order for ${name}` 
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

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

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No customers found. Add your first customer to get started!
          </div>
        ) : (
          <div className="bg-card rounded-2xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">Name</th>
                  <th className="text-left p-4 font-semibold text-sm">Phone</th>
                  <th className="text-left p-4 font-semibold text-sm">Last Visit</th>
                  <th className="text-left p-4 font-semibold text-sm">Lifetime Value</th>
                  <th className="text-left p-4 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
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
                      <Badge variant="secondary" className="rounded-md">
                        {customer.lastVisit 
                          ? formatDistanceToNow(new Date(customer.lastVisit), { addSuffix: true })
                          : 'Never'
                        }
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold tabular-nums" data-testid={`text-ltv-${customer.id}`}>
                        ₹{parseFloat(customer.lifetimeValue || '0').toFixed(2)}
                      </p>
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
        )}
      </div>
    </div>
  );
}
