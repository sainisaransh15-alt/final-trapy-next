'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Wallet,
  Car,
  Calendar,
  Upload,
  CheckCircle,
  Clock,
  ChevronRight,
  LogOut,
  Phone,
  CreditCard,
  FileText,
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function Profile() {
  const { user, profile, signOut, updateProfile, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('settings');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login to view your profile</h2>
          <p className="text-muted-foreground mb-6">Access your rides, wallet, and verification status</p>
          <Button onClick={() => router.push('/auth')}>Login</Button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({
      full_name: editForm.full_name,
      phone: editForm.phone,
    });
    setIsSaving(false);
    
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const verificationItems = [
    {
      icon: Phone,
      label: 'Phone Number',
      verified: profile?.is_phone_verified || false,
      action: 'Verify',
    },
    {
      icon: CreditCard,
      label: 'Driving License',
      verified: profile?.is_dl_verified || false,
      action: 'Upload',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <div className="container px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-indigo-dark flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {profile?.is_dl_verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                {profile?.phone && (
                  <p className="text-muted-foreground text-sm">+91 {profile.phone}</p>
                )}
                {profile?.is_dl_verified ? (
                  <Badge className="mt-2 bg-emerald-light text-emerald border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified User
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Verification Pending
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary to-indigo-dark text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold">₹{profile?.wallet_balance?.toLocaleString() || 0}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Wallet className="w-7 h-7" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Add Money
              </Button>
              <Button size="sm" className="bg-emerald text-white hover:bg-emerald/90 border-0">
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <button 
                    className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
                    onClick={() => {
                      setEditForm({
                        full_name: profile?.full_name || '',
                        phone: profile?.phone || '',
                      });
                      setIsEditing(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span>Edit Profile</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <Link href="/verification" className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-t">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <span>Verification Center</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                  <Link href="/trapy-pass" className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-t">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <span>Trapy Pass Subscription</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-t text-destructive"
                    onClick={handleSignOut}
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </div>
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Verify your identity to build trust with other travelers and unlock all features.
                </p>
                {verificationItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.verified ? 'bg-emerald-light' : 'bg-background'
                      }`}>
                        <item.icon className={`w-5 h-5 ${item.verified ? 'text-emerald' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        {item.verified && (
                          <p className="text-sm text-emerald">Verified</p>
                        )}
                      </div>
                    </div>
                    {item.verified ? (
                      <CheckCircle className="w-5 h-5 text-emerald" />
                    ) : (
                      <Link href="/verification">
                        <Button size="sm" variant="outline">
                          <Upload className="w-4 h-4 mr-1" />
                          {item.action}
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
