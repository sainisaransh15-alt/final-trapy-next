'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Trapy Terms and Conditions</h1>
            <p className="text-muted-foreground">
              <strong>Effective Date:</strong> January 13, 2026<br />
              <strong>Last Updated:</strong> January 13, 2026
            </p>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
            
            {/* 1. Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">1. Introduction</h2>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1.1 About Trapy</h3>
                <p className="text-muted-foreground">
                  Welcome to Trapy! These Terms and Conditions ("Terms") govern your access to and use of the Trapy platform, including our website, mobile applications, and all related services (collectively, the "Platform").
                </p>
                <p className="text-muted-foreground">
                  Trapy Inc. operates a ridesharing platform that connects drivers traveling to a destination with passengers going in the same direction, enabling them to share trips and costs while prioritizing safety through advanced security features.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">1.2 Our Mission</h3>
                <p className="text-muted-foreground">Trapy is committed to creating a safe, reliable, and community-driven ridesharing experience. We achieve this through:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Verified user profiles</li>
                  <li>Advanced safety features (live location tracking, SOS alerts, women safety features)</li>
                  <li>Transparent review systems</li>
                  <li>Secure payment processing</li>
                  <li>24/7 customer support</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">1.3 Platform Nature</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium text-foreground">IMPORTANT:</p>
                  <p className="text-muted-foreground">Trapy is a technology platform that facilitates connections between drivers and passengers. We are NOT a transportation carrier, employer of drivers, travel agency, or insurer. Drivers and passengers enter into direct agreements with each other.</p>
                </div>
              </div>
            </section>

            {/* 2. Definitions */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">2. Definitions</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>"Account":</strong> Your registered user profile on the Trapy Platform.</li>
                <li><strong>"Booking":</strong> A confirmed reservation for a Trip made by a Passenger.</li>
                <li><strong>"Driver":</strong> A user who offers and provides a Trip through the Platform.</li>
                <li><strong>"Passenger":</strong> A user who books a seat on a Trip offered by a Driver.</li>
                <li><strong>"Cost Contribution":</strong> The amount a Passenger pays to share trip costs (fuel, tolls, etc.).</li>
                <li><strong>"Service Fee":</strong> The fee charged by Trapy for use of the Platform.</li>
                <li><strong>"SOS Feature":</strong> Emergency alert system that notifies emergency contacts and authorities.</li>
                <li><strong>"Live Location Sharing":</strong> Real-time GPS tracking shared during an active trip.</li>
              </ul>
            </section>

            {/* 3. Acceptance of Terms */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">3. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By creating an account, accessing, or using the Trapy Platform, you agree to be bound by these Terms, our Privacy Policy, Data Deletion & Retention Policy, Cookie Policy, and Community Guidelines.
              </p>
              <h3 className="text-lg font-medium">3.2 Age and Capacity</h3>
              <p className="text-muted-foreground">
                You represent that you are at least 18 years of age and have the legal capacity to enter into binding contracts.
              </p>
            </section>

            {/* 4. Eligibility and Account Registration */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">4. Eligibility and Account Registration</h2>
              <p className="text-muted-foreground">
                To use the Platform, you must provide accurate, current, and complete information.
              </p>
              <h3 className="text-lg font-medium">4.2 Account Types</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Standard Account:</strong> Basic platform features for all eligible users.</li>
                <li><strong>Verified Account:</strong> Enhanced trust badge requiring government-issued ID.</li>
                <li><strong>Driver Account:</strong> Requires valid driver's license, vehicle registration, and insurance.</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                <strong>Identity Verification:</strong> You may be required to verify your identity by providing government-issued photo ID and a selfie for facial recognition.
              </p>
            </section>

            {/* 5. Platform Services */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">5. Platform Services</h2>
              <p className="text-muted-foreground">
                Trapy provides search and discovery of trips, secure messaging, payment processing, and safety tools. We strive to maintain continuous availability but do not guarantee uninterrupted access due to maintenance or force majeure events.
              </p>
            </section>

            {/* 6. User Responsibilities */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">6. User Responsibilities</h2>
              <p className="text-muted-foreground">All users must provide truthful information, comply with laws, and treat others with respect.</p>
              <h3 className="text-lg font-medium">6.2 Prohibited Misuse</h3>
              <p className="text-muted-foreground">You may NOT:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Use the Platform for illegal activities.</li>
                <li>Discriminate based on race, religion, gender, sexual orientation, or disability.</li>
                <li>Harass, threaten, or intimidate other users.</li>
                <li>Publish false listings or manipulate reviews.</li>
                <li>Use the Platform for commercial profit beyond cost sharing.</li>
              </ul>
            </section>

            {/* 7. Driver-Specific Terms */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">7. Driver-Specific Terms</h2>
              <h3 className="text-lg font-medium">7.1 Eligibility & Vehicle</h3>
              <p className="text-muted-foreground">
                Drivers must be at least 21 years old, hold a valid license for 2+ years, and own/operate an insured vehicle that meets safety standards.
              </p>
              <h3 className="text-lg font-medium">7.5 Cost Contribution Guidelines</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Cost Sharing Principle:</strong> Drivers may request a contribution to share expenses (fuel, tolls). This must NOT exceed actual costs. Drivers may NOT profit from cost contributions or use the platform as a taxi service.
                </p>
              </div>
            </section>

            {/* 8. Passenger-Specific Terms */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">8. Passenger-Specific Terms</h2>
              <p className="text-muted-foreground">
                Passengers must be punctual, respect the driver and vehicle, and pay the agreed cost contribution.
              </p>
              <h3 className="text-lg font-medium">8.4 Cancellations</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>&gt; 24 hours before: Full refund (minus service fee).</li>
                <li>&lt; 24 hours before: 50% refund.</li>
                <li>&lt; 2 hours or no-show: No refund.</li>
              </ul>
            </section>

            {/* 9. Safety Features */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">9. Safety Features</h2>
              <p className="text-muted-foreground">Safety is our top priority. Our features include:</p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="border p-4 rounded-lg">
                    <h3 className="font-bold mb-2">9.2 Live Location Sharing</h3>
                    <p className="text-sm text-muted-foreground">Real-time GPS tracking during active trips. Share your live location with designated emergency contacts automatically.</p>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="font-bold mb-2">9.3 SOS Emergency Feature</h3>
                    <p className="text-sm text-muted-foreground">One-tap emergency alert system that notifies contacts and authorities with your precise location and trip details.</p>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="font-bold mb-2">9.5 Women Safety Features</h3>
                    <p className="text-sm text-muted-foreground">Includes "Women-Only Rides," enhanced verification for female users, and a dedicated women safety helpline.</p>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="font-bold mb-2">9.7 Call Police Feature</h3>
                    <p className="text-sm text-muted-foreground">Direct connection to local emergency services with automatic location sharing.</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 italic">
                <strong>Disclaimer:</strong> Safety features are tools to enhance security but do not guarantee safety. Users are responsible for their own safety decisions.
              </p>
            </section>

            {/* 10. Booking, Payments, and Cancellations */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">10. Booking & Payments</h2>
              <p className="text-muted-foreground">
                Payments are processed securely via credit/debit cards, digital wallets, or UPI. Funds are held in escrow until trip completion.
              </p>
              <p className="text-muted-foreground">
                <strong>Service Fee:</strong> Trapy charges a service fee for platform use, displayed before booking.
              </p>
            </section>

            {/* 11. Reviews and Ratings */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">11. Reviews and Ratings</h2>
              <p className="text-muted-foreground">
                After each trip, drivers and passengers can rate each other (1-5 stars). Reviews must be honest, respectful, and relevant. Trapy reserves the right to remove reviews violating guidelines.
              </p>
            </section>

            {/* 12. Prohibited Conduct */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">12. Prohibited Conduct</h2>
              <p className="text-muted-foreground">
                We have zero tolerance for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Illegal activities or transporting illegal goods.</li>
                <li>Dangerous driving or driving under the influence.</li>
                <li>Sexual harassment, violence, or discrimination.</li>
                <li>Fraudulent activity or fake accounts.</li>
                <li>Commercial use (unlicensed taxi services).</li>
              </ul>
            </section>

            {/* 13. Content and Intellectual Property */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">13. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All Platform content is owned by Trapy. You grant Trapy a license to use content you post (reviews, profiles) for platform operations.
              </p>
            </section>

            {/* 14. Privacy and Data Protection */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">14. Privacy</h2>
              <p className="text-muted-foreground">
                We collect account, trip, location, and payment data to provide services. By using safety features (SOS, Live Tracking), you consent to sharing your location with emergency contacts and authorities. Refer to our Privacy Policy for full details.
              </p>
            </section>

            {/* 15. Liability and Disclaimers */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">15. Liability and Disclaimers</h2>
              <div className="bg-muted/30 p-4 border-l-4 border-primary">
                <p className="text-muted-foreground uppercase font-bold text-xs mb-2">Disclaimer</p>
                <p className="text-muted-foreground">
                  THE PLATFORM IS PROVIDED "AS IS". TRAPY IS NOT A PARTY TO AGREEMENTS BETWEEN USERS AND IS NOT LIABLE FOR THE ACTIONS OF DRIVERS OR PASSENGERS. OUR TOTAL LIABILITY IS LIMITED TO THE AMOUNTS PAID TO TRAPY IN THE PREVIOUS 12 MONTHS OR $100 USD.
                </p>
              </div>
            </section>

            {/* 16. Insurance */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">16. Insurance</h2>
              <p className="text-muted-foreground">
                <strong>Drivers:</strong> Must maintain valid vehicle insurance that covers passengers. Personal auto policies may exclude ridesharing; you must verify coverage.
              </p>
              <p className="text-muted-foreground">
                <strong>Trapy:</strong> Is not an insurance provider. Users are solely responsible for understanding their insurance needs.
              </p>
            </section>

            {/* 17. Dispute Resolution */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">17. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                Disputes should be resolved via direct communication or Trapy support mediation. If unresolved, you agree to <strong>binding arbitration</strong> rather than court litigation, waiving rights to class actions.
              </p>
            </section>

            {/* 18. Termination */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">18. Termination</h2>
              <p className="text-muted-foreground">
                You may terminate your account at any time. Trapy may suspend or terminate accounts for violations of these Terms, fraud, or safety concerns.
              </p>
            </section>

            {/* 19. Modifications */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">19. Modifications</h2>
              <p className="text-muted-foreground">
                We may modify these terms at any time. Continued use constitutes acceptance. Material changes will be notified via email or in-app.
              </p>
            </section>

            {/* 20 & 21. Contact & General */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">20. Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold mb-2">Customer Support</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>Email: <a href="mailto:support@trapy.com" className="text-primary hover:underline">support@trapy.com</a></li>
                    <li>Live Chat: Available in mobile app</li>
                  </ul>
                </div>
                <div>
                    <h3 className="font-bold mb-2">Safety Emergencies</h3>
                    <ul className="text-muted-foreground space-y-1">
                        <li>Email: <a href="mailto:safety@trapy.com" className="text-primary hover:underline">safety@trapy.com</a></li>
                        <li>Emergency Hotline: Available 24/7 in-app</li>
                    </ul>
                </div>
                <div className="md:col-span-2">
                   <h3 className="font-bold mb-2">Legal</h3>
                   <p className="text-muted-foreground">
                     Trapy Inc.<br/>
                     Email: <a href="mailto:legal@trapy.com" className="text-primary hover:underline">legal@trapy.com</a><br/>
                     Website: www.trapy.com
                   </p>
                </div>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t text-center text-muted-foreground text-sm">
                <p className="font-bold mb-2">ACKNOWLEDGMENT</p>
                <p>BY CREATING AN ACCOUNT OR USING THE TRAPY PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.</p>
                <p className="mt-4">© 2026 Trapy Inc. All rights reserved.</p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;