import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy | River Wey Canoe', description: 'How River Wey Canoe uses information submitted with a date enquiry.' };

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <nav className="privacy-nav shell"><a className="wordmark admin-mark" href="/"><span>River Wey</span><strong>Canoe</strong></a><a className="back-link" href="/">Back to the river</a></nav>
      <article className="privacy-content shell">
        <p className="eyebrow">Privacy</p><h1>A short note about your details.</h1>
        <p>When you request a date, we collect your name, email address, telephone number, preferred dates, group size and anything you choose to tell us about the day.</p>
        <h2>Why we collect it</h2><p>We use this information only to respond to your enquiry, arrange the trip and keep an appropriate record of the booking. We do not sell your details or use them for advertising.</p>
        <h2>Who handles it</h2><p>Your enquiry is stored securely using Supabase, our database provider. If email notifications are enabled, the details needed to send those messages are handled by our transactional email provider.</p>
        <h2>How long we keep it</h2><p>Enquiry and booking records are kept only for as long as they are reasonably needed for administration, legal or accounting purposes, then deleted.</p>
        <h2>Your choices</h2><p>You can ask what information we hold about you, request a correction, or ask us to delete it where there is no legal reason to retain it. Use the enquiry form and make your privacy request clear in the message.</p>
      </article>
    </main>
  );
}
