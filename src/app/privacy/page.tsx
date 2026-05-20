import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Deamaclub collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="May 20, 2026">
      <p>
        This Privacy Policy explains how Deamaclub (&quot;we&quot;,
        &quot;us&quot;, &quot;Deamaclub&quot;) collects, uses, and shares
        information when you visit{" "}
        <a href="https://deamaclub.com">deamaclub.com</a> (the
        &quot;Site&quot;). By using the Site, you agree to the practices
        described here.
      </p>

      <h2>Information we collect</h2>
      <h3>Automatically</h3>
      <ul>
        <li>
          <strong>Log data:</strong> IP address (in a one-way hashed form for
          view de-duplication only), browser type, referring URL, pages
          visited, and timestamps.
        </li>
        <li>
          <strong>Cookies and similar technologies:</strong> small files we and
          our service providers place on your device for session
          authentication, ad personalization, and analytics. You can disable
          cookies in your browser settings; some Site features may not work
          without them.
        </li>
        <li>
          <strong>Device information:</strong> general device and operating
          system metadata reported by your browser.
        </li>
      </ul>
      <h3>You provide voluntarily</h3>
      <ul>
        <li>
          <strong>Comments:</strong> a display name and the text of your
          comment.
        </li>
        <li>
          <strong>Account information (admins only):</strong> email address and
          a hashed password for staff accounts.
        </li>
        <li>
          <strong>Correspondence:</strong> anything you send us by email at{" "}
          <a href="mailto:terrance@deamaclub.com">
            terrance@deamaclub.com
          </a>
          .
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, maintain, and improve the Site.</li>
        <li>
          To display content, count views, and prevent abuse (spam, scraping,
          fraudulent ad activity).
        </li>
        <li>
          To serve and measure advertising, including interest-based ads where
          permitted by law.
        </li>
        <li>To respond to inquiries and comply with legal obligations.</li>
      </ul>

      <h2>Advertising and third parties</h2>
      <p>
        Deamaclub uses third-party advertising vendors, which may include
        Google AdSense, Google Ad Manager, or comparable ad networks. These
        vendors may use cookies, web beacons, and similar technologies to
        deliver ads based on your visits to this and other websites.
      </p>
      <p>
        You may opt out of Google&apos;s personalized advertising by visiting{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">
          Google Ad Settings
        </a>
        , or opt out of third-party vendor use of cookies for personalized
        advertising by visiting{" "}
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noreferrer">
          aboutads.info
        </a>{" "}
        and{" "}
        <a href="https://www.youronlinechoices.com" target="_blank" rel="noreferrer">
          youronlinechoices.com
        </a>
        .
      </p>

      <h2>Service providers</h2>
      <p>
        We share the minimum information necessary with vetted service
        providers who help us run the Site, including but not limited to:
      </p>
      <ul>
        <li>
          <strong>Cloudflare</strong> — content delivery, security, video
          (Stream) and image (Images) hosting.
        </li>
        <li>
          <strong>Supabase</strong> — managed Postgres database hosting.
        </li>
        <li>
          <strong>DigitalOcean</strong> — application hosting.
        </li>
        <li>
          <strong>Google</strong> — advertising and analytics where enabled.
        </li>
      </ul>

      <h2>Your choices and rights</h2>
      <ul>
        <li>
          You can browse the Site without creating an account or submitting a
          comment.
        </li>
        <li>
          You can request deletion of comments you posted by emailing us with
          enough information to identify the comment.
        </li>
        <li>
          Where applicable, residents of California (CCPA/CPRA) and the EEA/UK
          (GDPR) have rights to access, correct, or delete personal data we
          hold about them, and to object to certain processing. Contact us to
          exercise these rights.
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        The Site is not directed to children under 13, and we do not knowingly
        collect personal information from children under 13. If you believe a
        child has provided us with personal information, contact us and we
        will delete it.
      </p>

      <h2>Data retention and security</h2>
      <p>
        We retain information only as long as necessary for the purposes
        described above or as required by law. We use industry-standard
        safeguards (TLS in transit, hashed credentials at rest, access
        controls) but no method of transmission or storage is 100% secure.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes
        will be reflected by updating the &quot;Effective&quot; date at the top
        of this page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests:{" "}
        <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a>.
      </p>
    </LegalPage>
  );
}
