'use client';

import { useState } from 'react';

type Submission = {
  preferredDate: string;
  groupSize: string;
  customerEmail: string;
};

export function BookingForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [occasion, setOccasion] = useState('');
  const [submission, setSubmission] = useState<Submission | null>(null);

  if (state === 'success' && submission) {
    const requestedDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(
      new Date(`${submission.preferredDate}T12:00:00`),
    );
    return (
      <div className="booking-success" role="status">
        <div className="success-ribs" aria-hidden="true" />
        <p className="eyebrow">Enquiry received</p>
        <h3>Thanks — your date request is in.</h3>
        <p>We’ll get back to you to confirm availability and the details of your day.</p>
        <dl>
          <div><dt>Requested date</dt><dd>{requestedDate}</dd></div>
          <div><dt>Group size</dt><dd>{submission.groupSize} guests</dd></div>
          <div><dt>Reply to</dt><dd>{submission.customerEmail}</dd></div>
        </dl>
        <button className="text-button" type="button" onClick={() => setState('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      className="booking-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setState('submitting');
        setError('');
        const form = event.currentTarget;
        const values = Object.fromEntries(new FormData(form));
        try {
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });
          const result = (await response.json()) as { error?: string };
          if (!response.ok) throw new Error(result.error || 'Submission failed.');
          setSubmission({
            preferredDate: String(values.preferredDate),
            groupSize: String(values.groupSize),
            customerEmail: String(values.customerEmail),
          });
          form.reset();
          setOccasion('');
          setState('success');
        } catch (submissionError) {
          setError(
            submissionError instanceof Error
              ? submissionError.message
              : 'Something went wrong. Please try again.',
          );
          setState('error');
        }
      }}
    >
      <div className="form-grid two-columns">
        <label>
          <span>Name *</span>
          <input name="customerName" autoComplete="name" required maxLength={120} />
        </label>
        <label>
          <span>Email *</span>
          <input name="customerEmail" type="email" autoComplete="email" required maxLength={254} />
        </label>
      </div>
      <div className="form-grid two-columns">
        <label>
          <span>Phone *</span>
          <input name="customerPhone" type="tel" autoComplete="tel" required maxLength={40} />
        </label>
        <label>
          <span>Group size *</span>
          <select name="groupSize" defaultValue="" required>
            <option value="" disabled>Select 2–12</option>
            {Array.from({ length: 11 }, (_, index) => index + 2).map((size) => (
              <option key={size} value={size}>{size} guests</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-grid two-columns">
        <label>
          <span>Preferred date *</span>
          <input name="preferredDate" type="date" required min={new Date().toISOString().slice(0, 10)} />
        </label>
        <label>
          <span>Alternative date</span>
          <input name="alternativeDate" type="date" min={new Date().toISOString().slice(0, 10)} />
        </label>
      </div>
      <div className="form-grid two-columns">
        <label>
          <span>What brings you out?</span>
          <select name="occasionType" value={occasion} onChange={(event) => setOccasion(event.target.value)}>
            <option value="">Choose an occasion</option>
            <option value="family">Family day</option>
            <option value="couple">Something romantic</option>
            <option value="friends">Friends</option>
            <option value="celebration">Celebration</option>
            <option value="corporate">Team day</option>
            <option value="other">Other</option>
          </select>
        </label>
        {occasion === 'corporate' ? (
          <label>
            <span>Company name</span>
            <input name="companyName" autoComplete="organization" maxLength={160} />
          </label>
        ) : <div />}
      </div>
      <label>
        <span>Anything we should know?</span>
        <textarea name="message" rows={4} maxLength={3000} placeholder="A birthday, accessibility needs, questions—or simply say hello." />
      </label>
      <label className="consent-row">
        <input name="consent" type="checkbox" value="yes" required />
        <span>I agree that my details may be used to respond to this enquiry.</span>
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button button-dark form-submit" type="submit" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Sending your request…' : 'Request this date'}
      </button>
      {state === 'error' && (
        <output className="form-error">
          {error || 'Something went wrong and your enquiry hasn’t been sent. Please try again.'}
        </output>
      )}
    </form>
  );
}
