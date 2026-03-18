'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Refund & Cancellation Policy</h1>
            <p className="text-muted-foreground">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
            
            {/* Note: Sections 1-3 were not provided in your text, keeping placeholders or basic structure */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">1. Cancellation Policy Overview</h2>
              <p className="text-muted-foreground">
                Trapy aims to provide a fair cancellation policy for both riders and drivers. Specific cancellation windows and fees are determined by the ride category and booking time.
              </p>
            </section>

            {/* 2. Automatic Refund Triggers (From Input 3.1) */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">2. Automatic Refund Triggers</h2>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium">System-Initiated Automatic Refunds</h3>
                <p className="text-muted-foreground">Refunds are processed automatically without user intervention in the following scenarios:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Driver Cancellation:</strong> Ride cancelled by driver at any time (100% refund + ₹50 compensation credit).</li>
                  <li><strong>Passenger Free Cancellation:</strong> Ride cancelled within passenger’s free cancellation window (100% refund).</li>
                  <li><strong>Technical Glitches:</strong> Duplicate charges refunded within 30 minutes.</li>
                  <li><strong>Ride Not Started:</strong> Payment captured but ride never started (100% refund + 10% compensation).</li>
                  <li><strong>Driver Delay:</strong> Significantly delayed driver arrival (30+ minutes late triggers 25% partial refund).</li>
                  <li><strong>Route Deviations:</strong> GPS-verified unreasonable route deviations (difference + 10% compensation auto-refunded).</li>
                </ul>
              </div>

              <div className="space-y-3 mt-6">
                <h3 className="text-lg font-medium">AI-Monitored Quality Refunds</h3>
                <p className="text-muted-foreground">Trapy’s Gemini-powered AI assistant monitors ride quality and automatically triggers refunds for:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Harsh Driving:</strong> Braking/acceleration patterns exceed safety thresholds (15% refund).</li>
                  <li><strong>Unexplained Stops:</strong> Driver takes breaks/detours exceeding 10 minutes (proportional refund).</li>
                  <li><strong>Speeding:</strong> Vehicle speed consistently exceeds safe limits (20% refund + driver warning).</li>
                  <li><strong>Tracking Failure:</strong> Live location tracking fails for 5+ minutes (25% refund).</li>
                  <li><strong>Excessive Duration:</strong> Ride duration exceeds estimate by 40%+ without traffic justification (30% refund).</li>
                </ul>
              </div>
            </section>

            {/* 3. Refund Processing Timeline (From Input 3.2) */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">3. Refund Processing Timeline</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-bold mb-2">Trapy Wallet (Instant)</h3>
                  <p className="text-sm text-muted-foreground">Refund credited immediately upon approval. Available for immediate use on next ride with no processing delays.</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-bold mb-2">Expedited Option</h3>
                  <p className="text-sm text-muted-foreground">Select "Credit to Wallet Instantly" during refund request to receive 100% of amount immediately, bypassing bank processing times.</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Original Payment Method Timelines</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">Method</th>
                        <th className="py-2">Razorpay Timeline</th>
                        <th className="py-2">Cashfree Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2 font-medium">UPI</td>
                        <td className="py-2">1-3 business days (usually 24hrs)</td>
                        <td className="py-2">1-2 business days (usually 12-24hrs)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Credit Cards</td>
                        <td className="py-2">5-7 business days</td>
                        <td className="py-2">5-7 business days</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Debit Cards</td>
                        <td className="py-2">5-7 business days</td>
                        <td className="py-2">5-7 business days</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Digital Wallets</td>
                        <td className="py-2">3-5 business days</td>
                        <td className="py-2">3-4 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. Full Refund Scenarios (From Input 3.4) */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">4. Full Refund Scenarios</h2>
              
              <h3 className="text-lg font-medium">100% Refund Situations</h3>
              <p className="text-muted-foreground">Complete refunds (plus ₹100-200 compensation) are issued for:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Driver no-show (20 mins past pickup).</li>
                <li>Identity/Vehicle mismatch (photo, license, color, model).</li>
                <li>Driver demanding offline payment or fare manipulation.</li>
                <li>SOS feature activation or Police helpline contact.</li>
                <li>Driver under influence of alcohol/drugs (verified).</li>
                <li>Women-only ride gender requirement violation.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Ride Interruption</h3>
              <p className="text-muted-foreground">
                If a ride terminates mid-journey (breakdown, medical emergency):
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Standard:</strong> Pro-rated fare + 20% discount on completed portion + priority rebooking.</li>
                <li><strong>Driver Fault:</strong> 100% refund for completed/pending portions + ₹150 compensation.</li>
              </ul>
            </section>

            {/* 5. Request Process (From Input 3.5) */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">5. How to Request a Refund</h2>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                <li>Navigate to <strong>"My Rides"</strong> and select the specific trip.</li>
                <li>Tap <strong>"Report Issue/Request Refund"</strong>.</li>
                <li>Choose category (quality issue, overcharge, safety, etc.).</li>
                <li>Provide description (min 20 chars) and upload evidence (photos/audio).</li>
                <li>Submit to receive a unique ticket number.</li>
              </ol>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                <h4 className="font-bold text-blue-800 dark:text-blue-300">AI Pre-Screening</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Trapy’s AI analyzes requests instantly. 70-80% of straightforward cases are auto-approved within 5-15 minutes. Complex or safety-related cases are escalated to human review (Priority 1 safety cases reviewed within 2 hours).
                </p>
              </div>
            </section>

            {/* 6. Appeals & Special Policies (From Input 3.6 & 3.7) */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">6. Appeals & Special Policies</h2>
              
              <h3 className="text-lg font-medium">Appeals Process</h3>
              <p className="text-muted-foreground">
                Denied requests can be appealed within 7 days. Senior support reviews appeals within 72 hours. Further escalation to the <strong>Customer Advocacy Team</strong> is available for disputes over ₹200 or safety incidents.
              </p>

              <h3 className="text-lg font-medium mt-4">Women-Only Ride Enhanced Refunds</h3>
              <p className="text-muted-foreground">
                Any safety concern qualifies for <strong>full refund + ₹200 compensation</strong>, no questions asked. 1.5x standard refund amounts for quality issues.
              </p>

              <h3 className="text-lg font-medium mt-4">Loyalty Benefits</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Silver (50+ rides):</strong> 10% refund bonus.</li>
                <li><strong>Gold (200+ rides):</strong> 15% bonus + 24hr priority processing.</li>
                <li><strong>Platinum (500+ rides):</strong> 20% bonus + 12hr processing + direct advocacy access.</li>
              </ul>
            </section>

            {/* 7. Non-Refundable Items (From Input 3.8) */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">7. Non-Refundable Items</h2>
              <p className="text-muted-foreground">The following items are generally non-refundable:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Service Fees:</strong> For successfully completed rides (covers insurance and tech).</li>
                <li><strong>Valid Cancellation Fees:</strong> Fees assessed when passenger cancels outside the free window.</li>
                <li><strong>Voluntary Add-Ons:</strong> Priority pickup, pet-friendly upgrades, or extra luggage fees once ride commences.</li>
                <li><strong>Expired Credits:</strong> Promotional credits or referral bonuses that have expired.</li>
                <li><strong>Processing Fees:</strong> Wallet withdrawal fees (2%) and international currency conversion fees.</li>
              </ul>
            </section>

            <section className="space-y-4 pt-6 border-t">
              <h2 className="text-2xl font-semibold">8. Contact Us</h2>
              <p className="text-muted-foreground">
                For unresolved refund inquiries or to escalate a dispute, please contact us at{' '}
                <a href="mailto:support@trapy.in" className="text-primary hover:underline font-medium">
                  support@trapy.in
                </a>
                {' '}or use the in-app Help Center.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                External Dispute Resolution: Users may also contact the National Consumer Helpline (1800-11-4000) for unresolved disputes.
              </p>
            </section>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPolicy;