'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Clock, XCircle, Shield, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Verification() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  // Phone OTP state
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const documents = [
    {
      id: 'driving_license',
      name: 'Driving License',
      description: 'Required for offering rides',
      status: profile?.dl_status || 'pending',
      isVerified: profile?.is_dl_verified || false,
      icon: FileText,
    },
  ];

  const getStatusBadge = (status: string, isVerified: boolean) => {
    if (isVerified) {
      return (
        <div className="flex items-center gap-1 text-emerald bg-emerald-light px-3 py-1 rounded-full text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Verified</span>
        </div>
      );
    }
    
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            <span>Not Uploaded</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-3 py-1 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-warning bg-warning/10 px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            <span>Under Review</span>
          </div>
        );
    }
  };

  const handleFileSelect = async (documentId: string, file: File) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upload documents",
        variant: "destructive",
      });
      return;
    }

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, or PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(documentId);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentId}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Store the file path (not public URL) for secure signed URL generation
      // This prevents exposure of identity documents via public URLs
      const { error: dbError } = await supabase
        .from('verification_documents')
        .insert({
          user_id: user.id,
          document_type: documentId,
          document_url: fileName, // Store path only, not public URL
          status: 'pending',
        });

      if (dbError) throw dbError;

      // Update profile status
      await supabase
        .from('profiles')
        .update({ dl_status: 'pending' })
        .eq('id', user.id);

      toast({
        title: "Document uploaded",
        description: "Your document has been submitted for verification. This usually takes 24-48 hours.",
      });

      // Refresh profile
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSendOtp = async () => {
    if (!user || !phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setSendingOtp(true);

    try {
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update phone number on profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone: phoneNumber })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Store OTP securely using SECURITY DEFINER function (not in publicly readable table)
      const { error: otpError } = await supabase.rpc('send_phone_otp', {
        p_user_id: user.id,
        p_otp_code: otp,
      });

      if (otpError) throw otpError;

      // In production, send OTP via SMS using Twilio or similar
      // For now, we'll show the OTP in a toast (development only)
      toast({
        title: "OTP Sent",
        description: `Demo mode: Your OTP is ${otp}. In production, this would be sent via SMS.`,
      });

      setOtpSent(true);
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!user || otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setVerifyingOtp(true);

    try {
      // Verify OTP using secure SECURITY DEFINER function
      // This function checks the OTP in the secured phone_verifications table
      // and marks the phone as verified if correct
      const { data: verified, error: verifyError } = await supabase.rpc('verify_phone_otp', {
        p_user_id: user.id,
        p_otp_code: otpCode,
      });

      if (verifyError) throw verifyError;

      if (!verified) {
        toast({
          title: "Invalid or expired OTP",
          description: "The OTP you entered is incorrect or has expired. Please request a new one.",
          variant: "destructive",
        });
        setOtpSent(false);
        setOtpCode('');
        return;
      }

      toast({
        title: "Phone verified!",
        description: "Your phone number has been verified successfully",
      });

      setPhoneDialogOpen(false);
      setOtpSent(false);
      setOtpCode('');

      // Refresh profile
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-light flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-emerald" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Verification Center</h1>
          <p className="text-muted-foreground">
            Upload your documents to get verified and build trust
          </p>
        </div>

        {/* Verification Status */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold mb-1">Your Verification Status</h2>
              <p className="text-sm text-muted-foreground">
                Complete verification to unlock all features
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {[profile?.is_phone_verified, profile?.is_dl_verified].filter(Boolean).length}/2
              </p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
          
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald to-emerald-dark transition-all"
              style={{ 
                width: `${([profile?.is_phone_verified, profile?.is_dl_verified].filter(Boolean).length / 2) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-light flex items-center justify-center flex-shrink-0">
                    <doc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                    {getStatusBadge(doc.status, doc.isVerified)}
                  </div>
                </div>
              </div>

              {!doc.isVerified && (
                <div className="mt-6">
                  <input
                    type="file"
                    ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(doc.id, file);
                      }
                    }}
                  />
                  <div 
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                  >
                    {uploading === doc.id ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Phone Verification */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-light flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone Number</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {profile?.phone ? `+91 ${profile.phone}` : 'Verify your phone for quick login'}
                  </p>
                  {getStatusBadge(profile?.is_phone_verified ? 'verified' : 'pending', profile?.is_phone_verified || false)}
                </div>
              </div>
              {!profile?.is_phone_verified && (
                <Button variant="outline" size="sm" onClick={() => setPhoneDialogOpen(true)}>
                  Verify
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-light/50 border border-primary/20 rounded-2xl p-6 mt-8">
          <h3 className="font-semibold text-primary mb-2">Why verify?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              Instant booking approval
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              Higher trust score on your profile
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              Priority access to women-only rides
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald" />
              Ability to offer rides as a driver
            </li>
          </ul>
        </div>
      </div>

      {/* Phone OTP Dialog */}
      <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              {otpSent 
                ? "Enter the 6-digit code sent to your phone"
                : "Enter your phone number to receive a verification code"
              }
            </DialogDescription>
          </DialogHeader>
          
          {!otpSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-muted rounded-md border border-input">
                    <span className="text-sm text-muted-foreground">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSendOtp} 
                disabled={sendingOtp || phoneNumber.length !== 10}
                className="w-full"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button 
                onClick={handleVerifyOtp} 
                disabled={verifyingOtp || otpCode.length !== 6}
                className="w-full"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className="w-full"
              >
                Change phone number
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
