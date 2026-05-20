import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Deamaclub is the home of viral news, fight videos, hip hop, sports highlights, and street culture from across America.",
};

export default function AboutPage() {
  return (
    <LegalPage title="About Deamaclub">
      <p>
        Deamaclub is an independent video and culture publication covering
        viral news, hip hop, fight footage, sports highlights, and street
        culture across the United States.
      </p>

      <h2>What we cover</h2>
      <p>
        We curate the most-talked-about clips of the day and pair each one
        with original context — what happened, why it matters, and where it
        sits in the broader culture. Our beats:
      </p>
      <ul>
        <li>
          <strong>News</strong> — breaking events and viral moments shaping
          the day&apos;s conversation.
        </li>
        <li>
          <strong>Fights</strong> — combat sports highlights, street footage
          with proper context, and notable confrontations.
        </li>
        <li>
          <strong>Hip Hop</strong> — drops, interviews, behind-the-scenes, and
          industry news.
        </li>
        <li>
          <strong>Sports</strong> — clips and storylines from the leagues that
          matter to our audience.
        </li>
        <li>
          <strong>Wild</strong> — the moments that go viral for reasons no one
          can predict.
        </li>
        <li>
          <strong>Celebrity</strong> — the public figures whose moves drive
          the cycle.
        </li>
      </ul>

      <h2>Editorial standards</h2>
      <p>
        Deamaclub publishes embedded video either produced in-house, licensed
        from rights holders, sourced from official press channels, or used
        with attribution under fair-use commentary. We honor takedown requests
        promptly — see our{" "}
        <a href="/terms">Terms of Service</a> for the DMCA process.
      </p>
      <p>
        We do not publish content that glorifies violence against specific
        individuals, content depicting minors in distress, doxxing, or
        deepfakes presented as real footage.
      </p>

      <h2>Who runs it</h2>
      <p>
        Deamaclub is operated independently from the United States. The site
        is built and maintained by a small team led by Terrance Jones.
      </p>

      <h2>Get in touch</h2>
      <ul>
        <li>
          General inquiries:{" "}
          <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a>
        </li>
        <li>
          Tips and submissions:{" "}
          <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a>
        </li>
        <li>
          Press, partnerships, advertising:{" "}
          <a href="mailto:terrance@deamaclub.com">terrance@deamaclub.com</a>
        </li>
        <li>
          DMCA / takedown notices: see the{" "}
          <a href="/terms">Terms of Service</a>
        </li>
      </ul>
    </LegalPage>
  );
}
