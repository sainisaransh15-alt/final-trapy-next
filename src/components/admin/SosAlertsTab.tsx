'use client';
import { useState } from 'react';
import { AlertTriangle, MapPin, Phone, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SosAlert {
  id: string;
  user_id: string;
  alert_type: string;
  status: string;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

interface SosAlertsTabProps {
  alerts: SosAlert[];
  onRefresh: () => void;
}

export function SosAlertsTab({ alerts, onRefresh }: SosAlertsTabProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleResolve = async (alertId: string) => {
    setProcessingId(alertId);
    try {
      const { error } = await supabase
        .from('sos_alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: 'Alert Resolved',
        description: 'The SOS alert has been marked as resolved.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve alert',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          SOS Alerts
          {activeAlerts.length > 0 && (
            <Badge variant="destructive">{activeAlerts.length} Active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-12 h-12 text-emerald mx-auto mb-4" />
            <p className="text-muted-foreground">No SOS alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.length > 0 && (
              <div>
                <h3 className="font-semibold text-destructive mb-3">Active Alerts</h3>
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">{alert.profiles?.full_name || 'Unknown User'}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{alert.profiles?.phone || 'No phone'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.location_text || 'Location unknown'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(alert.created_at), 'MMM d, yyyy h:mm a')} • {alert.alert_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.latitude && alert.longitude && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`, '_blank')}
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            Map
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                          disabled={processingId === alert.id}
                        >
                          {processingId === alert.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Resolve
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resolvedAlerts.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-muted-foreground mb-3">Recently Resolved</h3>
                <div className="space-y-2">
                  {resolvedAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                    >
                      <div>
                        <span className="font-medium">{alert.profiles?.full_name || 'Unknown'}</span>
                        <span className="text-muted-foreground ml-2">• {alert.alert_type}</span>
                      </div>
                      <Badge variant="secondary">Resolved</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
