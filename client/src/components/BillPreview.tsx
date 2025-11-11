import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download } from "lucide-react";

interface BillItem {
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Tax {
  name: string;
  rate: number;
  amount: number;
}

interface BillPreviewProps {
  template?: "standard" | "compact" | "detailed" | "minimal";
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantEmail?: string;
  logoUrl?: string;
  billNumber?: string;
  date?: string;
  tableNumber?: string;
  serverName?: string;
  items?: BillItem[];
  subtotal?: number;
  taxes?: Tax[];
  discount?: number;
  serviceCharge?: number;
  packagingCharge?: number;
  total?: number;
  headerText?: string;
  footerText?: string;
  specialNotes?: string;
  showLogo?: boolean;
  showQRCode?: boolean;
  paymentMethod?: string;
  fssaiNumber?: string;
  gstNumber?: string;
}

export function BillPreview({
  template = "standard",
  restaurantName = "My Restaurant",
  restaurantAddress = "123 Main Street, City, State 12345",
  restaurantPhone = "+1 234-567-8900",
  restaurantEmail = "info@restaurant.com",
  logoUrl,
  billNumber = "001",
  date = new Date().toLocaleDateString(),
  tableNumber = "12",
  serverName = "John Doe",
  items = [
    { name: "Paneer Tikka", quantity: 2, rate: 250, amount: 500 },
    { name: "Butter Naan", quantity: 4, rate: 40, amount: 160 },
    { name: "Dal Makhani", quantity: 1, rate: 180, amount: 180 },
  ],
  subtotal = 840,
  taxes = [
    { name: "CGST @2.5%", rate: 2.5, amount: 21 },
    { name: "SGST @2.5%", rate: 2.5, amount: 21 },
  ],
  discount = 0,
  serviceCharge = 42,
  packagingCharge = 0,
  total = 924,
  headerText = "Thank you for dining with us!",
  footerText = "Visit us again!",
  specialNotes = "Please check the bill before making payment.",
  showLogo = true,
  showQRCode = false,
  paymentMethod = "Cash",
  fssaiNumber = "11516004000575",
  gstNumber = "27AAFHK4833E1ZC",
}: BillPreviewProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Convert to PDF logic would go here
    alert("Download functionality - would generate PDF");
  };

