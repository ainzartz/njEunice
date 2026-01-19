import Link from 'next/link';
// Navbar and Footer imports removed

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl space-y-10 text-left">
        {/* Header */}
        <div className="border-b border-black pb-8 text-center pt-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black mb-4 inline-block">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">
            Effective Date: January 19, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 leading-relaxed font-light text-lg text-justify max-w-4xl mx-auto">
          <p>
            This privacy policy sets out how Eunice Hwang (RE/MAX Now) uses and protects any information that you give the Company when you use this website (https://www.sellbyeunice.com/). We are committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement. We may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you are happy with any changes.
          </p>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-2">GDPR Compliance</h2>
            <p>
              This Site is intended solely for individuals residing outside of the territory of the European Union. By accessing and using this Site, you hereby agree and represent either (i) you are not a resident of the European Union, or (ii) if you are a resident of the European Union, that you hereby provide express consent to any personal information which may be collected from you by this Site.
            </p>
          </div>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-2">TCPA & Registration Terms (Important)</h2>
            <p>
              If you choose to register on our website you hereby consent to receive auto-dialed and/or pre-recorded telemarketing calls and/or text messages on provided number from or on behalf of Eunice Hwang or RE/MAX Now; from the following telephone numbers: 201-891-8000 or 201-290-5256. Standard message and data rates may apply. You also certify that the provided number is your actual cell phone number. Opt-out: If you wish to opt-out of phone calls, text or emails please click this link: <Link href="/optout" className="text-blue-600 hover:underline">https://www.sellbyeunice.com/optout</Link> or reply "STOP" to any text message.
            </p>
          </div>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-2">What we collect</h2>
            <p>
              We collect information including name, email, phone number, and IP location primarily through our sign-up process or contact forms.
            </p>
          </div>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-2">What we do with the information</h2>
            <p>
              We use this information to help you find a property and to communicate with you via email, text, or phone. We may also use the information to improve our products and services or send promotional emails about new listings or special offers. We will never sell your information.
            </p>
          </div>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-2">Security</h2>
            <p>
              We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure, we have put in place suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online.
            </p>
          </div>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-2">How we use cookies</h2>
            <p>
              A cookie is a small file that asks permission to be placed on your computer's hard drive. We use traffic log cookies to identify which pages are being used. This helps us analyze data about web page traffic and improve our website in order to tailor it to customer needs. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
            </p>
          </div>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-2">Links to other websites</h2>
            <p>
              Our website may contain links to other websites. However, once you have used these links to leave our site, we do not have any control over that other website. Therefore, we cannot be responsible for the protection and privacy of any information which you provide whilst visiting such sites.
            </p>
          </div>

          <div>
            <h2 className="text-black font-bold uppercase tracking-wide text-sm mb-2">Controlling your personal information</h2>
            <p>
              If you wish to opt-out of contact you can click on the unsubscribe link at the bottom of any email correspondence. If you wish to opt-out of phone calls please contact us via our website.
            </p>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-light text-black mb-6">California Consumer Privacy Policy Compliance (CCPA)</h2>
            <p className="mb-4">We adopt this section to comply with the California Consumer Privacy Act of 2018 (CCPA).</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-black font-bold text-sm mb-1">Collection & Use of Personal Information</h3>
                <p>We collect information that identifies, relates to, describes, or could reasonably be linked with a particular consumer or device. We use this information to fulfill the reason you provided the information (e.g., to help you buy or sell a home), to provide support, and to improve our website.</p>
              </div>

              <div>
                <h3 className="text-black font-bold text-sm mb-1">Sharing Personal Information</h3>
                <p>We do not sell your personal information. We may disclose your personal information to a service provider for business purposes (e.g., a mortgage partner, only if you consented) under a written contract that requires them to keep the information confidential.</p>
              </div>

              <div>
                <h3 className="text-black font-bold text-sm mb-1">Your Rights and Choices (CCPA)</h3>
                <p>You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past twelve months. You also have the right to request that we delete any of your personal information that we collected from you, subject to certain exceptions.</p>
              </div>

              <div>
                <h3 className="text-black font-bold text-sm mb-1">Exercising Access, Data Portability, and Deletion Rights</h3>
                <p>To exercise the access, data portability, and deletion rights described above, please submit a verifiable consumer request to us by either calling us at 201-290-5256 or contacting us via <Link href="/" className="text-black underline">https://www.sellbyeunice.com/</Link>. Only you, or someone legally authorized to act on your behalf, may make a verifiable consumer request related to your personal information.</p>
              </div>

              <div>
                <h3 className="text-black font-bold text-sm mb-1">Non-Discrimination</h3>
                <p>We will not discriminate against you for exercising any of your rights under the CCPA.</p>
              </div>
            </div>
          </div>

          <div className="pt-12 text-center pb-20">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
