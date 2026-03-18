'use client';
import { ArrowLeft, Trash2, Shield, Clock, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

const AccountDeletion = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Data Deletion & Retention Policy</h1>
            <p className="text-muted-foreground">
              <strong>Effective Date:</strong> January 13, 2026
            </p>
            <p className="mt-4 text-muted-foreground">
              At Trapy, we manage your data with the same transparency we use to build our community. This policy explains how long we keep your information, the deletion process, and how we protect your privacy.
            </p>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
            
            {/* 1. Account Deletion Process */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
                <Trash2 className="w-6 h-6" />
                1. Account Deletion Process
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-bold mb-2">How to Request</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                    <li><strong>Mobile App:</strong> Profile &gt; Settings &gt; Delete My Account</li>
                    <li><strong>Website:</strong> Account Settings &gt; Privacy &gt; Delete My Account</li>
                    <li><strong>Email:</strong> privacy@trapy.com</li>
                  </ul>
                </div>

                <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2">1.2 The 30-Day Timeline</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-bold text-foreground">Phase 1: Immediate (24 hours)</span>
                      <p className="text-muted-foreground">Profile becomes invisible. New bookings disabled. Active trips cancelled.</p>
                    </div>
                    <div>
                      <span className="font-bold text-foreground">Phase 2: Grace Period (Days 0-14)</span>
                      <p className="text-muted-foreground">You can restore your account simply by logging in. Deletion stops immediately.</p>
                    </div>
                    <div>
                      <span className="font-bold text-foreground">Phase 3: Permanent Deletion (Days 15-30)</span>
                      <p className="text-muted-foreground">Data removal begins. Reactivation is no longer possible. By Day 30, all personal data is permanently wiped.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <h3 className="font-bold text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Active Trip Warning
                </h3>
                <p className="text-sm text-amber-900/80 dark:text-amber-400">
                  If you have a trip scheduled within 48 hours, deletion may be delayed until trip completion to ensure passenger safety. Pending payments will be processed before final deletion.
                </p>
              </div>
            </section>

            {/* 2. Retention Schedule */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
                <Clock className="w-6 h-6" />
                2. Data Retention Schedule
              </h2>
              <p className="text-muted-foreground">We do not keep data longer than necessary. Our retention periods are based on legal requirements and safety protocols.</p>
              
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Retention Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium">Standard Account Data</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">30 days after closure</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Processing period & grace period</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium">Financial & Tax Records</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">10 Years</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Legal obligation for tax compliance</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium">Live Location Data</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">7 Days</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Short-term safety verification</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium">SOS/Emergency Data</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">7 Years</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Legal claims & safety investigations</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium">Detailed Route Data</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">90 Days</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Operational purposes</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium">ID Verification Docs</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">2 Years</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Fraud prevention & KYC compliance</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium">Suspended Accounts</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">2-10 Years</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Depending on violation severity</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground italic">
                *After 5 years of inactivity, accounts are automatically closed following multiple notifications.
              </p>
            </section>

            {/* 3. Technical Deletion Process */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
                <Shield className="w-6 h-6" />
                3. Technical Security Protocol
              </h2>
              <div className="space-y-4">
                <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                  <li><strong>Immediate Production Removal (Day 0-1):</strong> PII flagged, profile hidden, sessions terminated.</li>
                  <li><strong>Soft Deletion (Days 1-14):</strong> Data hidden but recoverable by admins only.</li>
                  <li><strong>Hard Deletion (Days 15-30):</strong> PII overwritten with random values. Search indexes purged. Content anonymized (reviews show "Deleted User").</li>
                  <li><strong>Backup Purging (Days 30-90):</strong> Data removed from encrypted rolling backups.</li>
                  <li><strong>Archival:</strong> Only legally required data (tax/safety) moves to isolated, encrypted cold storage.</li>
                  <li><strong>Third-Party Propagation:</strong> Deletion requests sent to processors (Stripe, AWS, etc.).</li>
                </ol>
              </div>
            </section>

            {/* 4. Exceptions & Third Parties */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary">4. Exceptions & Third Parties</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-2">Data We Cannot Delete</h3>
                  <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                    <li>Financial transaction records (Tax law)</li>
                    <li>Identity verification docs (AML regulations)</li>
                    <li>Safety incident reports (Legal holds)</li>
                    <li>Anonymized aggregate statistics</li>
                    <li>Reviews written about you (Anonymized)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Third-Party Processors</h3>
                  <p className="text-sm text-muted-foreground mb-2">We notify our partners to delete your data:</p>
                  <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                    <li><strong>Payments:</strong> Stripe, Razorpay (Retained for fraud prevention)</li>
                    <li><strong>ID Checks:</strong> Onfido, Jumio (2-year retention)</li>
                    <li><strong>Cloud:</strong> AWS, Google Cloud (90-day cycle)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Your Rights */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
                <FileText className="w-6 h-6" />
                5. Your Data Rights
              </h2>
              <p className="text-muted-foreground">Under GDPR, CCPA, and DPDP laws, you have the right to:</p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <ul className="list-disc pl-4 space-y-2">
                  <li><strong>Access:</strong> Request a full copy of your data (JSON/CSV).</li>
                  <li><strong>Rectification:</strong> Correct inaccurate information.</li>
                  <li><strong>Deletion:</strong> The "Right to be Forgotten".</li>
                  <li><strong>Portability:</strong> Move your data to another service.</li>
                </ul>
                <ul className="list-disc pl-4 space-y-2">
                  <li><strong>Restriction:</strong> Pause processing during disputes.</li>
                  <li><strong>Objection:</strong> Opt-out of marketing or automated profiling.</li>
                  <li><strong>Withdraw Consent:</strong> For optional features (analytics).</li>
                </ul>
              </div>
            </section>

            {/* 6. Contact Information */}
            <section className="space-y-6 pb-6 border-b">
              <h2 className="text-2xl font-semibold text-primary">6. Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold">Data Privacy Requests</h3>
                  <p className="text-muted-foreground">Email: <a href="mailto:privacy@trapy.com" className="text-primary hover:underline">privacy@trapy.com</a></p>
                  <p className="text-xs text-muted-foreground mt-1">Response time: 3 business days</p>
                </div>
                <div>
                  <h3 className="font-bold">Safety Team</h3>
                  <p className="text-muted-foreground">Email: <a href="mailto:safety@trapy.com" className="text-primary hover:underline">safety@trapy.com</a></p>
                  <p className="text-xs text-muted-foreground mt-1">Available 24/7 for emergencies</p>
                </div>
              </div>
            </section>

            {/* Interactive Deletion Cards */}
            {user && (
              <Card className="border-destructive/50 bg-destructive/5 mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5" />
                    Delete Your Account
                  </CardTitle>
                  <CardDescription>
                    This action initiates the 30-day deletion process. You can cancel within the first 14 days.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    To expedite your request, please contact our Data Protection Officer directly.
                  </p>
                  <Button variant="destructive" className="w-full sm:w-auto" asChild>
                    <a href="mailto:privacy@trapy.com?subject=Data Deletion Request&body=I would like to request the deletion of my Trapy account associated with this email address.">
                      Email Data Protection Officer
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {!user && (
              <Card className="mt-8 bg-muted/50">
                <CardHeader>
                  <CardTitle>Need to Close Your Account?</CardTitle>
                  <CardDescription>
                    Please sign in to request deletion via settings, or contact privacy support directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild>
                      <Link href="/auth">Sign In</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="mailto:privacy@trapy.com?subject=Account Deletion Request">
                        Contact Privacy Team
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountDeletion;