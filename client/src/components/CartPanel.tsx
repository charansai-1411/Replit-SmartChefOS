import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, CreditCard, Banknote, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartPanelProps {
  items: CartItem[];
  tableNumber?: string;
  guests?: number;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  onPlaceOrder?: () => void;
}

export function CartPanel({ items, tableNumber = "04", guests = 2, onUpdateQuantity, onRemoveItem, onPlaceOrder }: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const serviceCharge = subtotal * 0.10;
  const total = subtotal + tax + serviceCharge;

  return (
    <Card className="w-full max-w-md h-fit sticky top-4 overflow-hidden">
      <div className="bg-primary text-primary-foreground p-4 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Table No</p>
            <p className="text-2xl font-bold tabular-nums" data-testid="text-table-number">#{tableNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Order</p>
            <p className="text-xl font-semibold">#F0030</p>
          </div>
        </div>
        <p className="text-sm mt-2 opacity-90">{guests} People</p>
      </div>

      <div className="p-4">
        <h3 className="font-semibold mb-3">Ordered Items <Badge variant="secondary" className="ml-2">{items.reduce((sum, item) => sum + item.quantity, 0)}</Badge></h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No items added yet</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3" data-testid={`cart-item-${item.id}`}>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">₹{item.price.toFixed(2)}</p>
                  {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity?.(item.id, item.quantity - 1)}
                    data-testid={`button-cart-decrease-${item.id}`}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center font-semibold tabular-nums" data-testid={`text-cart-quantity-${item.id}`}>
                    {item.quantity}
                  </span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                    data-testid={`button-cart-increase-${item.id}`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 text-destructive"
                    onClick={() => onRemoveItem?.(item.id)}
                    data-testid={`button-cart-remove-${item.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="font-semibold tabular-nums w-16 text-right" data-testid={`text-cart-total-${item.id}`}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold tabular-nums" data-testid="text-subtotal">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span className="font-semibold tabular-nums">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service Charge (10%)</span>
            <span className="font-semibold tabular-nums">₹{serviceCharge.toFixed(2)}</span>
          </div>
          <Input 
            placeholder="Discount code" 
            className="mt-2 rounded-xl"
            data-testid="input-discount"
          />
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">Total Payable</span>
          <span className="font-bold text-2xl tabular-nums" data-testid="text-total">₹{total.toFixed(2)}</span>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium mb-2">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="rounded-xl hover-elevate active-elevate-2" data-testid="button-cash">
              <Banknote className="w-4 h-4 mr-1" />
              Cash
            </Button>
            <Button variant="outline" className="rounded-xl hover-elevate active-elevate-2" data-testid="button-card">
              <CreditCard className="w-4 h-4 mr-1" />
              Card
            </Button>
            <Button variant="outline" className="rounded-xl hover-elevate active-elevate-2" data-testid="button-scan">
              <QrCode className="w-4 h-4 mr-1" />
              Scan
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Button 
            className="w-full rounded-xl" 
            size="default"
            onClick={onPlaceOrder}
            data-testid="button-place-order"
          >
            Place Order
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl" data-testid="button-print">
              Print Bill
            </Button>
            <Button variant="outline" className="rounded-xl" data-testid="button-kot">
              Send to Kitchen
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
