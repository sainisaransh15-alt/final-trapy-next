import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, unknown>;
  send_push?: boolean;
  send_email?: boolean;
}

// Firebase Admin SDK replacement using REST API
async function sendFirebasePushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");

  if (!projectId || !privateKey || !clientEmail) {
    console.error("Firebase credentials not configured");
    return false;
  }

  try {
    // Create JWT for Firebase authentication
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://fcm.googleapis.com/",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
    };

    // Encode JWT parts
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const signInput = `${headerB64}.${payloadB64}`;

    // Sign with RSA-SHA256
    const keyData = privateKey
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s/g, "");
    
    const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      encoder.encode(signInput)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${signInput}.${signatureB64}`;

    // Send FCM message
    const fcmResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title,
              body,
            },
            data: data ? Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k, String(v)])
            ) : undefined,
            webpush: {
              fcm_options: {
                link: "/dashboard",
              },
            },
          },
        }),
      }
    );

    if (!fcmResponse.ok) {
      const errorText = await fcmResponse.text();
      console.error("FCM error:", fcmResponse.status, errorText);
      return false;
    }

    console.log("FCM notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    return false;
  }
}

// Send email via Resend REST API
async function sendEmailNotification(
  email: string,
  title: string,
  message: string,
  type: string
): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  try {
    // Generate email HTML based on notification type
    const emailHtml = generateEmailTemplate(title, message, type);
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Trapy <notifications@resend.dev>",
        to: [email],
        subject: title,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Resend API error:", response.status, errorData);
      return false;
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

function generateEmailTemplate(title: string, message: string, type: string): string {
  const primaryColor = "#10B981"; // Green color for Trapy
  const iconMap: Record<string, string> = {
    booking_created: "🎫",
    booking_confirmed: "✅",
    booking_cancelled: "❌",
    ride_started: "🚗",
    ride_completed: "🏁",
    new_message: "💬",
    sos_alert: "🚨",
  };
  
  const icon = iconMap[type] || "📢";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, ${primaryColor} 0%, #059669 100%); padding: 30px 40px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Trapy</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Your Carpooling Partner</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">
                    ${icon}
                  </div>
                  <h2 style="color: #18181b; margin: 0 0 16px; font-size: 22px; text-align: center;">
                    ${title}
                  </h2>
                  <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6; text-align: center;">
                    ${message}
                  </p>
                  <div style="text-align: center;">
                    <a href="https://trapy.app/dashboard" style="display: inline-block; background-color: ${primaryColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View Details
                    </a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
                  <p style="color: #71717a; margin: 0; font-size: 13px;">
                    This email was sent by Trapy. You can manage your notification preferences in your profile settings.
                  </p>
                  <p style="color: #a1a1aa; margin: 12px 0 0; font-size: 12px;">
                    © ${new Date().getFullYear()} Trapy. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      user_id, 
      title, 
      message, 
      type, 
      data,
      send_push = true,
      send_email = true 
    }: NotificationRequest = await req.json();

    if (!user_id || !title || !message || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      notification_created: false,
      push_sent: false,
      email_sent: false,
    };

    // Get user profile for email and notification preferences
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, notifications_enabled, email_notifications_enabled, push_notifications_enabled")
      .eq("id", user_id)
      .single();

    // Get user's email from auth if not in profile
    let userEmail = profile?.email;
    if (!userEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
      userEmail = authUser?.user?.email;
    }

    // Create in-app notification
    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        data,
        is_read: false,
      });

    if (notifError) {
      console.error("Error creating notification:", notifError);
    } else {
      results.notification_created = true;
    }

    // Send push notification if enabled
    if (send_push && profile?.push_notifications_enabled !== false) {
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("fcm_token")
        .eq("user_id", user_id)
        .not("fcm_token", "is", null);

      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          if (sub.fcm_token) {
            const pushResult = await sendFirebasePushNotification(
              sub.fcm_token,
              title,
              message,
              data
            );
            if (pushResult) results.push_sent = true;
          }
        }
      }
    }

    // Send email notification if enabled
    if (send_email && userEmail && profile?.email_notifications_enabled !== false) {
      results.email_sent = await sendEmailNotification(
        userEmail,
        title,
        message,
        type
      );
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});