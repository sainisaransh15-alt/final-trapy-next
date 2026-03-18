'use client';
import { useState, useEffect } from 'react';
import { Search, Bell, BellOff, Trash2, Loader2, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface SavedSearch {
  id: string;
  origin: string;
  destination: string;
  name: string | null;
  notify_enabled: boolean;
}

export default function SavedSearches() {
  const { user } = useAuth();
  const { setSearchParams } = useApp();
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (user) fetchSearches();
  }, [user]);

  const fetchSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearches(data || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!user || !newOrigin || !newDestination) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          origin: newOrigin,
          destination: newDestination,
          name: newName || null,
        });

      if (error) throw error;

      toast({
        title: 'Search Saved',
        description: 'You can quickly access this search later.',
      });

      setNewOrigin('');
      setNewDestination('');
      setNewName('');
      setDialogOpen(false);
      fetchSearches();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save search',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotify = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ notify_enabled: !currentValue })
        .eq('id', id);

      if (error) throw error;

      setSearches(prev =>
        prev.map(s => (s.id === id ? { ...s, notify_enabled: !currentValue } : s))
      );

      toast({
        title: !currentValue ? 'Notifications Enabled' : 'Notifications Disabled',
        description: !currentValue
          ? "You'll be notified when new rides match this search."
          : 'You will no longer receive notifications for this search.',
      });
    } catch (error) {
      console.error('Error toggling notification:', error);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSearches(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleUseSearch = (search: SavedSearch) => {
    setSearchParams({
      from: search.origin,
      to: search.destination,
      date: null,
      passengers: 1,
    });
    router.push('/search');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Saved Searches</h3>
          <p className="text-sm text-muted-foreground">
            Quickly search your frequent routes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Save Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save a Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Input
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  placeholder="From (e.g., Mumbai)"
                />
              </div>
              <div>
                <Input
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="To (e.g., Pune)"
                />
              </div>
              <div>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name (optional, e.g., Weekend Trip)"
                />
              </div>
              <Button
                onClick={handleSaveSearch}
                disabled={saving || !newOrigin || !newDestination}
                className="w-full"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Save Search
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-8 bg-muted/50 rounded-xl">
          <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Save your frequent routes for quick access
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {searches.map((search) => (
            <div
              key={search.id}
              className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => handleUseSearch(search)}
                  className="flex-1 text-left"
                >
                  {search.name && (
                    <p className="text-sm font-medium mb-1">{search.name}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>{search.origin}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{search.destination}</span>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleNotify(search.id, search.notify_enabled)}
                  >
                    {search.notify_enabled ? (
                      <Bell className="w-4 h-4 text-primary" />
                    ) : (
                      <BellOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSearch(search.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
