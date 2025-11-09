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
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <div className="bg-primary text-primary-foreground p-2 rounded-t-2xl flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] opacity-90 leading-tight">Table No</p>
            <p className="text-lg font-bold tabular-nums leading-tight" data-testid="text-table-number">#{tableNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-90 leading-tight">Order</p>
            <p className="text-sm font-semibold leading-tight">#F0030</p>
          </div>
        </div>
        <p className="text-[10px] mt-0.5 opacity-90 leading-tight">{guests} People</p>
      </div>

      <div className="p-2 flex-1 flex flex-col overflow-hidden min-h-0">
        <h3 className="font-semibold mb-1.5 text-xs flex items-center gap-1.5">
          <span>Ordered Items</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{items.reduce((sum, item) => sum + item.quantity, 0)}</Badge>
        </h3>
        
        <div className="space-y-1 flex-1 overflow-y-auto mb-2 pr-1 custom-scrollbar min-h-0">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No items added yet</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-1.5 items-start py-0.5" data-testid={`cart-item-${item.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[11px] leading-tight truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground tabular-nums leading-tight">₹{item.price.toFixed(2)}</p>
                  {item.notes && <p className="text-[10px] text-muted-foreground italic truncate leading-tight">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-5 w-5 p-0"
                    onClick={() => onUpdateQuantity?.(item.id, item.quantity - 1)}
                    data-testid={`button-cart-decrease-${item.id}`}
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </Button>
                  <span className="w-4 text-center text-[11px] font-semibold tabular-nums leading-tight" data-testid={`text-cart-quantity-${item.id}`}>
                    {item.quantity}
                  </span>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-5 w-5 p-0"
                    onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                    data-testid={`button-cart-increase-${item.id}`}
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-5 w-5 p-0 text-destructive"
                    onClick={() => onRemoveItem?.(item.id)}
                    data-testid={`button-cart-remove-${item.id}`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
                <p className="font-semibold text-[11px] tabular-nums w-12 text-right leading-tight flex-shrink-0" data-testid={`text-cart-total-${item.id}`}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        <Separator className="my-2" />

        <div className="space-y-1 text-[11px] flex-shrink-0">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold tabular-nums" data-testid="text-subtotal">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (5%)</span>
            <span className="font-semibold tabular-nums">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service (10%)</span>
            <span className="font-semibold tabular-nums">₹{serviceCharge.toFixed(2)}</span>
          </div>
          <Input 
            placeholder="Discount code" 
            className="mt-1.5 rounded-xl h-7 text-[11px] px-2"
            data-testid="input-discount"
          />
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between items-center mb-2 flex-shrink-0">
          <span className="font-semibold text-sm">Total Payable</span>
          <span className="font-bold text-lg tabular-nums" data-testid="text-total">₹{total.toFixed(2)}</span>
        </div>

        <div className="space-y-1.5 flex-shrink-0">
          <p className="text-[11px] font-medium mb-0.5">Payment Method</p>
          <div className="grid grid-cols-3 gap-1">
            <Button variant="outline" className="rounded-xl hover-elevate active-elevate-2 h-7 text-[10px] px-1.5" data-testid="button-cash">
              <Banknote className="w-2.5 h-2.5 mr-0.5" />
              Cash
            </Button>
            <Button variant="outline" className="rounded-xl hover-elevate active-elevate-2 h-7 text-[10px] px-1.5" data-testid="button-card">
              <CreditCard className="w-2.5 h-2.5 mr-0.5" />
              Card
            </Button>
            <Button variant="outline" className="rounded-xl hover-elevate active-elevate-2 h-7 text-[10px] px-1.5" data-testid="button-scan">
              <QrCode className="w-2.5 h-2.5 mr-0.5" />
              Scan
            </Button>
          </div>
        </div>

        <div className="mt-2 space-y-1.5 flex-shrink-0">
          <Button 
            className="w-full rounded-xl h-8 text-xs" 
            size="sm"
            onClick={onPlaceOrder}
            data-testid="button-place-order"
          >
            Place Order
          </Button>
          <div className="grid grid-cols-2 gap-1.5">
            <Button variant="outline" className="rounded-xl h-7 text-[10px]" data-testid="button-print">
              Print Bill
            </Button>
            <Button variant="outline" className="rounded-xl h-7 text-[10px]" data-testid="button-kot">
              Send to Kitchen
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
