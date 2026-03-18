'use client';
import { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { requestNotificationPermission, getFCMToken, onForegroundMessage } from "@/lib/firebase";

interface NotificationPermissionProps {
  onClose?: () => void;
}

export function NotificationPermission({ onClose }: NotificationPermissionProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if notifications are already enabled
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setIsEnabled(true);
      } else if (Notification.permission === "default") {
        // Only show prompt if permission hasn't been decided
        const hasDeclined = localStorage.getItem("notification_prompt_dismissed");
        if (!hasDeclined) {
          setShowPrompt(true);
        }
      }
    }

    // Set up foreground message handler
    let unsubscribe: (() => void) | undefined;
    
    const setupMessageHandler = async () => {
      unsubscribe = await onForegroundMessage((payload) => {
        console.log("Foreground message received:", payload);
        const notification = payload as { notification?: { title?: string; body?: string } };
        if (notification?.notification) {
          toast(notification.notification.title, {
            description: notification.notification.body,
          });
        }
      });
    };
    
    if (isEnabled) {
      setupMessageHandler();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isEnabled]);

  const handleEnable = async () => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      toast.error("Notifications are not supported in this environment");
      return;
    }

    if (!user) {
      toast.error("Please log in to enable notifications");
      return;
    }

    setIsLoading(true);

    try {
      const permission = await requestNotificationPermission();
      
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        setIsLoading(false);
        return;
      }

      const fcmToken = await getFCMToken();
      
      if (fcmToken) {
        // Save FCM token to database
        const { error } = await supabase
          .from("push_subscriptions")
          .upsert({
            user_id: user.id,
            fcm_token: fcmToken,
            device_type: "web",
            platform: "web",
            endpoint: fcmToken, // Use token as endpoint for web
            // FCM web tokens don't expose p256dh/auth; keep placeholders for schema requirements
            p256dh: "",
            auth: "",
          }, {
            onConflict: "user_id,endpoint",
          });

        if (error) {
          console.error("Error saving FCM token:", error);
          toast.error("Failed to save notification preferences");
        } else {
          setIsEnabled(true);
          setShowPrompt(false);
          toast.success("Notifications enabled successfully!");
        }
      } else {
        toast.error("Failed to get notification token");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications");
    }

    setIsLoading(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("notification_prompt_dismissed", "true");
    setShowPrompt(false);
    onClose?.();
  };

  if (!showPrompt || isEnabled) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-primary/20 animate-in slide-in-from-bottom-5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Stay Updated</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Get instant notifications for booking updates, messages, and ride alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleDismiss}
        >
          Not Now
        </Button>
        <Button
          className="flex-1"
          onClick={handleEnable}
          disabled={isLoading}
        >
          {isLoading ? (
            "Enabling..."
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Enable
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default NotificationPermission;