import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { MapPin, PenLine, MessageCircle } from 'lucide-react';
import Reveal from '@/components/Reveal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Static assets served from apps/web/public/images/cha-art.
const UP = '/images/cha-art';

const GALLERY = [
  'wedding-couple-indoors-is-hugging-each-other-beautiful-model-woman-white-dress-man-suit-be-1-scaled.jpg',
  'wedding-couple-groom-bride-posing-white-studio-2-scaled.jpg',
  'wedding-couple-groom-bride-posing-white-studio-scaled.jpg',
  'wedding-couple-groom-bride-posing-white-studio-1-scaled.jpg',
  'wedding-couple-love-beautiful-bride-elegant-groom-black-background-stylish-newlywed-coup-scaled.jpg',
  'wedding-couple-indoors-is-hugging-each-other-beautiful-model-woman-white-dress-man-suit-be-scaled.jpg',
  'young-couple-wedding-day-scaled.jpg',
  'young-couple-wedding-day-3-scaled.jpg',
  'young-couple-wedding-day-5-scaled.jpg',
  'woman-white-dress-is-kneeling-floor-with-man-wearing-tutu-scaled.jpg',
  'man-woman-pose-front-gray-background-1-scaled.jpg',
  'man-woman-pose-photo-with-woman-holding-flowers-scaled.jpg',
].map((f) => `${UP}/2025/03/${f}`);

const TARGET = new Date('2026-05-25T06:30:00+07:00').getTime();

function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

