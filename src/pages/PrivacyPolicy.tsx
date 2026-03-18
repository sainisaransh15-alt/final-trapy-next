'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">PRIVACY AND DATA PROTECTION POLICY</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-foreground">
            <p className="text-muted-foreground text-sm">
              Version applicable from January 13, 2026
            </p>

            {/* 1. General */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. General</h2>
              <p className="text-muted-foreground">
                Trapy Inc. (hereinafter, "Trapy"), (whose registered office is located at [Your Company Address]) attaches great importance to the protection and respect of your privacy.
              </p>
              <p className="text-muted-foreground">
                Trapy has developed a ridesharing platform accessible on a website or in the form of a mobile application, designed to connect drivers traveling to a given destination with passengers going in the same direction, enabling them to share trips and associated costs while ensuring maximum safety through advanced security features (hereinafter, the "Platform").
              </p>
              <p className="text-muted-foreground">
                Trapy Inc. acts as a data controller regarding the collection, use and sharing of the information that you provide to us through the Platform.
              </p>
              <p className="text-muted-foreground">
                This Privacy Policy (together with our Terms & Conditions and any document referred to therein as well as our Cookie Policy) explains how we process the personal data we collect and that you provide to us. We invite you to read this document carefully to know and understand our practices regarding the processing of your personal data that we implement.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
              <p className="text-muted-foreground">We may collect and process the following data:</p>
              
              <h3 className="text-xl font-semibold">2.1. Information You Send to Us Directly</h3>
              <p className="text-muted-foreground">
                By using our Platform, you may provide us with information, some of which may identify you or the passengers for whom you are making reservations ("Personal Data"). This is particularly the case when you fill out forms (such as the registration form), when you participate in one of our games, competitions, promotional offers, studies or surveys, when you contact us – whether by telephone, email or any other means of communication – or when you inform us of a problem concerning the use of our Platform.
              </p>
              <p className="text-muted-foreground">This information contains in particular the following data:</p>

              <h4 className="text-lg font-medium">2.1.1. Data necessary for registration and provision of services:</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Account Creation:</strong> Your first and last name, email address, date of birth, gender (optional), and password are required to create an account on the Platform</li>
                <li><strong>Profile Verification:</strong> Your telephone number is mandatory for all users to ensure account security and enable communication</li>
                <li><strong>Carpool Trip Publishing/Booking:</strong> Your telephone number and vehicle details (for drivers) are necessary for publishing or booking a carpool trip</li>
                <li><strong>Enhanced Safety Features:</strong> When using our safety features, we may collect additional data as described in section 2.1.15 below</li>
              </ul>
              <p className="text-muted-foreground">Without providing this information, Trapy will not be able to provide you with the services offered by our Platform.</p>

              <h4 className="text-lg font-medium">2.1.2 - 2.1.14. Additional Data Collected:</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>A photograph published on your profile</li>
                <li>A postal address for pickup and drop-off locations</li>
                <li>Your mini-biography</li>
                <li>Your gender, which helps us provide gender-specific safety features (such as women-only rides)</li>
                <li>A copy of all written exchanges between you and Trapy; we may record and/or listen to telephone conversations between you and Trapy (for example, with our Customer Service)</li>
                <li>A copy of all reservations or publications made on our Platform</li>
                <li>Details of financial or accounting transactions carried out on our Platform or by any other means, including information relating to your payment card, your banking details, and information relating to journeys booked or published. This information may include your travel preferences</li>
                <li>Details of your visits to our Platform and the content you accessed</li>
                <li>Your responses to our surveys and questionnaires and the ratings/reviews you have left to evaluate a trip made through our Platform</li>
                <li>Data that we may ask you to provide when you notify us of a problem relating to our Platform or our services, such as the subject of your support request</li>
                <li>Data linked to your location to respond to your search for trips near you or to facilitate the publication of a trip</li>
                <li>A copy of your driver's license, government-issued ID, passport, or any other identity document that you have agreed to provide to us as part of the Verified Profile program</li>
                <li>Vehicle registration documents and insurance details (for drivers)</li>
              </ul>

              <h4 className="text-lg font-medium">2.1.15. Safety and Security Data:</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Live Location Sharing:</strong> When you enable the live location sharing feature during a trip, we collect and temporarily process your real-time GPS location data to share with your emergency contacts or trusted individuals you have designated</li>
                <li><strong>SOS Feature:</strong> When you activate the SOS feature, we collect your precise location, trip details, and user information to immediately alert emergency services and your designated emergency contacts</li>
                <li><strong>Emergency Contacts:</strong> Contact information (name, phone number, relationship) of individuals you designate to be notified in case of emergency</li>
                <li><strong>Women Safety Features:</strong> When using women-only ride options or women safety features, we process your gender information and may collect additional verification data</li>
                <li><strong>Audio/Video Recording:</strong> If you choose to activate in-trip safety recording features, we may temporarily store audio or video recordings of your journey (with clear notice and consent)</li>
                <li><strong>Police Integration Data:</strong> When you use the "Call Police" feature, we share your location, trip details, and relevant user information with law enforcement authorities</li>
                <li><strong>Women Helpline Integration:</strong> When using the women helpline feature, we share necessary information with designated women safety helpline services</li>
              </ul>
            </section>

            {/* 3. How Do We Use the Data We Collect? */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. How Do We Use the Data We Collect?</h2>
              <p className="text-muted-foreground">We implement various processing operations relating to your personal data, the purposes and legal bases of which are detailed below:</p>

              <h3 className="text-xl font-semibold">Allow You to Use the Platform</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>3.1</strong> Execute contracts entered into between you and us and provide you with the information and services requested. This processing is necessary for the performance of our respective contractual obligations.</li>
                <li><strong>3.2</strong> Collect your payments and send you the amounts owed to you via our payment solutions. This processing is necessary for the performance of our respective contractual obligations and compliance with our legal obligations.</li>
                <li><strong>3.3</strong> Enable safety and security features including live location tracking, SOS alerts, emergency contact notifications, and integration with emergency services. This processing is necessary for the performance of our contractual obligations and is based on your explicit consent for location-based safety features.</li>
                <li><strong>3.4</strong> Allow you to personalize your profile on our Platform. This processing is carried out on the basis of your consent. You can withdraw your consent at any time by deleting your personalized information in your profile or by contacting our Customer Service.</li>
                <li><strong>3.5</strong> Allow you to communicate and exchange with other members of our community, in particular with regard to our services or the journey(s) already taken or that you plan to take. This processing is necessary for the performance of our respective contractual obligations.</li>
                <li><strong>3.6</strong> Allow you to use the interactive features of our services, such as searching for trips around you based on your location or publishing trips based on your location. This processing is necessary for the performance of our respective contractual obligations.</li>
                <li><strong>3.7</strong> Provide gender-specific safety features such as women-only rides and enhanced verification for women travelers. This processing is based on your consent and our legitimate interest in providing a safe environment for all users.</li>
              </ul>

              <h3 className="text-xl font-semibold">Customer Service Management</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>3.8</strong> Give you access and allow you to communicate with our Customer Service. This processing is necessary for the execution of our respective contractual obligations.</li>
                <li><strong>3.9</strong> Improve our Customer Service and train our customer advisors by recording your telephone conversations with us. This processing is based on our legitimate interests (providing you with quality customer support/improving our customer support). You can object to this processing during each contact.</li>
              </ul>

              <h3 className="text-xl font-semibold">Safety, Security and Fraud Prevention</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>3.10</strong> Detect, prevent and react to any breach or non-compliance on your part with the Terms and Conditions. For these purposes, we use automatic analysis technologies of your use of the Platform. In this context, certain decisions can be taken automatically. These decisions are based on defined criteria and aim to identify and prevent fraudulent behavior and ensure user safety within our services. To make these automated decisions, we may process different categories of data, including email address, telephone number, IP address, information relating to payment methods, information about your use of our services, trip history, safety feature usage patterns, etc.</li>
                <li><strong>3.11</strong> Verify your identity declared on your profile and allow you to obtain the "Verified Profile" badge. This processing is necessary for the performance of our respective contractual obligations.</li>
                <li><strong>3.12</strong> Monitor trips using safety features to ensure user security and respond to emergency situations. This processing is based on our legitimate interest in ensuring user safety and is necessary for compliance with our duty of care obligations.</li>
                <li><strong>3.13</strong> Process and respond to SOS alerts, including sharing your location and trip details with emergency services, police, designated helplines, and your emergency contacts. This processing is necessary for the protection of vital interests of you or another person.</li>
                <li><strong>3.14</strong> Store and analyze safety incident reports to improve our security features and prevent future incidents. This processing is based on our legitimate interest in maintaining a safe platform.</li>
              </ul>

              <h3 className="text-xl font-semibold">Communications</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>3.15</strong> Send you the documents and information necessary for the use of our services (such as reservation confirmations, trip reminders, safety alerts) by email, text messages, push notifications, or any other means of communication. This processing is necessary for the performance of our respective contractual obligations. You can change your communication preferences in your profile settings on the app.</li>
                <li><strong>3.16</strong> Inform you, by email, SMS, push notification, or any other means of communication, of changes made to our services and to support you in the use of our services, including safety features. This processing is carried out on the basis of our legitimate interest (providing you with relevant information). You can manage your preferences directly in the preference center.</li>
                <li><strong>3.17</strong> Contact you by email, text message, telephone call, or other means of communication for marketing purposes regarding Trapy services and products. This processing is based on our legitimate interest (to offer you relevant information). You have a right to object which you can exercise by modifying your communication preferences in your profile settings, by contacting our Customer Service, or by following the specific instructions provided in the communication (e.g., clicking the unsubscribe link, responding with 'STOP', etc.).</li>
                <li><strong>3.18</strong> Send you emails for marketing purposes regarding the services and products of our third-party partners. This processing is based on your consent. You can withdraw your consent via your communications preferences in your profile, by clicking on the unsubscribe link, or by contacting our Customer Service.</li>
                <li><strong>3.19</strong> Send you advertising messages that may be of interest to you on social media platforms or third-party sites. This processing is based on our legitimate interest (to offer you relevant advertising) or on your consent when required by law. You can object via your cookie preferences.</li>
                <li><strong>3.20</strong> Monitor customer relations and carry out satisfaction surveys and studies. This processing is based on our legitimate interest (evaluating our Platform and services to improve them). You can object to this processing during the contact.</li>
                <li><strong>3.21</strong> Evaluate the effectiveness of advertising messages we send and adapt them to our users. This processing is based on our legitimate interest (measuring and optimizing advertising campaigns) or on your consent when required by law.</li>
              </ul>

              <h3 className="text-xl font-semibold">Improving and Securing Our Platform</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>3.22</strong> Manage our Platform and carry out internal technical operations in the context of problem solving, data analysis, testing, and research. This processing is based on our legitimate interest (ensuring the security of our Platform and improving its characteristics).</li>
                <li><strong>3.23</strong> Improve and optimize our Platform, including our safety features, to ensure that content display is adapted to your device. This processing is based on our legitimate interest (providing you with relevant content and enhanced safety features).</li>
              </ul>

              <h3 className="text-xl font-semibold">Studies and Research</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>3.24</strong> Carry out studies or research in the field of transportation safety, mobility, environment, energy savings, or performance analysis. This processing is based on our legitimate interest (evaluating the impacts and safety of our mobility offers) or is necessary to comply with our legal obligations.</li>
              </ul>

              <h3 className="text-xl font-semibold">Responding to Legal Requests and Protecting Rights</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>3.25</strong> Respond to legal requisitions or any other legally founded request, including requests from law enforcement agencies in emergency situations. This processing is based on our legal obligations and the protection of vital interests.</li>
                <li><strong>3.26</strong> Defend and protect our interests when necessary for the establishment, exercise or defense of a legal right. This processing is based on the performance of the contract or our legitimate interests.</li>
                <li><strong>3.27</strong> Cooperate with law enforcement and emergency services to ensure user safety and respond to incidents. This processing is based on our legal obligations and the protection of vital interests.</li>
              </ul>
            </section>

            {/* 4. Who Are the Recipients of the Information We Collect? */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Who Are the Recipients of the Information We Collect?</h2>
              
              <p className="text-muted-foreground">
                <strong>4.1</strong> As part of the use of our services, some of your information is transmitted to other members of our community through your public profile or as part of the reservation process (e.g., we communicate your telephone number to the people with whom you will be traveling). For women-only rides, gender information is shared only with verified female users. We publish the reviews you write on our Platform.
              </p>

              <p className="text-muted-foreground">
                <strong>4.2</strong> When you use safety features such as live location sharing, your location data is shared with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Emergency contacts you have designated</li>
                <li>Other passengers or drivers in the same trip (if you enable trip tracking)</li>
                <li>Emergency services when you activate the SOS feature</li>
                <li>Law enforcement when you use the "Call Police" feature</li>
                <li>Women helpline services when you use the women safety feature</li>
              </ul>

              <p className="text-muted-foreground">
                <strong>4.3</strong> We may share information about you with other entities of the Trapy group within the framework provided for in this Privacy Policy. In the event that we sell or acquire a company or assets, we reserve the right to share your Personal Data with the potential seller or buyer. If Trapy or its assets are purchased by a third party, the data in our possession will be transferred to the new owner.
              </p>

              <p className="text-muted-foreground">
                <strong>4.4</strong> We may disclose information about you to courts, police authorities, emergency services, women safety organizations, governmental or public authorities, or authorized third parties when:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>We have a legal obligation to do so</li>
                <li>It is necessary to respond to emergencies involving public health or physical safety</li>
                <li>It is necessary to respond to SOS alerts or safety incidents</li>
                <li>Required for investigations into safety violations or criminal activities</li>
                <li>Necessary to enforce our Terms and Conditions</li>
                <li>Required to guarantee the rights, property, and security of Trapy, its members, and third parties</li>
              </ul>

              <p className="text-muted-foreground">
                <strong>4.5</strong> We work in close collaboration with third-party organizations which may have access to your Personal Data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Emergency Services Providers:</strong> Organizations that respond to SOS alerts and emergency situations</li>
                <li><strong>Women Safety Helplines:</strong> Government and NGO helplines that provide support to women in distress</li>
                <li><strong>Law Enforcement Agencies:</strong> Police and other authorities for emergency response and investigations</li>
                <li><strong>Location Services Providers:</strong> Services that enable live location tracking and sharing</li>
                <li>Social media platforms which may offer features allowing integration with your Trapy profile</li>
                <li>Our commercial partners who promote their services on our Platform (insurance services, banking services, vehicle rental services, etc.)</li>
                <li>Our insurance partners for eligibility verification, pricing, subscription management, and claims processing</li>
                <li>Our business partners on whose websites we may advertise our services</li>
                <li>Subcontractors for technical services, payment processing, identity verification, driver's license verification, customer relations, and analytical solutions</li>
              </ul>

              <p className="text-muted-foreground">
                <strong>4.6</strong> We share your data with the third parties mentioned above only in the following cases:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>When we use a service provider as part of executing a contract with you or to provide or improve our services</li>
                <li>When we use analytics providers to improve and optimize our Platform</li>
                <li>When you expressly request it (e.g., when subscribing to a partner service or activating safety features)</li>
                <li>When you activate emergency features (SOS, Call Police, Women Helpline) that require sharing data for your protection</li>
                <li>When necessary to protect vital interests in emergency situations</li>
                <li>When distributing parts of our Platform on partner websites via APIs or widgets</li>
              </ul>

              <p className="text-muted-foreground">
                <strong>4.7</strong> In accordance with applicable legislation and with your consent where required, we may aggregate data which concerns you with information from our partners. This aggregated information will only be used for the purposes described in this policy.
              </p>

              <p className="text-muted-foreground">
                <strong>4.8</strong> If you decide to let us access some of your information via connection services made available by our partners, their privacy policies are also binding on you. We have no control over the collection or processing of your data implemented by our partners on their own platforms.
              </p>
            </section>

            {/* 5. How Do We Use and Moderate Your Messages? */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. How Do We Use and Moderate Your Messages?</h2>
              
              <p className="text-muted-foreground">
                <strong>5.1</strong> We may monitor messages that you exchange with other members of our community via our Platform for purposes of:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Fraud prevention</li>
                <li>Service improvement</li>
                <li>User assistance</li>
                <li>Safety monitoring</li>
                <li>Verification of compliance with our Terms and Conditions</li>
              </ul>
              <p className="text-muted-foreground">
                To prevent circumvention of our platform rules and to ensure user safety, we may browse and analyze messages exchanged on our Platform to ensure they do not contain contact details meant to bypass our safety systems, references to other websites, threats, harassment, or inappropriate content. This may result in blocking or filtering of all or part of these messages.
              </p>

              <p className="text-muted-foreground">
                <strong>5.2</strong> We never use your communications with other members for promotional or advertising targeting purposes. Where possible, we use automated systems to moderate messages transmitted between members via our Platform, without any individual decision being made, except in cases involving safety concerns or suspected Terms violations.
              </p>
            </section>

            {/* 6. Targeted Online Advertising and Ad Personalization */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Targeted Online Advertising and Ad Personalization</h2>
              
              <p className="text-muted-foreground">
                <strong>6.1</strong> In accordance with applicable law and with your consent where required, we may use the data you provide on our Platform (such as profile data and browsing data) to display targeted advertisements on social media platforms or third-party sites based on your profile and interests. This processing is based on our legitimate interest in showing you relevant advertisements. You can object at any time by configuring your account settings or contacting us as described in Article 13 below.
              </p>

              <p className="text-muted-foreground">
                <strong>6.2</strong> In accordance with applicable laws, we use data collected through cookies and similar technologies to display personalized advertisements through our mobile app and website. These ads may be based on factors such as your activity on our Platform, your approximate location, and certain online interactions. This processing is based on our legitimate interest in earning revenue through relevant advertising. You can opt out through your device settings, ad preferences, or by adjusting cookie permissions in your browser. If opted out, the ads you see will be less relevant to your interests. For more details, please refer to our Cookie Policy.
              </p>
            </section>

            {/* 7. Is Your Data Transferred, How and Where? */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Is Your Data Transferred, How and Where?</h2>
              
              <p className="text-muted-foreground">
                <strong>7.1</strong> As a general rule, we store your Personal Data within [Your Country/Region]. However, to the extent that some of our service providers (including emergency services integrations, safety feature providers, and cloud infrastructure providers) are located in countries outside [Your Country/Region] ("Third Countries"), we transfer some of your Personal Data to Third Countries.
              </p>

              <p className="text-muted-foreground">
                <strong>7.2</strong> For emergency situations involving the SOS feature, Call Police, or Women Helpline, data may be shared with local emergency services in the jurisdiction where the emergency occurs, regardless of where the data is normally stored.
              </p>

              <p className="text-muted-foreground">
                <strong>7.3</strong> We ensure that all international transfers are carried out in compliance with applicable data protection regulations and guarantee a sufficient level of protection through appropriate safeguards (such as standard contractual clauses, adequacy decisions, or other legally recognized transfer mechanisms).
              </p>

              <p className="text-muted-foreground">
                <strong>7.4</strong> Upon request to our Data Protection Officer (privacy@trapy.com), we can provide you with more information regarding these safeguards and transfer mechanisms.
              </p>
            </section>

            {/* 8. What Are Your Rights Over Your Personal Data? */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. What Are Your Rights Over Your Personal Data?</h2>
              
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>8.1</strong> You have the right to receive a copy of your Personal Data in our possession ("right of access").</li>
                <li><strong>8.2</strong> For processing activities carried out on the basis of your consent, you may withdraw your consent at any time as described in Article 3. Note that withdrawing consent for safety features may limit your ability to use certain protective functionalities.</li>
                <li><strong>8.3</strong> You can request the erasure of your Personal Data as well as the rectification of erroneous or obsolete Personal Data ("right of erasure and right of rectification"). Please note that we may retain certain information about you when required by law or when we have a legitimate reason to do so (e.g., safety incident records, fraud prevention, violation of Terms and Conditions).</li>
                <li><strong>8.4</strong> You have the right to object at any time to (i) the processing of your Personal Data for direct marketing purposes, or (ii) other processing carried out on the basis of our legitimate interest for reasons relating to your particular situation ("right to object").</li>
                <li><strong>8.5</strong> You have the right to limit the processing carried out on your Personal Data ("right to limitation") in specific circumstances as defined by applicable law.</li>
                <li><strong>8.6</strong> You have the right to portability of your data, i.e., the right to receive the Personal Data you have provided to us in a structured, commonly used and machine-readable format and the right to transmit this data to another data controller ("right to portability").</li>
                <li><strong>8.7</strong> You have the right to lodge a complaint with the competent supervisory authority or obtain redress from the competent courts if you consider we have not respected your rights.</li>
                <li><strong>8.8</strong> You have the right to define directives relating to the fate of your Personal Data after your death.</li>
                <li><strong>8.9</strong> To exercise these rights, you can contact our Data Protection Officer according to the terms defined in Article 13 below.</li>
              </ul>
            </section>

            {/* 9. Cookies and Similar Technologies */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Cookies and Similar Technologies</h2>
              <p className="text-muted-foreground">To find out more, see our Cookie Policy.</p>
            </section>

            {/* 10. Confidentiality of Your Password */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Confidentiality of Your Password</h2>
              <p className="text-muted-foreground">
                You are responsible for the confidentiality of the password you choose to access your account on our Platform.
              </p>
              <p className="text-muted-foreground">
                You agree to keep this password secret and not to communicate it to anyone.
              </p>
            </section>

            {/* 11. Links to Other Websites and Social Networks */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">11. Links to Other Websites and Social Networks</h2>
              <p className="text-muted-foreground">
                Our Platform may contain links to the websites of our partners or third-party companies, including emergency services, safety organizations, and women helpline services. Please note that these websites have their own privacy policies and we accept no responsibility for the use made by these sites of information collected when you click on these links. We invite you to read the privacy policies of these sites before transmitting your Personal Data to them.
              </p>
            </section>

            {/* 12. Data Retention */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">12. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your Personal Data only for as long as necessary to fulfill the purposes described in this Privacy Policy or as required by law.
              </p>
              
              <h3 className="text-xl font-semibold">Safety and Security Data:</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Live location data during active trips is retained only for the duration of the trip and for a limited period thereafter for safety verification purposes</li>
                <li>SOS alerts and emergency incident data are retained for [specify period] for legal compliance and safety improvement purposes</li>
                <li>Audio/video recordings (if enabled) are automatically deleted after [specify period] unless an incident report is filed</li>
                <li>Emergency contact information is retained for as long as your account is active</li>
              </ul>
              <p className="text-muted-foreground">
                When you delete your account, we will delete or anonymize your Personal Data within [specify period], except for data we are required to retain for legal, safety, or fraud prevention purposes.
              </p>
            </section>

            {/* 13. Changes to Our Privacy Policy */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">13. Changes to Our Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may occasionally modify this Privacy Policy. When necessary, we will inform you and/or seek your consent, particularly for changes affecting safety features or data processing. We advise you to regularly consult this page to be aware of any modifications or updates.
              </p>
            </section>

            {/* 14. Contact */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">14. Contact</h2>
              <p className="text-muted-foreground">
                For any questions relating to this Privacy Policy or for any request relating to your Personal Data, you can contact us:
              </p>
              
              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <div>
                  <h4 className="font-semibold">Data Protection Officer:</h4>
                  <p className="text-muted-foreground">Email: privacy@trapy.com</p>
                  <p className="text-muted-foreground">Address: [Your Company Address]</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Customer Service:</h4>
                  <p className="text-muted-foreground">Email: support@trapy.com</p>
                  <p className="text-muted-foreground">Phone: [Your Support Number]</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Emergency Safety Issues:</h4>
                  <p className="text-muted-foreground">Email: safety@trapy.com</p>
                  <p className="text-muted-foreground">24/7 Emergency Line: [Your Emergency Number]</p>
                </div>
              </div>
            </section>

            <p className="text-muted-foreground text-sm border-t pt-6">
              <strong>Last Updated:</strong> January 13, 2026
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
