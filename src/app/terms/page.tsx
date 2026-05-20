import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Deamaclub.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" effectiveDate="May 20, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and
        use of <a href="https://deamaclub.com">deamaclub.com</a> (the
        &quot;Site&quot;), operated by Deamaclub (&quot;we&quot;,
        &quot;us&quot;). By accessing or using the Site, you agree to be bound
        by these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 13 years old to use the Site, and at least 18 to
        post comments or interact with monetized features. By using the Site
        you represent that you meet these requirements and that your use does
        not violate any applicable law.
      </p>

      <h2>2. License to use the Site</h2>
      <p>
        Subject to your compliance with these Terms, we grant you a limited,
        non-exclusive, non-transferable, revocable license to access and view
        the Site for personal, non-commercial use. All other rights are
        reserved.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use the Site for any unlawful purpose or in violation of any
          applicable law or regulation.
        </li>
        <li>
          Post or transmit content that is defamatory, harassing, hateful,
          threatening, obscene, infringing, or otherwise objectionable.
        </li>
        <li>
          Impersonate any person or entity, or misrepresent your affiliation.
        </li>
        <li>
          Attempt to gain unauthorized access to any part of the Site, scrape
          content at scale, interfere with the Site&apos;s operation, or
          circumvent technical limitations.
        </li>
        <li>
          Upload viruses, malware, or any code designed to disrupt or harm.
        </li>
        <li>
          Use the Site to send spam, unsolicited advertising, or commercial
          solicitation without our prior written consent.
        </li>
      </ul>

      <h2>4. User submissions</h2>
      <p>
        By posting a comment or other content (&quot;Submission&quot;) to the
        Site, you grant Deamaclub a worldwide, royalty-free, non-exclusive,
        sublicensable license to host, display, reproduce, modify, distribute,
        and otherwise use the Submission in connection with operating and
        promoting the Site. You represent that you own or have all necessary
        rights to grant this license, and that your Submission does not
        violate any third party&apos;s rights.
      </p>
      <p>
        We reserve the right (but have no obligation) to remove, edit, or
        moderate any Submission at our discretion.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        All Site content, design, branding, and code not contributed by users
        is owned by Deamaclub or its licensors and is protected by copyright,
        trademark, and other laws. You may not copy, reproduce, distribute,
        modify, or create derivative works without our prior written
        permission, except as expressly permitted under fair use or applicable
        law.
      </p>
      <p>
        Third-party content (including embedded videos) remains the property
        of its respective owners.
      </p>

      <h2>6. Copyright and DMCA</h2>
      <p>
        Deamaclub respects intellectual property rights and expects users to
        do the same. If you believe content on the Site infringes your
        copyright, please send a notice that includes:
      </p>
      <ol>
        <li>An electronic or physical signature of the rights holder or authorized agent.</li>
        <li>Identification of the copyrighted work claimed to have been infringed.</li>
        <li>The URL or other specific location on the Site of the allegedly infringing material.</li>
        <li>Your contact information (name, address, email, phone).</li>
        <li>
          A statement that you have a good-faith belief that the disputed use
          is not authorized by the rights holder, its agent, or the law.
        </li>
        <li>
          A statement, under penalty of perjury, that the information in the
          notice is accurate and that you are authorized to act on behalf of
          the rights holder.
        </li>
      </ol>
      <p>
        Send notices to:{" "}
        <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a> with
        the subject line <em>&quot;DMCA Takedown&quot;</em>. We will respond to
        valid notices in accordance with the Digital Millennium Copyright Act.
        Repeat infringers may have their access terminated.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        THE SITE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
        WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WITHOUT
        LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
        PURPOSE, NON-INFRINGEMENT, OR ACCURACY. WE DO NOT GUARANTEE
        UNINTERRUPTED OR ERROR-FREE OPERATION.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEAMACLUB AND ITS AFFILIATES
        WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SITE,
        EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL
        LIABILITY FOR ANY CLAIM WILL NOT EXCEED ONE HUNDRED DOLLARS ($100).
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold Deamaclub harmless from any
        claim, loss, or demand (including reasonable attorneys&apos; fees)
        arising out of your use of the Site, your Submissions, or your
        violation of these Terms.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate your access to the Site at any time, with
        or without notice, for any reason, including violation of these Terms.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of New York, without
        regard to its conflict-of-laws principles. Any dispute will be resolved
        exclusively in the state or federal courts located in New York County,
        New York, and you consent to personal jurisdiction there.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may revise these Terms from time to time. Material changes take
        effect when we update the &quot;Effective&quot; date at the top of this
        page. Continued use of the Site after changes constitutes acceptance.
      </p>

      <h2>13. Contact</h2>
      <p>
        <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a>
      </p>
    </LegalPage>
  );
}
