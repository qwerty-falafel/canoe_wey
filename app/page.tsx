import { ArrowDown, ArrowUpRight, Compass, Hammer, UsersRound, Waves } from 'lucide-react';
import { BookingForm } from '@/components/booking-form';

const media = '/media/optimised';

function ResponsivePicture({
  name,
  alt,
  className = '',
  eager = false,
  widths = [800, 1200, 1672],
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
  widths?: number[];
}) {
  const srcset = (format: 'avif' | 'webp') => widths.map((width) => `${media}/${name}-${width}.${format} ${width}w`).join(', ');
  const largest = widths[widths.length - 1];
  return (
    <picture>
      <source type="image/avif" srcSet={srcset('avif')} sizes="100vw" />
      <source type="image/webp" srcSet={srcset('webp')} sizes="100vw" />
      <img
        className={className}
        src={`${media}/${name}-${largest}.webp`}
        alt={alt}
        width={largest}
        height={name === 'craft' || name === 'river' ? Math.round(largest * 0.75) : Math.round(largest * 0.563)}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
      />
    </picture>
  );
}

export default function HomePage() {
  const phone = process.env.NEXT_PUBLIC_PHONE?.trim();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: 'Private River Wey Canoe Day',
    description: 'A private guided canoe day from Guildford to Godalming for groups of 2–12.',
    touristType: ['Families', 'Couples', 'Groups', 'Corporate teams'],
    itinerary: { '@type': 'ItemList', itemListElement: ['Guildford', 'River Wey', 'Godalming'] },
    offers: { '@type': 'Offer', price: '600', priceCurrency: 'GBP', url: 'https://thecanoewey.co.uk/#enquire' },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="River Wey Canoe home">
          <span>River Wey</span><strong>Canoe</strong>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#experience">The experience</a>
          <a href="#boat">The boat</a>
          <a href="#guide">Your guide</a>
          <a className="header-price" href="#price">£600</a>
          <a className="button button-light button-small" href="#enquire">Enquire</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <ResponsivePicture name="hero" alt="The guide standing beside his handcrafted wooden canoe on the River Wey" className="hero-image" eager />
        <div className="hero-shade" />
        <div className="hero-content shell">
          <p className="eyebrow light">Private days on the River Wey</p>
          <h1>A day on the Wey aboard a boat built by your guide.</h1>
          <p className="hero-intro">Private canoe trips from Guildford to Godalming for groups of 2–12.</p>
          <div className="hero-price"><strong>£600</strong><span>for the boat and guide<br />for the day</span></div>
          <div className="hero-actions">
            <a className="button button-oak" href="#enquire">Request a date <ArrowDown size={17} /></a>
            {phone && <a className="quiet-link light-link" href={`tel:${phone.replace(/\s/g, '')}`}>Call {phone}</a>}
          </div>
        </div>
        <div className="hero-route" aria-hidden="true">Guildford <span /> Godalming</div>
      </section>

      <div className="gunwale-transition" aria-hidden="true" />

      <section className="experience section shell" id="experience">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">The experience</p><h2>You paddle. He guides.<br />The river does the rest.</h2></div>
          <p>One very large wooden canoe, a quiet stretch of Surrey, and a day that belongs entirely to your group.</p>
        </div>
        <div className="experience-grid">
          <article><UsersRound aria-hidden="true" /><span>01</span><h3>Paddle together</h3><p>Twelve individual seats, one boat. It only really comes alive when the crew begins working together.</p></article>
          <article><Waves aria-hidden="true" /><span>02</span><h3>Discover the Wey</h3><p>Travel through the landscape between Guildford and Godalming, with the river’s stories along the way.</p></article>
          <article><Hammer aria-hidden="true" /><span>03</span><h3>Meet the maker</h3><p>Your guide built the boat himself—and can show you how its timber, ribs and traditional form come together.</p></article>
          <article><Compass aria-hidden="true" /><span>04</span><h3>Yours for the day</h3><p>No strangers added. The whole canoe and your guide are privately yours for the experience.</p></article>
        </div>
      </section>

      <div className="rib-divider" aria-hidden="true" />

      <section className="craft" id="boat">
        <ResponsivePicture name="craft" widths={[720, 1100, 1448]} alt="The repeating wooden ribs, slatted floor and individual seats inside the canoe" className="craft-image" />
        <div className="craft-overlay" />
        <div className="craft-copy shell">
          <p className="eyebrow light">Built by hand</p>
          <h2>Built by the man who takes you down the river.</h2>
          <p>Its close-set ribs and sweeping gunwales follow the tradition of Canadian and Peterborough-style wooden canoes—vessels ultimately derived from Indigenous canoe forms and adapted through nineteenth-century timber construction.</p>
        </div>
      </section>

      <section className="guide section" id="guide">
        <div className="guide-grid shell">
          <div className="guide-photo frame-curve">
            <ResponsivePicture name="boarding" alt="The boatbuilder and guide helping a guest aboard the canoe" />
            <div className="photo-note"><span>Builder</span><span>Boatman</span><span>Storyteller</span></div>
          </div>
          <div className="guide-copy">
            <p className="eyebrow">Meet your guide</p>
            <h2>The person who built it is the person taking you out in it.</h2>
            <p>Every day on the Wey is accompanied by the canoe’s maker. He’ll guide the crew, keep the day moving, and explain the craft and history behind this rather unusual boat.</p>
            <p>It is less a conventional guided tour and more a day on the river with someone who knows every rivet, rib and reach.</p>
          </div>
        </div>
      </section>

      <section className="journey section-dark" id="journey">
        <div className="journey-grid shell">
          <div>
            <p className="eyebrow light">The route</p>
            <h2>Guildford to Godalming, by the quiet way.</h2>
            <p>A full day following the River Wey through green banks, old crossings and the changing Surrey landscape. Exact timings and meeting arrangements are confirmed for your chosen date.</p>
          </div>
          <div className="route-map" role="img" aria-label="Route along the River Wey from Guildford to Godalming">
            <span className="route-town route-start">Guildford <small>Start</small></span>
            <svg viewBox="0 0 260 390" aria-hidden="true"><path className="route-water" d="M147 20 C55 85 215 124 119 196 C43 254 183 300 105 370" /><path className="route-trace" d="M147 20 C55 85 215 124 119 196 C43 254 183 300 105 370" /></svg>
            <span className="route-label">River Wey</span>
            <span className="route-town route-end">Godalming <small>Finish</small></span>
          </div>
        </div>
      </section>

      <section className="audience section shell">
        <div className="section-heading"><p className="eyebrow">Bring your people</p><h2>One boat. Quite a few reasons to take it out.</h2></div>
        <div className="occasion-grid">
          <article><span>01</span><h3>Family day</h3><p>A private shared adventure across generations.</p></article>
          <article><span>02</span><h3>Something romantic</h3><p>A very different way for two people to spend a day together.</p></article>
          <article><span>03</span><h3>A celebration</h3><p>Birthdays, anniversaries and small private occasions.</p></article>
          <article><span>04</span><h3>Team day</h3><p>You cannot sit back and be transported. The boat only works when the crew does.</p></article>
        </div>
      </section>

      <section className="price-section" id="price">
        <div className="price-grid shell">
          <div className="price-copy">
            <p className="eyebrow">Private hire</p>
            <h2>The boat is yours for the day.</h2>
            <p>One boat, one guide, and no unfamiliar faces added to your group.</p>
            <div className="price-lockup"><strong>£600</strong><span>Private hire of the canoe<br />and guide for the day</span></div>
            <div className="capacity"><span>2</span><div className="capacity-line"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><span>12</span><small>guests</small></div>
          </div>
          <div className="river-photo frame-curve reverse">
            <ResponsivePicture name="river" widths={[720, 1100, 1448]} alt="The handcrafted wooden canoe moored on the River Wey at sunset" />
          </div>
        </div>
      </section>

      <section className="enquiry-section" id="enquire">
        <div className="enquiry-grid shell">
          <div className="enquiry-intro">
            <p className="eyebrow light">Request a date</p>
            <h2>When shall we take the boat out?</h2>
            <p>Tell us your preferred date and who is coming. This is an enquiry rather than an instant booking; your day is confirmed once the guide has been in touch.</p>
            <img src={`${media}/canoe-cutout.webp`} width="1200" height="900" alt="" loading="lazy" />
          </div>
          <div className="form-card"><BookingForm /></div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-ribs" aria-hidden="true" />
        <div className="shell footer-grid">
          <div className="wordmark footer-mark"><span>River Wey</span><strong>Canoe</strong></div>
          <p>Guildford <span>→</span> Godalming</p>
          <div className="footer-links">
            <a href="#enquire">Enquire</a>
            {phone && <a href={`tel:${phone.replace(/\s/g, '')}`}>Call</a>}
            <a href="/privacy">Privacy</a>
          </div>
          <p className="copyright">© {new Date().getFullYear()} River Wey Canoe</p>
        </div>
      </footer>
      <a className="mobile-enquire" href="#enquire">Request a date <ArrowUpRight size={18} /></a>
    </main>
  );
}
