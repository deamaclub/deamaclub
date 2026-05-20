import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Deamaclub.",
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        The fastest way to reach Deamaclub is by email. Please use the address
        that matches your inquiry — it helps us route messages to the right
        person and respond faster.
      </p>

      <h2>General inquiries</h2>
      <p>
        <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a>
      </p>
      <p>
        Comments, feedback, corrections, or anything else that doesn&apos;t
        fit a category below.
      </p>

      <h2>Tips and submissions</h2>
      <p>
        <a href="mailto:terrance@deamaclub.com?subject=Tip">
          terrance@deamaclub.com
        </a>{" "}
        with the subject line <em>&quot;Tip&quot;</em>.
      </p>
      <p>
        Have a video, story, or angle we should cover? Send it over. Include
        as much context as you can — what happened, who&apos;s in it, when and
        where it was filmed, and any rights information you have.
      </p>

      <h2>Press, partnerships, advertising</h2>
      <p>
        <a href="mailto:terrance@deamaclub.com?subject=Business">
          terrance@deamaclub.com
        </a>{" "}
        with the subject line <em>&quot;Business&quot;</em>.
      </p>

      <h2>Copyright / DMCA takedowns</h2>
      <p>
        See section 6 of our <a href="/terms">Terms of Service</a> for the
        required notice format. Send DMCA notices to{" "}
        <a href="mailto:terrance@deamaclub.com?subject=DMCA%20Takedown">
          terrance@deamaclub.com
        </a>{" "}
        with the subject line <em>&quot;DMCA Takedown&quot;</em>.
      </p>

      <h2>Privacy requests</h2>
      <p>
        To request access to, correction of, or deletion of personal
        information, see our <a href="/privacy">Privacy Policy</a> and email{" "}
        <a href="mailto:terrance@deamaclub.com?subject=Privacy">
          terrance@deamaclub.com
        </a>{" "}
        with the subject line <em>&quot;Privacy&quot;</em>.
      </p>

      <h2>Response time</h2>
      <p>
        We aim to respond within 2 business days. DMCA and security notices
        are prioritized.
      </p>
    </LegalPage>
  );
}
