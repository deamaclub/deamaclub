import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Autopost Terms of Service",
  description:
    "Terms of service for Deamaclub Autopost, the internal tool that publishes our own video content to our own Facebook Pages.",
  alternates: {
    canonical: "https://deamaclub.com/autopost/termsofservice",
  },
};

export default function AutopostTermsPage() {
  return (
    <LegalPage title="Autopost Terms of Service" effectiveDate="August 18, 2026">
      <p>
        These Terms of Service (the &quot;Terms&quot;) govern use of{" "}
        <strong>Deamaclub Autopost</strong> (the &quot;Tool&quot;), a private
        publishing utility operated by Deamaclub (&quot;we&quot;,
        &quot;us&quot;). By configuring, running, or otherwise using the Tool,
        you agree to these Terms.
      </p>
      <p>
        See also the{" "}
        <a href="https://deamaclub.com/autopost/privacypolicy">
          Autopost Privacy Policy
        </a>
        , which forms part of these Terms.
      </p>

      <h2>1. What the Tool is</h2>
      <p>
        The Tool takes a video link and a caption submitted through a private
        Telegram bot, retrieves the video, selects a thumbnail image, and
        publishes a post with an accompanying comment to one of the Facebook
        Pages that Deamaclub owns and administers:
      </p>
      <ul>
        <li>@deamaclub</li>
        <li>@glowspace</li>
        <li>@nysgoods</li>
      </ul>

      <h2>2. Not a public service</h2>
      <p>
        The Tool is <strong>not offered to the public</strong>. It provides no
        sign-up, no user accounts, no hosted interface, and no API for third
        parties. It is operated solely by Deamaclub, for Deamaclub, and
        publishes only to Deamaclub&apos;s own Facebook Pages. Nothing in these
        Terms grants any person a right to access or use the Tool.
      </p>
      <p>
        Should we ever authorise an additional operator, these Terms apply to
        that person in full.
      </p>

      <h2>3. Operator responsibilities</h2>
      <p>Anyone authorised to operate the Tool agrees to:</p>
      <ul>
        <li>
          Submit only content that they own or otherwise have the necessary
          rights and permissions to publish.
        </li>
        <li>
          Not submit content that is unlawful, infringing, defamatory, hateful,
          harassing, deceptive, or otherwise in breach of the policies of the
          platforms the content is published to or sourced from.
        </li>
        <li>
          Keep access tokens, bot tokens, and server credentials confidential,
          and not share them with unauthorised parties.
        </li>
        <li>
          Not use the Tool to spam, to artificially inflate engagement, or to
          circumvent any platform&apos;s rate limits or technical restrictions.
        </li>
      </ul>
      <p>
        Responsibility for the content published through the Tool rests entirely
        with the operator who submitted it.
      </p>

      <h2>4. Third-party platforms</h2>
      <p>
        The Tool interoperates with services we do not control. Use of the Tool
        is additionally subject to those services&apos; own terms, including:
      </p>
      <ul>
        <li>
          <a
            href="https://developers.facebook.com/terms/"
            target="_blank"
            rel="noreferrer"
          >
            Meta Platform Terms
          </a>{" "}
          and the Facebook Community Standards.
        </li>
        <li>The Telegram Terms of Service.</li>
        <li>
          The terms of any platform a submitted video is sourced from, and the
          terms of our content delivery provider.
        </li>
      </ul>
      <p>
        Where these Terms conflict with the Meta Platform Terms in respect of
        our use of Meta&apos;s APIs, the Meta Platform Terms prevail. We may
        change or suspend the Tool at any time to remain compliant with a
        third-party platform&apos;s requirements.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        The Tool, its source code, and its configuration are the property of
        Deamaclub. Video content published through the Tool remains the property
        of its respective rights holders. These Terms transfer no ownership in
        either.
      </p>

      <h2>6. Availability and warranty</h2>
      <p>
        The Tool is provided <strong>&quot;as is&quot;</strong> and{" "}
        <strong>&quot;as available&quot;</strong>, without warranty of any kind,
        express or implied, including any implied warranty of merchantability,
        fitness for a particular purpose, or non-infringement. We do not warrant
        that the Tool will be uninterrupted, timely, error-free, or that any
        particular post will be published at any particular time. Scheduled
        publishing depends on third-party APIs, network conditions, and source
        availability, none of which we control.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Deamaclub shall not be liable
        for any indirect, incidental, special, consequential, or exemplary
        damages, or for any loss of profits, revenue, data, or goodwill, arising
        out of or relating to the Tool — including any failed, delayed,
        duplicated, or incorrectly routed post — whether based in contract,
        tort, or any other theory of liability.
      </p>

      <h2>8. Suspension and termination</h2>
      <p>
        We may suspend or discontinue the Tool, in whole or in part, at any time
        and without notice. Access may be revoked immediately at our discretion,
        or automatically where a third-party platform withdraws the permissions
        the Tool depends on. Sections 5 through 7 survive any termination.
      </p>

      <h2>9. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be
        reflected by updating the &quot;Effective&quot; date shown at the top of
        this page. Continued operation of the Tool after a change constitutes
        acceptance of the revised Terms.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of New York, United
        States, without regard to its conflict-of-laws rules. The state and
        federal courts located in New York shall have exclusive jurisdiction
        over any dispute arising from these Terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        Deamaclub &mdash;{" "}
        <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a>
        <br />
        <a href="https://deamaclub.com/autopost/termsofservice">
          https://deamaclub.com/autopost/termsofservice
        </a>
      </p>
    </LegalPage>
  );
}
