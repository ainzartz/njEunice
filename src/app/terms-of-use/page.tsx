import Link from 'next/link';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl space-y-8">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black border-b border-black pb-8 inline-block">
          Terms of Use
        </h1>

        <div className="space-y-6 text-left text-gray-600 leading-relaxed text-sm md:text-base font-light">
          <p className="font-bold text-black uppercase tracking-wide mb-2">
            PLEASE READ THE TERMS AND CONDITIONS OF USE CAREFULLY BEFORE USING THIS SITE.
          </p>
          <p>
            This site is owned and operated by Eunice Hwang, REALTOR® associated with RE/MAX Now. By using this site (https://www.sellbyeunice.com/), you the user are agreeing to comply with and be bound by the following terms of use. After reviewing the following terms and conditions thoroughly, if you do not agree to the terms and conditions, please do not use this site.
          </p>

          <div>
            <span className="font-bold text-black">TCPA & Registration Terms:</span> If you choose to register on our website, you hereby consent to receive autodialed and/or pre-recorded telemarketing calls, text messages, and emails on the provided number from or on behalf of Eunice Hwang or RE/MAX Now (located at Palisades Park, NJ); from the following telephone numbers: 201-891-8000 or 201-290-5256, or from other numbers related to or affiliated with the agent or the company. Standard message and data rates may apply. You also certify that the provided number is your actual cell phone number. To Opt-out: If you wish to opt out of phone calls, texts, or emails, please reply "STOP" to any text message you receive, or visit our opt-out page at <Link href="/optout" className="text-blue-600 hover:underline">https://www.sellbyeunice.com/optout</Link>.
          </div>

          <div>
            <span className="font-bold text-black">Acceptance of Agreement:</span> You agree to the terms and conditions outlined in this Terms and Conditions of use Agreement (Agreement) with respect to our site (the Site). This Agreement constitutes the entire and only agreement between us and you.
          </div>

          <div>
            <span className="font-bold text-black">Copyright:</span> The content, organization, graphics, design, and other matters related to the Site are protected under applicable copyrights and other proprietary laws. The copying, reproduction, use, modification, or publication by you of any such matters or any part of the Site is strictly prohibited, without our express prior written permission.
          </div>

          <div>
            <span className="font-bold text-black">Disclaimer:</span> THE CONTENT AND SERVICES LISTED THROUGH THE SITE ARE PROVIDED "AS-IS" AND "AS AVAILABLE". Eunice Hwang AND RE/MAX Now DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED. WE HAVE NO LIABILITY WHATSOEVER FOR YOUR USE OF ANY INFORMATION OR SERVICE. WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL OR CONSEQUENTIAL DAMAGES. THE INFORMATION AND ALL OTHER MATERIALS ON THE SITE ARE PROVIDED FOR GENERAL INFORMATION PURPOSES ONLY AND DO NOT CONSTITUTE PROFESSIONAL ADVICE. IT IS YOUR RESPONSIBILITY TO EVALUATE THE ACCURACY AND COMPLETENESS OF ALL INFORMATION AVAILABLE ON THIS SITE.
          </div>

          <div>
            <span className="font-bold text-black">General & Jurisdiction:</span> You agree that all actions or proceedings arising directly or indirectly out of this agreement, or your use of the site, shall be litigated in the courts located in the State of New Jersey. You are expressly submitting and consenting in advance to such jurisdiction in any action or proceeding in any of such court. As such, the laws of New Jersey will govern the terms and conditions contained in this Agreement.
          </div>

          <div>
            <span className="font-bold text-black">GDPR Compliance:</span> This Site is intended solely for individuals residing outside of the territory of the European Union. By accessing and using this Site, you hereby agree and represent that you are not a resident of the European Union, or if you are, you provide express consent to the collection of your personal information.
          </div>
        </div>

        <div className="pt-12 text-center">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
