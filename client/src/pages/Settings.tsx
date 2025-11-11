import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { BillPreview } from "@/components/BillPreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Volume2,
  Globe,
  User,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  Shield,
  Database,
  Palette,
  Zap,
  Receipt,
  FileText,
  Percent,
  Package,
  Upload,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";

type SettingsSection = "sound" | "notifications" | "language" | "appearance" | "billing" | "security" | "profile";

export default function Settings() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<SettingsSection>("sound");
  const [showBillPreview, setShowBillPreview] = useState(false);

  // Sound Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([75]);
  const [orderAlertSound, setOrderAlertSound] = useState(true);
  const [paymentSound, setPaymentSound] = useState(true);

  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newOrderNotif, setNewOrderNotif] = useState(true);
  const [lowStockNotif, setLowStockNotif] = useState(true);
  const [customerNotif, setCustomerNotif] = useState(false);

  // Language & Regional Settings
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [currency, setCurrency] = useState("USD");

  // Appearance Settings
  const [theme, setTheme] = useState("system");
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Privacy & Security
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [dataSharing, setDataSharing] = useState(false);

  // Billing Settings
  const [restaurantName, setRestaurantName] = useState("My Restaurant");
  const [restaurantAddress, setRestaurantAddress] = useState("123 Main Street, City, State 12345");
  const [restaurantPhone, setRestaurantPhone] = useState("+1 234-567-8900");
  const [restaurantEmail, setRestaurantEmail] = useState("info@restaurant.com");
  const [billHeader, setBillHeader] = useState("Thank you for dining with us!");
  const [billFooter, setBillFooter] = useState("Visit us again!");
  const [showLogo, setShowLogo] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [billTemplate, setBillTemplate] = useState("standard");
  
  // Tax Settings
  const [taxes, setTaxes] = useState([
    { id: 1, name: "GST", rate: 18, enabled: true },
    { id: 2, name: "Service Tax", rate: 10, enabled: true },
    { id: 3, name: "VAT", rate: 5, enabled: false },
  ]);
  
  // Additional Charges
  const [packagingCost, setPackagingCost] = useState("10");
  const [packagingType, setPackagingType] = useState("fixed"); // fixed or percentage
  const [deliveryCharge, setDeliveryCharge] = useState("30");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("100");
  const [serviceCharge, setServiceCharge] = useState("5");
  const [serviceChargeType, setServiceChargeType] = useState("percentage");

  const settingsMenu = [
    { id: "sound" as SettingsSection, label: "Sound", icon: Volume2 },
    { id: "notifications" as SettingsSection, label: "Notifications", icon: Bell },
    { id: "language" as SettingsSection, label: "Language & Region", icon: Globe },
    { id: "appearance" as SettingsSection, label: "Appearance", icon: Palette },
    { id: "billing" as SettingsSection, label: "Billing & Invoice", icon: Receipt },
    { id: "security" as SettingsSection, label: "Privacy & Security", icon: Shield },
    { id: "profile" as SettingsSection, label: "Profile", icon: User },
  ];

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully!",
    });
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setSoundEnabled(true);
    setSoundVolume([75]);
    setPushNotifications(true);
    setLanguage("en");
    setTheme("system");
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults.",
    });
  };

  const handleAddTax = () => {
    const newTax = {
      id: taxes.length + 1,
      name: "New Tax",
      rate: 0,
      enabled: true,
    };
    setTaxes([...taxes, newTax]);
  };

  const handleUpdateTax = (id: number, field: string, value: any) => {
    setTaxes(taxes.map(tax => 
      tax.id === id ? { ...tax, [field]: value } : tax
    ));
  };

  const handleDeleteTax = (id: number) => {
    setTaxes(taxes.filter(tax => tax.id !== id));
  };

  const handlePreviewBill = () => {
    setShowBillPreview(true);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold px-3">Settings</h2>
          <p className="text-xs text-muted-foreground px-3 mt-1">
            Manage preferences
          </p>
        </div>
        <nav className="space-y-1">
          {settingsMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl">
          {activeSection === "sound" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Sound Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Configure audio alerts and sound effects
                </p>
              </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Sound Settings
            </CardTitle>
            <CardDescription>
              Configure audio alerts and sound effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled">Enable Sounds</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off all sound effects
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Volume Level</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={soundVolume}
                    onValueChange={setSoundVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                    disabled={!soundEnabled}
                  />
                  <span className="text-sm font-medium w-12 text-right">
                    {soundVolume[0]}%
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-alert">New Order Alert</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when new order arrives
                  </p>
                </div>
                <Switch
                  id="order-alert"
                  checked={orderAlertSound}
                  onCheckedChange={setOrderAlertSound}
                  disabled={!soundEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-sound">Payment Confirmation</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound on successful payment
                  </p>
                </div>
                <Switch
                  id="payment-sound"
                  checked={paymentSound}
                  onCheckedChange={setPaymentSound}
                  disabled={!soundEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={handleResetSettings} className="rounded-xl">
                  Reset
                </Button>
                <Button onClick={handleSaveSettings} className="rounded-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-muted-foreground mt-1">
                  Choose how you want to receive notifications
                </p>
              </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-notif">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on this device
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-notif"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notif"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms-notif">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text message alerts
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms-notif"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Notification Types</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="new-order-notif">New Orders</Label>
                <Switch
                  id="new-order-notif"
                  checked={newOrderNotif}
                  onCheckedChange={setNewOrderNotif}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="low-stock-notif">Low Stock Alerts</Label>
                <Switch
                  id="low-stock-notif"
                  checked={lowStockNotif}
                  onCheckedChange={setLowStockNotif}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="customer-notif">Customer Updates</Label>
                <Switch
                  id="customer-notif"
                  checked={customerNotif}
                  onCheckedChange={setCustomerNotif}
                />
              </div>
            </div>
          </CardContent>
        </Card>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={handleResetSettings} className="rounded-xl">
                  Reset
                </Button>
                <Button onClick={handleSaveSettings} className="rounded-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Language & Region Section */}
          {activeSection === "language" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Language & Region</h1>
                <p className="text-muted-foreground mt-1">
                  Set your preferred language and regional formats
                </p>
              </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language & Region
            </CardTitle>
            <CardDescription>
              Set your preferred language and regional formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    <SelectItem value="EST">Eastern Time (GMT-5)</SelectItem>
                    <SelectItem value="PST">Pacific Time (GMT-8)</SelectItem>
                    <SelectItem value="IST">India (GMT+5:30)</SelectItem>
                    <SelectItem value="JST">Japan (GMT+9)</SelectItem>
                    <SelectItem value="AEST">Australia (GMT+10)</SelectItem>
                    <SelectItem value="CET">Central Europe (GMT+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger id="date-format" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={handleResetSettings} className="rounded-xl">
                  Reset
                </Button>
                <Button onClick={handleSaveSettings} className="rounded-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Appearance</h1>
                <p className="text-muted-foreground mt-1">
                  Customize the look and feel of your application
                </p>
              </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing for a denser layout
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Show smooth transitions and effects
                </p>
              </div>
              <Switch
                id="animations"
                checked={animationsEnabled}
                onCheckedChange={setAnimationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={handleResetSettings} className="rounded-xl">
                  Reset
                </Button>
                <Button onClick={handleSaveSettings} className="rounded-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Billing Section */}
          {activeSection === "billing" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Billing & Invoice Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Customize your printable bills and invoices
                </p>
              </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Billing & Invoice Settings
            </CardTitle>
            <CardDescription>
              Customize your printable bills and invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Restaurant Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Restaurant Information
              </h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">Restaurant Name</Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="My Restaurant"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurant-phone">Phone Number</Label>
                  <Input
                    id="restaurant-phone"
                    value={restaurantPhone}
                    onChange={(e) => setRestaurantPhone(e.target.value)}
                    placeholder="+1 234-567-8900"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurant-email">Email</Label>
                  <Input
                    id="restaurant-email"
                    type="email"
                    value={restaurantEmail}
                    onChange={(e) => setRestaurantEmail(e.target.value)}
                    placeholder="info@restaurant.com"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bill-template">Bill Template</Label>
                  <Select value={billTemplate} onValueChange={setBillTemplate}>
                    <SelectTrigger id="bill-template" className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurant-address">Address</Label>
                <Textarea
                  id="restaurant-address"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
                  className="rounded-xl min-h-20"
                />
              </div>
            </div>

            <Separator />

            {/* Bill Customization */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Bill Customization</h4>
              
              <div className="space-y-2">
                <Label htmlFor="bill-header">Bill Header Text</Label>
                <Input
                  id="bill-header"
                  value={billHeader}
                  onChange={(e) => setBillHeader(e.target.value)}
                  placeholder="Thank you for dining with us!"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-footer">Bill Footer Text</Label>
                <Textarea
                  id="bill-footer"
                  value={billFooter}
                  onChange={(e) => setBillFooter(e.target.value)}
                  placeholder="Visit us again!"
                  className="rounded-xl"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-logo">Show Restaurant Logo</Label>
                  <p className="text-sm text-muted-foreground">
                    Display logo on printed bills
                  </p>
                </div>
                <Switch
                  id="show-logo"
                  checked={showLogo}
                  onCheckedChange={setShowLogo}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-qr">Show QR Code</Label>
                  <p className="text-sm text-muted-foreground">
                    Add QR code for digital payment
                  </p>
                </div>
                <Switch
                  id="show-qr"
                  checked={showQRCode}
                  onCheckedChange={setShowQRCode}
                />
              </div>

              {showLogo && (
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Restaurant Logo</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={handlePreviewBill}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Tax Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Tax Management
                </h4>
                <Button size="sm" variant="outline" onClick={handleAddTax} className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tax
                </Button>
              </div>

              <div className="space-y-3">
                {taxes.map((tax) => (
                  <Card key={tax.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={tax.enabled}
                        onCheckedChange={(checked) => handleUpdateTax(tax.id, 'enabled', checked)}
                      />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          value={tax.name}
                          onChange={(e) => handleUpdateTax(tax.id, 'name', e.target.value)}
                          placeholder="Tax Name"
                          className="rounded-xl"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={tax.rate}
                            onChange={(e) => handleUpdateTax(tax.id, 'rate', parseFloat(e.target.value))}
                            placeholder="Rate"
                            className="rounded-xl"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteTax(tax.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Additional Charges */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4" />
                Additional Charges
              </h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="packaging-cost">Packaging Cost</Label>
                  <div className="flex gap-2">
                    <Input
                      id="packaging-cost"
                      type="number"
                      value={packagingCost}
                      onChange={(e) => setPackagingCost(e.target.value)}
                      placeholder="10"
                      className="rounded-xl"
                      min="0"
                    />
                    <Select value={packagingType} onValueChange={setPackagingType}>
                      <SelectTrigger className="rounded-xl w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-charge">Delivery Charge</Label>
                  <Input
                    id="delivery-charge"
                    type="number"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    placeholder="30"
                    className="rounded-xl"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-charge">Service Charge</Label>
                  <div className="flex gap-2">
                    <Input
                      id="service-charge"
                      type="number"
                      value={serviceCharge}
                      onChange={(e) => setServiceCharge(e.target.value)}
                      placeholder="5"
                      className="rounded-xl"
                      min="0"
                    />
                    <Select value={serviceChargeType} onValueChange={setServiceChargeType}>
                      <SelectTrigger className="rounded-xl w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-order">Minimum Order Amount</Label>
                  <Input
                    id="min-order"
                    type="number"
                    value={minimumOrderAmount}
                    onChange={(e) => setMinimumOrderAmount(e.target.value)}
                    placeholder="100"
                    className="rounded-xl"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handlePreviewBill}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Bill
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl">
                <FileText className="w-4 h-4 mr-2" />
                Print Sample
              </Button>
            </div>
          </CardContent>
        </Card>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={handleResetSettings} className="rounded-xl">
                  Reset
                </Button>
                <Button onClick={handleSaveSettings} className="rounded-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Privacy & Security</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your security preferences and data privacy
                </p>
              </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your security preferences and data privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id="2fa"
                checked={twoFactorAuth}
                onCheckedChange={setTwoFactorAuth}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                <SelectTrigger id="session-timeout" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-sharing">Anonymous Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the app by sharing usage data
                </p>
              </div>
              <Switch
                id="data-sharing"
                checked={dataSharing}
                onCheckedChange={setDataSharing}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-xl">
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full rounded-xl">
                <Database className="w-4 h-4 mr-2" />
                Download My Data
              </Button>
            </div>
          </CardContent>
        </Card>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={handleResetSettings} className="rounded-xl">
                  Reset
                </Button>
                <Button onClick={handleSaveSettings} className="rounded-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your personal information
                </p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <a href="/profile">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={handleResetSettings} className="rounded-xl">
                  Reset
                </Button>
                <Button onClick={handleSaveSettings} className="rounded-xl">
                  <Zap className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Preview Dialog */}
      <Dialog open={showBillPreview} onOpenChange={setShowBillPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Preview</DialogTitle>
            <DialogDescription>
              Preview how your bill will look with current settings
            </DialogDescription>
          </DialogHeader>
          <BillPreview
            template={billTemplate as any}
            restaurantName={restaurantName}
            restaurantAddress={restaurantAddress}
            restaurantPhone={restaurantPhone}
            restaurantEmail={restaurantEmail}
            headerText={billHeader}
            footerText={billFooter}
            showLogo={showLogo}
            showQRCode={showQRCode}
            taxes={taxes.filter(t => t.enabled).map(t => ({
              name: t.name,
              rate: t.rate,
              amount: (840 * t.rate) / 100
            }))}
            serviceCharge={parseFloat(serviceCharge) || 0}
            packagingCharge={parseFloat(packagingCost) || 0}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
