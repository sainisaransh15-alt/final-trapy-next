'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Ticket, Percent, IndianRupee, Calendar, 
  Users, Trash2, Edit, Copy, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_ride_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number | null;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean | null;
  is_first_ride_only: boolean | null;
  created_at: string;
}

const initialFormState = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 10,
  min_ride_amount: 0,
  max_discount: null as number | null,
  usage_limit: null as number | null,
  valid_until: '',
  is_active: true,
  is_first_ride_only: false
};

export function PromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'TRAPY';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.discount_value) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .insert({
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          min_ride_amount: formData.min_ride_amount || 0,
          max_discount: formData.max_discount || null,
          usage_limit: formData.usage_limit || null,
          valid_until: formData.valid_until || null,
          is_active: formData.is_active,
          is_first_ride_only: formData.is_first_ride_only
        });

      if (error) throw error;

      toast.success('Promo code created successfully');
      setShowCreateModal(false);
      setFormData(initialFormState);
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error creating promo code:', error);
      toast.error(error.message || 'Failed to create promo code');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCode) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({
          description: formData.description || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          min_ride_amount: formData.min_ride_amount || 0,
          max_discount: formData.max_discount || null,
          usage_limit: formData.usage_limit || null,
          valid_until: formData.valid_until || null,
          is_active: formData.is_active,
          is_first_ride_only: formData.is_first_ride_only,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCode.id);

      if (error) throw error;

      toast.success('Promo code updated successfully');
      setShowEditModal(false);
      setSelectedCode(null);
      fetchPromoCodes();
    } catch (error) {
      console.error('Error updating promo code:', error);
      toast.error('Failed to update promo code');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Promo code deleted');
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('Failed to delete promo code');
    }
  };

  const handleEdit = (code: PromoCode) => {
    setSelectedCode(code);
    setFormData({
      code: code.code,
      description: code.description || '',
      discount_type: code.discount_type,
      discount_value: code.discount_value,
      min_ride_amount: code.min_ride_amount || 0,
      max_discount: code.max_discount,
      usage_limit: code.usage_limit,
      valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
      is_active: code.is_active ?? true,
      is_first_ride_only: code.is_first_ride_only ?? false
    });
    setShowEditModal(true);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const toggleActive = async (code: PromoCode) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !code.is_active })
        .eq('id', code.id);

      if (error) throw error;
      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code:', error);
      toast.error('Failed to update promo code');
    }
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading promo codes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Promo Codes</h2>
          <p className="text-sm text-muted-foreground">Create and manage discount codes</p>
        </div>
        <Button onClick={() => {
          setFormData(initialFormState);
          setShowCreateModal(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{promoCodes.length}</p>
            <p className="text-sm text-muted-foreground">Total Codes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">
              {promoCodes.filter(c => c.is_active && !isExpired(c.valid_until)).length}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {promoCodes.reduce((acc, c) => acc + (c.used_count || 0), 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Uses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {promoCodes.filter(c => c.is_first_ride_only).length}
            </p>
            <p className="text-sm text-muted-foreground">First Ride Only</p>
          </CardContent>
        </Card>
      </div>

      {/* Promo Codes List */}
      <div className="space-y-3">
        {promoCodes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No promo codes yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          promoCodes.map(code => (
            <Card 
              key={code.id} 
              className={!code.is_active || isExpired(code.valid_until) ? 'opacity-60' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      {code.discount_type === 'percentage' ? (
                        <Percent className="h-6 w-6 text-primary" />
                      ) : (
                        <IndianRupee className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg">{code.code}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyCode(code.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {!code.is_active && <Badge variant="secondary">Inactive</Badge>}
                        {isExpired(code.valid_until) && <Badge variant="destructive">Expired</Badge>}
                        {code.is_first_ride_only && <Badge variant="outline">First Ride</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {code.discount_type === 'percentage' 
                          ? `${code.discount_value}% off` 
                          : `₹${code.discount_value} off`}
                        {code.max_discount && ` (max ₹${code.max_discount})`}
                        {code.min_ride_amount && code.min_ride_amount > 0 && ` • Min ₹${code.min_ride_amount}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {code.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">
                        {code.used_count || 0}{code.usage_limit ? `/${code.usage_limit}` : ''} uses
                      </p>
                      {code.valid_until && (
                        <p className="text-xs text-muted-foreground">
                          Expires {format(new Date(code.valid_until), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <Switch 
                      checked={code.is_active ?? false}
                      onCheckedChange={() => toggleActive(code)}
                    />
                    <Button variant="outline" size="icon" onClick={() => handleEdit(code)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(code.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="TRAPY10OFF"
                />
                <Button variant="outline" onClick={generateCode}>Generate</Button>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., New Year Sale - 10% off"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select 
                  value={formData.discount_type}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, discount_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Ride Amount</Label>
                <Input
                  type="number"
                  value={formData.min_ride_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_ride_amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Max Discount (₹)</Label>
                <Input
                  type="number"
                  value={formData.max_discount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value ? parseFloat(e.target.value) : null }))}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>First Ride Only</Label>
              <Switch
                checked={formData.is_first_ride_only}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_first_ride_only: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Promo Code: {selectedCode?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select 
                  value={formData.discount_type}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, discount_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Ride Amount</Label>
                <Input
                  type="number"
                  value={formData.min_ride_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_ride_amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Max Discount (₹)</Label>
                <Input
                  type="number"
                  value={formData.max_discount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value ? parseFloat(e.target.value) : null }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value ? parseInt(e.target.value) : null }))}
                />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>First Ride Only</Label>
              <Switch
                checked={formData.is_first_ride_only}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_first_ride_only: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
