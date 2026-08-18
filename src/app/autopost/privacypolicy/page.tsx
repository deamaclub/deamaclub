import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Autopost Privacy Policy",
  description:
    "Privacy policy for Deamaclub Autopost, the internal tool that publishes our own video content to our own Facebook Pages.",
  alternates: {
    canonical: "https://deamaclub.com/autopost/privacypolicy",
  },
};

export default function AutopostPrivacyPolicyPage() {
  return (
    <LegalPage title="Autopost Privacy Policy" effectiveDate="August 18, 2026">
      <p>
        This Privacy Policy describes how <strong>Deamaclub Autopost</strong>{" "}
        (the &quot;Tool&quot;) handles information. The Tool is a private,
        internal publishing utility operated by Deamaclub (&quot;we&quot;,
        &quot;us&quot;) that posts our own video content to our own Facebook
        Pages.
      </p>
      <p>
        The Tool is <strong>not a consumer product</strong>. It is not offered
        to, installed by, or usable by the public. It has exactly one operator
        &mdash; the owner of Deamaclub &mdash; and it publishes only to Facebook
        Pages that the same owner administers:
      </p>
      <ul>
        <li>@deamaclub</li>
        <li>@nysgoods</li>
      </ul>
      <p>
        This policy covers the Tool only. For the deamaclub.com website, see our{" "}
        <a href="https://deamaclub.com/privacy">main Privacy Policy</a>.
      </p>

      <h2>Information the Tool processes</h2>

      <h3>Submissions from the operator</h3>
      <p>
        The operator submits work to the Tool through a private Telegram bot.
        For each submission the Tool stores:
      </p>
      <ul>
        <li>
          The Telegram chat ID and message ID of the submission, and the time it
          was received.
        </li>
        <li>The message text &mdash; a link to a video and the caption to publish.</li>
      </ul>
      <p>
        This is the operator&apos;s own account data, submitted deliberately by
        the operator. The bot does not accept submissions from anyone else.
      </p>

      <h3>Video content and metadata</h3>
      <ul>
        <li>
          The video file downloaded from the link provided, plus a still image
          selected from it for use as the post thumbnail.
        </li>
        <li>
          Technical metadata about that video: title, duration, dimensions,
          source platform, source video identifier, thumbnail URLs, file size,
          and a SHA-256 checksum of the file.
        </li>
      </ul>
      <p>
        The checksum exists solely so that the same video is never published
        twice.
      </p>

      <h3>Facebook Page data</h3>
      <ul>
        <li>
          A Page access token for each Page, together with the Page ID, Page
          name, and the list of tasks that token grants.
        </li>
        <li>
          The identifiers and permalinks of the posts, videos, and comments that
          the Tool itself creates.
        </li>
      </ul>
      <p>
        The Tool records the identifier of everything it creates so that, after
        an interruption, it can confirm a post already exists rather than
        publishing a duplicate.
      </p>

      <h2>Information the Tool does not collect</h2>
      <p>
        This list is deliberate. The Tool does not access, store, analyse, or
        transmit:
      </p>
      <ul>
        <li>
          Any personal information about Facebook users, Page visitors,
          followers, or subscribers.
        </li>
        <li>
          Comments, reactions, or messages left by other people. The Tool writes
          one comment beneath its own post and never reads the thread.
        </li>
        <li>
          Follower or fan lists, audience demographics, Page Insights, or
          analytics of any kind.
        </li>
        <li>Messages, inbox conversations, or contact details.</li>
        <li>Advertising data, ad accounts, or Commerce data.</li>
        <li>
          User profiles, friend lists, photos, or any other data belonging to
          people other than the operator.
        </li>
      </ul>
      <p>
        The Tool performs no tracking, profiling, advertising, or behavioural
        analytics whatsoever.
      </p>

      <h2>Permissions we request and why</h2>
      <ul>
        <li>
          <strong>pages_show_list</strong> &mdash; to identify which Pages the
          operator administers, so content is routed to the correct Page.
        </li>
        <li>
          <strong>pages_read_engagement</strong> &mdash; to read back the posts
          the Tool itself created, so that a retry after a network failure
          resumes rather than publishing the same post twice.
        </li>
        <li>
          <strong>pages_manage_posts</strong> &mdash; to publish the photo post
          and to upload the accompanying video to the Page.
        </li>
        <li>
          <strong>pages_manage_engagement</strong> &mdash; to add a single
          comment beneath the post the Tool just created, linking to the full
          video.
        </li>
      </ul>
      <p>
        We request no permissions beyond these four, and each is used only for
        the purpose stated.
      </p>

      <h2>How information is used</h2>
      <ul>
        <li>To queue submissions and publish them to the correct Page.</li>
        <li>To select a representative still image for the post thumbnail.</li>
        <li>
          To prevent duplicate publishing, using the stored identifiers and
          checksums described above.
        </li>
        <li>
          To send the operator status updates in Telegram about their own
          submissions.
        </li>
        <li>To diagnose failures and resume interrupted work.</li>
      </ul>
      <p>
        Information is never used for advertising, profiling, resale, or
        training machine-learning models.
      </p>

      <h2>Storage, retention, and deletion</h2>
      <ul>
        <li>
          <strong>Where:</strong> data is held on infrastructure controlled by
          the operator, together with the service providers listed below.
        </li>
        <li>
          <strong>Video files:</strong> retained on a rolling window of the 300
          most recent submissions. Once a submission falls outside that window,
          its downloaded video and generated images are deleted automatically.
        </li>
        <li>
          <strong>Records:</strong> a small record of each submission &mdash;
          its identifiers, checksum, timestamps, and the resulting Facebook post
          ID &mdash; is kept after the media is deleted. This record is what
          prevents an old video from being republished later, and it contains no
          personal information about anyone other than the operator.
        </li>
        <li>
          <strong>Access tokens:</strong> stored in protected server
          configuration, never committed to source control, and automatically
          scrubbed from all log output.
        </li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We do not sell, rent, or trade any information, and we do not share it
        for advertising. Information is shared only with the service providers
        strictly required to operate the Tool:
      </p>
      <ul>
        <li>
          <strong>Meta Platforms, Inc.</strong> &mdash; receives the content
          being published to our Facebook Pages.
        </li>
        <li>
          <strong>Telegram</strong> &mdash; carries the operator&apos;s
          submissions and status messages.
        </li>
        <li>
          <strong>Bunny.net</strong> &mdash; content delivery and video hosting
          for videos linked from our @nysgoods posts.
        </li>
        <li>
          <strong>DigitalOcean</strong> &mdash; server hosting.
        </li>
      </ul>
      <p>
        We may also disclose information where required by law or to protect our
        legal rights.
      </p>

      <h2 id="data-deletion">Data deletion</h2>
      <p>
        To request deletion of any data associated with the Tool, email{" "}
        <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a> with
        the subject line &quot;Autopost data deletion&quot;. We will action
        verified requests within 30 days and confirm by reply.
      </p>
      <p>The operator may also, at any time:</p>
      <ul>
        <li>
          Revoke the Tool&apos;s access to our Facebook Pages at{" "}
          <a
            href="https://www.facebook.com/settings?tab=business_tools"
            target="_blank"
            rel="noreferrer"
          >
            Facebook Business Integrations
          </a>
          , which immediately and permanently ends the Tool&apos;s ability to
          read or publish anything.
        </li>
        <li>
          Delete any published post, video, or comment directly on the Facebook
          Page.
        </li>
        <li>
          Delete the Tool&apos;s local database and stored media, which removes
          every record described in this policy.
        </li>
      </ul>

      <h2>Security</h2>
      <p>
        All communication with Meta, Telegram, and our hosting providers uses
        TLS. Credentials are held in protected configuration rather than in
        code, and our logging layer strips access tokens, passwords, and
        database credentials before anything is written to disk. Access to the
        server is restricted to the operator. No system is perfectly secure, but
        the Tool holds no third-party personal data, which keeps the
        consequences of any incident correspondingly small.
      </p>

      <h2>Children</h2>
      <p>
        The Tool is not directed to children, is not accessible to the public,
        and collects no information from children.
      </p>

      <h2>Your rights</h2>
      <p>
        Because the Tool processes no personal data belonging to anyone other
        than its single operator, there is ordinarily nothing for a third party
        to access, correct, or erase. If you nonetheless believe we hold
        information about you and you are covered by the GDPR, UK GDPR, or
        CCPA/CPRA, contact us at the address below and we will respond within
        the period the applicable law requires.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        reflected by updating the &quot;Effective&quot; date shown at the top of
        this page.
      </p>

      <h2>Contact</h2>
      <p>
        Deamaclub &mdash;{" "}
        <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a>
        <br />
        <a href="https://deamaclub.com/autopost/privacypolicy">
          https://deamaclub.com/autopost/privacypolicy
        </a>
      </p>
    </LegalPage>
  );
}