  // Standard Template (like Dhaba bill)
  const StandardTemplate = () => (
    <div className="bg-white text-black p-6 max-w-sm mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4">
        {showLogo && logoUrl && (
          <img src={logoUrl} alt="Logo" className="w-20 h-20 mx-auto mb-2" />
        )}
        <h1 className="text-2xl font-bold tracking-wider">{restaurantName}</h1>
        <p className="text-xs mt-2 whitespace-pre-line">{restaurantAddress}</p>
        <p className="text-xs">{restaurantPhone}</p>
        {gstNumber && <p className="text-xs mt-1">GSTIN: {gstNumber}</p>}
        {fssaiNumber && <p className="text-xs">FSSAI: {fssaiNumber}</p>}
      </div>

      <div className="border-t-2 border-b-2 border-dashed border-black py-2 my-3">
        <p className="text-center font-bold">TAX INVOICE</p>
      </div>

      {/* Bill Details */}
      <div className="text-xs mb-3">
        <div className="flex justify-between">
          <span>Bill No: {billNumber}</span>
          <span>Table: {tableNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date: {date}</span>
          <span>Time: {new Date().toLocaleTimeString()}</span>
        </div>
        {serverName && <p>Server: {serverName}</p>}
      </div>

      <div className="border-t border-b border-black py-1 mb-2">
        <div className="flex justify-between font-bold text-xs">
          <span className="flex-1">Item</span>
          <span className="w-12 text-center">Qty</span>
          <span className="w-16 text-right">Rate</span>
          <span className="w-16 text-right">Amount</span>
        </div>
      </div>

      {/* Items */}
      <div className="mb-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-xs mb-1">
            <span className="flex-1">{item.name}</span>
            <span className="w-12 text-center">{item.quantity}</span>
            <span className="w-16 text-right">{item.rate.toFixed(2)}</span>
            <span className="w-16 text-right">{item.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black pt-2 mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Sub Total:</span>
          <span className="font-bold">{subtotal.toFixed(2)}</span>
        </div>
        
        {taxes.map((tax, index) => (
          <div key={index} className="flex justify-between text-xs mb-1">
            <span>{tax.name}:</span>
            <span>{tax.amount.toFixed(2)}</span>
          </div>
        ))}

        {discount > 0 && (
          <div className="flex justify-between text-xs mb-1">
            <span>Discount:</span>
            <span>-{discount.toFixed(2)}</span>
          </div>
        )}

        {serviceCharge > 0 && (
          <div className="flex justify-between text-xs mb-1">
            <span>Service Charge:</span>
            <span>{serviceCharge.toFixed(2)}</span>
          </div>
        )}

        {packagingCharge > 0 && (
          <div className="flex justify-between text-xs mb-1">
            <span>Packaging:</span>
            <span>{packagingCharge.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="border-t-2 border-b-2 border-black py-2 mb-3">
        <div className="flex justify-between font-bold">
          <span>Grand Total:</span>
          <span className="text-lg">₹ {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mb-2">
        <p className="italic">{headerText}</p>
      </div>

      {specialNotes && (
        <div className="text-xs border-t border-dashed border-black pt-2 mb-2">
          <p className="whitespace-pre-line">{specialNotes}</p>
        </div>
      )}

      <div className="text-center text-xs">
        <p className="font-bold">{footerText}</p>
        {paymentMethod && <p className="mt-1">Payment: {paymentMethod}</p>}
      </div>

      {showQRCode && (
        <div className="flex justify-center mt-3">
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-xs">
            QR Code
          </div>
        </div>
      )}
    </div>
  );

  // Compact Template (like Quick Stops bill)
  const CompactTemplate = () => (
    <div className="bg-white text-black p-4 max-w-xs mx-auto font-mono text-xs">
      <div className="text-center mb-3">
        <h1 className="text-lg font-bold uppercase tracking-wide">{restaurantName}</h1>
        <p className="text-xs mt-1">{restaurantAddress}</p>
        <p className="text-xs">{restaurantPhone}</p>
      </div>

      <div className="border-y border-black py-1 my-2 text-center">
        <p className="font-bold">BILL NO: {billNumber}</p>
        <p>Table: {tableNumber} | {date}</p>
      </div>

      <div className="mb-2">
        <div className="flex justify-between font-bold border-b border-black pb-1">
          <span>QTY ITEM</span>
          <span>AMT</span>
        </div>
        {items.map((item, index) => (
          <div key={index} className="py-1">
            <div className="flex justify-between">
              <span>{item.quantity} {item.name}</span>
              <span>{item.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-black pt-2">
        <div className="flex justify-between">
          <span>SUB TOTAL:</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        {taxes.map((tax, index) => (
          <div key={index} className="flex justify-between">
            <span>{tax.name}:</span>
            <span>Rs. {tax.amount.toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-sm mt-2 border-t border-black pt-1">
          <span>TOTAL:</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mt-3 text-xs">
        <p>{footerText}</p>
        {fssaiNumber && <p className="mt-1">FSSAI: {fssaiNumber}</p>}
      </div>
    </div>
  );

  // Detailed Template (like Apoorva Delicacies)
  const DetailedTemplate = () => (
    <div className="bg-white text-black p-6 max-w-sm mx-auto font-mono text-sm">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-widest uppercase">{restaurantName}</h1>
        <p className="text-xs mt-1">{restaurantAddress.split(',')[0]}</p>
        <p className="text-xs">{restaurantAddress.split(',').slice(1).join(',')}</p>
        <div className="border-y border-dashed border-black my-2 py-1">
          <p className="font-bold">TAX INVOICE</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs">
          <span>Date: {date}</span>
          <span>Bill No.: {billNumber}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>PBoy: {serverName || 'COUNTER'}</span>
        </div>
      </div>

      <div className="border-y border-dashed border-black py-2 mb-2">
        <div className="flex justify-between font-bold text-xs">
          <span className="flex-1">Particulars</span>
          <span className="w-12 text-center">Qty</span>
          <span className="w-16 text-right">Rate</span>
          <span className="w-20 text-right">Amount</span>
        </div>
      </div>

      {items.map((item, index) => (
        <div key={index} className="flex justify-between text-xs mb-1">
          <span className="flex-1 uppercase">{item.name}</span>
          <span className="w-12 text-center">{item.quantity}</span>
          <span className="w-16 text-right">{item.rate}</span>
          <span className="w-20 text-right">{item.amount.toFixed(2)}</span>
        </div>
      ))}

      <div className="border-t border-dashed border-black mt-2 pt-2">
        <div className="flex justify-between text-xs">
          <span>Sub Total:</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        {taxes.map((tax, index) => (
          <div key={index} className="flex justify-between text-xs">
            <span>{tax.name}:</span>
            <span>{tax.amount.toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-black mt-2 pt-2">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span className="text-lg">{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {fssaiNumber && (
        <div className="text-xs mt-3">
          <p>FSSAI NO - {fssaiNumber}</p>
        </div>
      )}

      <div className="text-center text-xs mt-3">
        <p>{footerText}</p>
      </div>

      {specialNotes && (
        <div className="border-t border-black mt-4 pt-3 text-xs">
          <p className="uppercase whitespace-pre-line">{specialNotes}</p>
        </div>
      )}
    </div>
  );

  // Minimal Template
  const MinimalTemplate = () => (
    <div className="bg-white text-black p-6 max-w-sm mx-auto text-sm">
      <div className="text-center mb-6">
        {showLogo && logoUrl && (
          <img src={logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-3" />
        )}
        <h1 className="text-2xl font-bold">{restaurantName}</h1>
        <p className="text-xs text-gray-600 mt-2">{restaurantAddress}</p>
        <p className="text-xs text-gray-600">{restaurantPhone}</p>
      </div>

      <div className="flex justify-between text-xs mb-4 pb-2 border-b">
        <span>#{billNumber}</span>
        <span>{date}</span>
      </div>

      <div className="mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between mb-2">
            <div className="flex-1">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-500 ml-2">x{item.quantity}</span>
            </div>
            <span className="font-medium">₹{item.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {taxes.map((tax, index) => (
          <div key={index} className="flex justify-between text-xs text-gray-600">
            <span>{tax.name}</span>
            <span>₹{tax.amount.toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mt-6 text-xs text-gray-600">
        <p>{footerText}</p>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (template) {
      case "compact":
        return <CompactTemplate />;
      case "detailed":
        return <DetailedTemplate />;
      case "minimal":
        return <MinimalTemplate />;
      default:
        return <StandardTemplate />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end print:hidden">
        <Button variant="outline" onClick={handlePrint} className="rounded-xl">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownload} className="rounded-xl">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Bill Preview */}
      <Card className="overflow-hidden">
        {renderTemplate()}
      </Card>
    </div>
  );
}