function GallerySlider() {
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(3);
  const timer = useRef(null);

  useEffect(() => {
    const update = () =>
      setPerView(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const pages = Math.ceil(GALLERY.length / perView);

  useEffect(() => {
    timer.current = setInterval(() => setPage((p) => (p + 1) % pages), 2500);
    return () => clearInterval(timer.current);
  }, [pages]);

  useEffect(() => {
    if (page >= pages) setPage(0);
  }, [pages, page]);

  return (
    <div className="w-full">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {Array.from({ length: pages }).map((_, pi) => (
            <div key={pi} className="flex w-full shrink-0 gap-1 px-1">
              {GALLERY.slice(pi * perView, pi * perView + perView).map((src) => (
                <div key={src} className="w-full" style={{ maxWidth: `${100 / perView}%` }}>
                  <img
                    src={src}
                    alt="Cha and Art pre-wedding"
                    loading="lazy"
                    className="aspect-[2/3] w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setPage(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === page ? 'bg-neutral-800' : 'bg-neutral-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function GuestbookDialog({ open, onOpenChange }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-light tracking-[0.2em]">
            DIGITAL GUESTBOOK
          </DialogTitle>
          <DialogDescription className="text-center font-light">
            เชิญทุกท่านมาร่วมเป็นส่วนหนึ่งในการเติมเต็มความสุขให้กับเรา
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <p className="py-8 text-center font-light text-neutral-600">
            ขอบคุณสำหรับคำอวยพรนะคะ/ครับ
          </p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="space-y-2">
              <label htmlFor="gb-name" className="text-sm font-light">ชื่อของคุณ</label>
              <input
                id="gb-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full border border-neutral-300 px-4 py-2 font-light outline-none focus:border-neutral-800"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="gb-wish" className="text-sm font-light">คำอวยพร</label>
              <textarea
                id="gb-wish"
                required
                rows={4}
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-2 font-light outline-none focus:border-neutral-800"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full border border-neutral-800 py-2.5 tracking-[0.2em] transition-colors hover:bg-neutral-800 hover:text-white active:scale-[0.98]"
            >
              ส่งคำอวยพร
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function HomePage() {
  const { days, hours, mins, secs } = useCountdown();
  const [gbOpen, setGbOpen] = useState(false);

  return (
    <main className="bg-white font-light text-neutral-700">
      <Helmet>
        <title>Cha &amp; Art | การ์ดแต่งงานออนไลน์</title>
        <meta
          name="description"
          content="การ์ดแต่งงานออนไลน์ Cha and Art — ขอเรียนเชิญร่วมงานมงคลสมรส วันที่ 25 พฤษภาคม 2569 ณ โรงแรมเดอะ เพนนินซูลา กรุงเทพฯ"
        />
      </Helmet>

      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
        <img
          src={`${UP}/2025/03/R24-053_01.jpg`}
          alt="การ์ดแต่งงานออนไลน์ Cha and Art"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <Reveal y={30}>
          <img
            src={`${UP}/2025/03/R24-053_01.png`}
            alt="Cha Art"
            className="relative w-40 sm:w-56 md:w-64"
          />
        </Reveal>
      </section>

      {/* Invitation */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
        <Reveal>
          <img
            src={`${UP}/2024/12/Asset-18.png`}
            alt="The honour of your presence is requested at the marriage celebration of"
            className="mx-auto w-full max-w-2xl"
          />
        </Reveal>
        <div className="mt-14 grid grid-cols-1 items-start justify-items-center gap-12 md:grid-cols-2">
          <Reveal y={40}>
            <img
              src={`${UP}/2025/03/R24-053_04.png`}
              alt="Bride — นางสาวชลธิชา สุขเกษม"
              className="w-4/5 max-w-sm"
              loading="lazy"
            />
          </Reveal>
          <Reveal y={40} delay={0.15}>
            <img
              src={`${UP}/2025/03/R24-053_05.png`}
              alt="Groom — นายอครินทร ภูวนาถ"
              className="w-[82%] max-w-sm"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      {/* Countdown */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
        <Reveal>
          <img src={`${UP}/2025/03/R24-053_01.png`} alt="Cha Art" className="mx-auto w-28 md:w-36" loading="lazy" />
        </Reveal>
        <Reveal delay={0.1}>
          <img
            src={`${UP}/2025/05/R17-052-20.png`}
            alt="Let's celebrate together on our special day on"
            className="mx-auto mt-8 w-full max-w-md"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <img
            src={`${UP}/2025/03/R24-053_06.png`}
            alt="25 May 26"
            className="mx-auto w-full max-w-md"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex items-start justify-center gap-10 sm:gap-16">
            {[
              [days, 'DAYS'],
              [hours, 'HOURS'],
              [mins, 'MIN'],
              [secs, 'SEC'],
            ].map(([v, label]) => (
              <div key={label} className="w-16">
                <div className="text-4xl font-normal text-neutral-800 sm:text-5xl">{v}</div>
                <div className="mt-1 text-xs font-semibold tracking-widest text-neutral-600">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.25}>
          <a
            href={`${UP}/2025/03/R24-053.ics`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block rounded-full border border-neutral-800 px-8 py-2.5 text-sm tracking-[0.2em] text-neutral-800 transition-colors hover:bg-neutral-800 hover:text-white active:scale-[0.98]"
          >
            ADD TO CALENDAR
          </a>
        </Reveal>
      </section>

      {/* Schedule */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
        <Reveal>
          <img src={`${UP}/2024/12/Asset-21.png`} alt="Schedule" className="mx-auto w-full max-w-xl" loading="lazy" />
        </Reveal>
        <Reveal delay={0.1}>
          <img
            src={`${UP}/2025/03/R24-053-03-768x723.jpg`}
            alt="Cha and Art"
            className="mx-auto mt-10 w-full max-w-3xl object-cover"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <img
            src={`${UP}/2025/03/R24-053.png`}
            alt="กำหนดการงานแต่งงาน"
            className="mx-auto mt-10 w-full max-w-2xl"
            loading="lazy"
          />
        </Reveal>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
        <Reveal>
          <h2 className="text-3xl font-extralight tracking-wide text-neutral-800">Gallery</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 aspect-video w-full max-w-2xl">
            <iframe
              src="https://www.youtube-nocookie.com/embed/3sxwcJh4Q5s?controls=1"
              title="SAMPLE VDO MOBILE WEDDING CARD"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-12">
            <GallerySlider />
          </div>
        </Reveal>
      </section>

      {/* RSVP */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Reveal>
          <img
            src={`${UP}/2025/07/Asset-25-768x154-1.png`}
            alt="R.S.V.P"
            className="mx-auto w-full max-w-lg"
            loading="lazy"
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <Reveal className="text-center">
            <p className="mx-auto max-w-md text-lg italic leading-relaxed">
              <strong className="font-semibold">
                “เพื่อให้เราสามารถวางแผนในการดูแลท่าน ซึ่งเป็นแขกคนสำคัญได้อย่างเต็มที่
                ขอรบกวนทุกท่านทำแบบตอบรับการเข้าร่วมงานให้เราด้วยนะคะ/ครับ”
              </strong>
            </p>
            <p className="mt-6 uppercase italic tracking-widest">Hope to see you at our wedding</p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeSm2ywJBxV6uqrbjHFUQbNLG6SuVDqo_hfoJjRI2AD5lCPiw/viewform?usp=sf_link"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full border border-neutral-800 px-8 py-2.5 text-sm text-neutral-800 transition-colors hover:bg-neutral-800 hover:text-white active:scale-[0.98]"
            >
              กดเพื่อลงทะเบียนเข้าร่วมงาน
            </a>
          </Reveal>
          <Reveal delay={0.15}>
            <img
              src={`${UP}/2025/03/bride-groom-pose-photo-2-768x1152.jpg`}
              alt="Cha and Art"
              className="mx-auto w-full max-w-md object-cover"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      {/* Guestbook */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        <Reveal>
          <h2 className="text-3xl font-extralight tracking-[0.25em] text-neutral-800">
            DIGITAL GUESTBOOK
          </h2>
          <p className="mt-8 text-lg italic leading-relaxed">
            เชิญทุกท่านมาร่วมเป็นส่วนหนึ่งในการเติมเต็มความสุขให้กับเรา ร่วมอวยพรให้เราทั้งคู่ได้ที่นี่
          </p>
          <button
            onClick={() => setGbOpen(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-neutral-800 px-8 py-2.5 text-sm text-neutral-800 transition-colors hover:bg-neutral-800 hover:text-white active:scale-[0.98]"
          >
            <PenLine className="h-4 w-4" />
            เขียนคำอวยพรดิจิตอล
          </button>
        </Reveal>
      </section>

      {/* Venue */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24">
        <Reveal>
          <MapPin className="mx-auto h-6 w-6 text-neutral-800" />
          <h2 className="mt-3 text-2xl font-light text-neutral-800">The Venue</h2>
          <p className="mt-1 text-xl font-light text-neutral-700">The Peninsula Bangkok Resort</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 overflow-hidden">
            <iframe
              title="The Peninsula Bangkok map"
              src="https://www.google.com/maps?q=The+Peninsula+Bangkok&output=embed"
              className="h-[380px] w-full border-0"
              loading="lazy"
            />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 flex items-center justify-center gap-2 font-light">
            <MapPin className="h-4 w-4" />
            333 Charoen Nakhon Rd, Khlong Ton Sai, Khlong San, Bangkok 10600
          </p>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=The+Peninsula+Bangkok"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full rounded-full border border-neutral-800 py-3 text-sm tracking-[0.3em] text-neutral-800 transition-colors hover:bg-neutral-800 hover:text-white active:scale-[0.99]"
          >
            DIRECTION
          </a>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-16 pt-8 text-center">
        <p className="text-sm font-light text-neutral-600">Powered by</p>
        <p className="mt-2 text-4xl font-normal tracking-tight text-neutral-800">M</p>
        <p className="mt-1 text-sm tracking-[0.35em] text-neutral-700">MANITA WEDDING</p>
        <p className="mt-1 text-sm font-light text-neutral-600">การ์ดแต่งงานมานิตาเวดดิ้ง</p>
      </footer>

      {/* Floating contact */}
      <a
        href="https://e-card.manitawedding.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ติดต่อเรา"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2"
      >
        <span className="rounded-full bg-white px-3 py-1 text-xs shadow-md">ติดต่อเรา</span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-105">
          <MessageCircle className="h-6 w-6" />
        </span>
      </a>

      <GuestbookDialog open={gbOpen} onOpenChange={setGbOpen} />
    </main>
  );
}
