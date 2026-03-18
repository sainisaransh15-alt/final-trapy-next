'use client';
import { useState } from 'react';
import { Flag, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId?: string;
  reportedRideId?: string;
  reportedUserName?: string;
}

const REPORT_CATEGORIES = [
  { value: 'harassment', label: 'Harassment', description: 'Offensive or threatening behavior' },
  { value: 'fake_profile', label: 'Fake Profile', description: 'Misleading or false information' },
  { value: 'inappropriate_behavior', label: 'Inappropriate Behavior', description: 'Unprofessional or rude conduct' },
  { value: 'safety_concern', label: 'Safety Concern', description: 'Dangerous driving or unsafe conditions' },
  { value: 'spam', label: 'Spam', description: 'Unwanted messages or fake listings' },
  { value: 'other', label: 'Other', description: 'Other issues not listed above' },
];

export function ReportModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedRideId,
  reportedUserName,
}: ReportModalProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !category || !description.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        reported_ride_id: reportedRideId || null,
        category,
        description: description.trim(),
      });

      if (error) throw error;

      toast({
        title: 'Report Submitted',
        description: 'Thank you for reporting. Our team will review this shortly.',
      });

      onClose();
      setCategory('');
      setDescription('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Report {reportedUserName ? reportedUserName : reportedRideId ? 'Ride' : 'Issue'}
          </DialogTitle>
          <DialogDescription>
            Help us keep Trapy safe by reporting inappropriate behavior or content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label className="mb-3 block">What's the issue?</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              {REPORT_CATEGORIES.map((cat) => (
                <div
                  key={cat.value}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    category === cat.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setCategory(cat.value)}
                >
                  <RadioGroupItem value={cat.value} id={cat.value} className="mt-0.5" />
                  <div>
                    <label htmlFor={cat.value} className="font-medium cursor-pointer">
                      {cat.label}
                    </label>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              Describe the issue
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about what happened..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be as specific as possible. Include dates, times, and any relevant details.
            </p>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              False reports may result in account restrictions. Only report genuine issues.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !category || !description.trim()}
              className="flex-1"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Flag className="w-4 h-4 mr-2" />
              )}
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
