import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { UserPlus, Mail, Phone, Trash2, Edit, Copy, CheckCircle, XCircle } from 'lucide-react';

interface StaffMember {
  uid: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  addedAt: number;
}

interface Invite {
  token: string;
  emailOrPhone: string;
  role: string;
  expiresAt: number;
  consumedBy: string | null;
  createdAt: number;
}

const ROLES = [
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'server', label: 'Server' },
  { value: 'kitchen', label: 'Kitchen Staff' },
];

export default function StaffManagement() {
  const { userData, inviteStaff, updateUserRole, deactivateUser, revokeInvite } = useAuth();
  const { toast } = useToast();
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  const [inviteForm, setInviteForm] = useState({
    emailOrPhone: '',
    role: 'server',
  });

  // Fetch staff members
  useEffect(() => {
    if (!userData?.restaurantId) return;

    const restaurantUsersRef = ref(database, `restaurantUsers/${userData.restaurantId}`);
    
    const unsubscribe = onValue(restaurantUsersRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const staffList: StaffMember[] = [];

        for (const [uid, staffData] of Object.entries(data as any)) {
          // Fetch user details
          const userRef = ref(database, `users/${uid}`);
          onValue(userRef, (userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              staffList.push({
                uid,
                name: userData.name || 'Unknown',
                email: userData.email,
                phone: userData.phone,
                role: staffData.role,
                status: staffData.status,
                addedAt: staffData.addedAt,
              });
            }
          }, { onlyOnce: true });
        }

        setTimeout(() => setStaff(staffList), 500);
      }
    });

    return () => off(restaurantUsersRef);
  }, [userData?.restaurantId]);

  // Fetch pending invites
  useEffect(() => {
    if (!userData?.restaurantId) return;

    const invitesRef = ref(database, `invites/${userData.restaurantId}`);
    
    const unsubscribe = onValue(invitesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const inviteList: Invite[] = Object.entries(data).map(([token, inviteData]: [string, any]) => ({
          token,
          ...inviteData,
        }));
        setInvites(inviteList);
      } else {
        setInvites([]);
      }
    });

    return () => off(invitesRef);
  }, [userData?.restaurantId]);

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await inviteStaff(inviteForm.emailOrPhone, inviteForm.role);
      
      toast({
        title: 'Success',
        description: 'Invite sent successfully!',
      });

      setInviteDialogOpen(false);
      setInviteForm({ emailOrPhone: '', role: 'server' });
    } catch (error: any) {
      console.error('Invite error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invite',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    try {
      await updateUserRole(uid, newRole);
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (uid: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await deactivateUser(uid);
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate user',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeInvite = async (token: string) => {
    try {
      await revokeInvite(token);
      toast({
        title: 'Success',
        description: 'Invite revoked successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke invite',
        variant: 'destructive',
      });
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/accept-invite?rid=${userData?.restaurantId}&token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied',
      description: 'Invite link copied to clipboard',
    });
  };

  if (userData?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to manage staff.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage your restaurant team</p>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your restaurant team
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteStaff}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone">Email or Phone</Label>
                  <Input
                    id="emailOrPhone"
                    placeholder="email@example.com or +1234567890"
                    value={inviteForm.emailOrPhone}
                    onChange={(e) => setInviteForm({ ...inviteForm, emailOrPhone: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Phone must be in E.164 format (e.g., +911234567890)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Invite'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Staff */}
      <Card>
        <CardHeader>
          <CardTitle>Active Staff ({staff.filter(s => s.status === 'active').length})</CardTitle>
          <CardDescription>Manage roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.filter(s => s.status === 'active').map((member) => (
              <div key={member.uid} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </span>
                        )}
                        {member.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.uid, value)}
                    disabled={member.role === 'admin'}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {member.role === 'admin' && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {member.role !== 'admin' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeactivate(member.uid)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {staff.filter(s => s.status === 'active').length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No active staff members
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invites ({invites.filter(i => !i.consumedBy && i.expiresAt > Date.now()).length})</CardTitle>
          <CardDescription>Invitations waiting to be accepted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invites.filter(i => !i.consumedBy && i.expiresAt > Date.now()).map((invite) => (
              <div key={invite.token} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{invite.emailOrPhone}</p>
                  <div className="flex gap-2 items-center mt-1">
                    <Badge variant="outline">{invite.role}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(invite.token)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Link
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeInvite(invite.token)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
            
            {invites.filter(i => !i.consumedBy && i.expiresAt > Date.now()).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No pending invites
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
