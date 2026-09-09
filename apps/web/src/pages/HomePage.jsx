import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, PenLine, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Reveal from '@/components/Reveal';
import {
  Dialog,
  DialogClose,
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
  const [activeIndex, setActiveIndex] = useState(null);
  const timer = useRef(null);
  const triggerRef = useRef(null);
  const touchStartX = useRef(null);

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

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((index) => (index === null ? 0 : (index - 1 + GALLERY.length) % GALLERY.length));
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index === null ? 0 : (index + 1) % GALLERY.length));
  }, []);

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPrevious();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNext();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, closeLightbox, showNext, showPrevious]);

  const handleOpenChange = (open) => {
    if (!open) closeLightbox();
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 40) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {Array.from({ length: pages }).map((_, pi) => (
            <div key={pi} className="flex w-full gap-1 px-1 shrink-0">
              {GALLERY.slice(pi * perView, pi * perView + perView).map((src, imageOffset) => {
                const imageIndex = pi * perView + imageOffset;
                return (
                  <div key={src} className="w-full" style={{ maxWidth: `${100 / perView}%` }}>
                    <button
                      type="button"
                      onClick={(event) => {
                        triggerRef.current = event.currentTarget;
                        setActiveIndex(imageIndex);
                      }}
                      aria-label={`Open pre-wedding photo ${imageIndex + 1} of ${GALLERY.length}`}
                      className="relative block w-full overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2"
                    >
                      <img
                        src={src}
                        alt={`Cha and Art pre-wedding photo ${imageIndex + 1}`}
                        loading="lazy"
                        className="aspect-[2/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105"
                      />
                      <span className="absolute inset-0 transition-colors duration-300 bg-black/0 group-hover:bg-black/10 group-focus-visible:bg-black/10" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
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

      <Dialog open={activeIndex !== null} onOpenChange={handleOpenChange}>
        <DialogContent
          className="!left-0 !top-0 !flex !h-[100dvh] !w-full !max-w-none !translate-x-0 !translate-y-0 !flex-col !gap-0 border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button:last-child]:hidden"
        >
          <DialogTitle className="sr-only">Pre-wedding photo viewer</DialogTitle>
          <DialogDescription className="sr-only">
            Use the previous and next controls, arrow keys, or swipe to browse the gallery.
          </DialogDescription>

          <div
            className="relative flex items-center justify-center flex-1 min-h-0 px-3 pt-12 pb-2 sm:px-20"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) closeLightbox();
            }}
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0].clientX;
            }}
            onTouchEnd={handleTouchEnd}
          >
            <span className="absolute px-3 py-1 text-sm text-white rounded-full left-4 top-5 bg-black/50 tabular-nums sm:left-6">
              {activeIndex + 1} / {GALLERY.length}
            </span>

            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close photo viewer"
                className="absolute z-20 flex items-center justify-center text-white transition-colors rounded-full right-4 top-4 h-11 w-11 bg-black/50 hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </DialogClose>

            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous photo"
              className="absolute z-10 flex items-center justify-center w-12 h-12 text-white transition-colors rounded-full left-2 bg-black/50 hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
            >
              <ChevronLeft className="h-7 w-7" aria-hidden="true" />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={activeIndex}
                src={GALLERY[activeIndex]}
                alt={`Cha and Art pre-wedding photo ${activeIndex + 1}`}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="object-contain max-w-full max-h-full shadow-2xl select-none"
                draggable="false"
              />
            </AnimatePresence>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute z-10 flex items-center justify-center w-12 h-12 text-white transition-colors rounded-full right-2 bg-black/50 hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
            >
              <ChevronRight className="h-7 w-7" aria-hidden="true" />
            </button>
          </div>

          <div
            className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-5 pt-2 [scrollbar-width:thin]"
            aria-label="Gallery thumbnails"
          >
            {GALLERY.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View photo ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={`h-16 w-12 shrink-0 overflow-hidden rounded-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-20 sm:w-14 ${
                  index === activeIndex
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-black opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={src}
                  alt={`Thumbnail for pre-wedding photo ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GuestbookDialog({ open, onOpenChange }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-light tracking-[0.2em]">
            DIGITAL GUESTBOOK
          </DialogTitle>
          <DialogDescription className="font-light text-center">
            เชิญทุกท่านมาร่วมเป็นส่วนหนึ่งในการเติมเต็มความสุขให้กับเรา
          </DialogDescription>
        </DialogHeader>
        {sent ? (
          <p className="py-8 font-light text-center text-neutral-600">
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
                className="w-full px-4 py-2 font-light border rounded-full outline-none border-neutral-300 focus:border-neutral-800"
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
                className="w-full px-4 py-2 font-light border outline-none rounded-2xl border-neutral-300 focus:border-neutral-800"
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
    <main className="font-light bg-white text-neutral-700">
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
          className="absolute inset-0 object-cover w-full h-full"
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
      <section className="max-w-6xl px-6 py-16 mx-auto text-center md:py-24">
        <Reveal>
          <img
            src={`${UP}/2024/12/Asset-18.png`}
            alt="The honour of your presence is requested at the marriage celebration of"
            className="w-full max-w-2xl mx-auto"
          />
        </Reveal>
        <div className="grid items-start grid-cols-1 gap-12 mt-14 justify-items-center md:grid-cols-2">
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
      <section className="max-w-4xl px-6 py-16 mx-auto text-center md:py-24">
        <Reveal>
          <img src={`${UP}/2025/03/R24-053_01.png`} alt="Cha Art" className="mx-auto w-28 md:w-36" loading="lazy" />
        </Reveal>
        <Reveal delay={0.1}>
          <img
            src={`${UP}/2025/05/R17-052-20.png`}
            alt="Let's celebrate together on our special day on"
            className="w-full max-w-md mx-auto mt-8"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <img
            src={`${UP}/2025/03/R24-053_06.png`}
            alt="25 May 26"
            className="w-full max-w-md mx-auto"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex items-start justify-center gap-10 mt-10 sm:gap-16">
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
      <section className="max-w-5xl px-6 py-16 mx-auto text-center md:py-24">
        <Reveal>
          <img src={`${UP}/2024/12/Asset-21.png`} alt="Schedule" className="w-full max-w-xl mx-auto" loading="lazy" />
        </Reveal>
        <Reveal delay={0.1}>
          <img
            src={`${UP}/2025/03/R24-053-03-768x723.jpg`}
            alt="Cha and Art"
            className="object-cover w-full max-w-3xl mx-auto mt-10"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <img
            src={`${UP}/2025/03/R24-053.png`}
            alt="กำหนดการงานแต่งงาน"
            className="w-full max-w-2xl mx-auto mt-10"
            loading="lazy"
          />
        </Reveal>
      </section>

      {/* Gallery */}
      <section className="max-w-6xl px-6 py-16 mx-auto text-center md:py-24">
        <Reveal>
          <h2 className="text-3xl tracking-wide font-extralight text-neutral-800">Gallery</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="w-full max-w-2xl mx-auto mt-10 aspect-video">
            <iframe
              src="https://www.youtube-nocookie.com/embed/3sxwcJh4Q5s?controls=1"
              title="SAMPLE VDO MOBILE WEDDING CARD"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
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
      <section className="max-w-6xl px-6 py-16 mx-auto md:py-24">
        <Reveal>
          <img
            src={`${UP}/2025/07/Asset-25-768x154-1.png`}
            alt="R.S.V.P"
            className="w-full max-w-lg mx-auto"
            loading="lazy"
          />
        </Reveal>
        <div className="grid items-center grid-cols-1 gap-12 mt-12 md:grid-cols-2">
          <Reveal className="text-center">
            <p className="max-w-md mx-auto text-lg italic leading-relaxed">
              <strong className="font-semibold">
                “เพื่อให้เราสามารถวางแผนในการดูแลท่าน ซึ่งเป็นแขกคนสำคัญได้อย่างเต็มที่
                ขอรบกวนทุกท่านทำแบบตอบรับการเข้าร่วมงานให้เราด้วยนะคะ/ครับ”
              </strong>
            </p>
            <p className="mt-6 italic tracking-widest uppercase">Hope to see you at our wedding</p>
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
              className="object-cover w-full max-w-md mx-auto"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      {/* Guestbook */}
      <section className="max-w-3xl px-6 py-16 mx-auto text-center md:py-24">
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
            <PenLine className="w-4 h-4" />
            เขียนคำอวยพรดิจิตอล
          </button>
        </Reveal>
      </section>

      {/* Venue */}
      <section className="max-w-6xl px-6 py-16 mx-auto text-center md:py-24">
        <Reveal>
          <MapPin className="w-6 h-6 mx-auto text-neutral-800" />
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
          <p className="flex items-center justify-center gap-2 mt-6 font-light">
            <MapPin className="w-4 h-4" />
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
      <footer className="px-6 pt-8 pb-16 text-center">
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
        className="fixed z-40 flex items-center gap-2 bottom-6 right-6"
      >
        <span className="px-3 py-1 text-xs bg-white rounded-full shadow-md">ติดต่อเรา</span>
        <span className="flex items-center justify-center w-12 h-12 text-white transition-transform bg-green-500 rounded-full shadow-lg hover:scale-105">
          <MessageCircle className="w-6 h-6" />
        </span>
      </a>

      <GuestbookDialog open={gbOpen} onOpenChange={setGbOpen} />
    </main>
  );
}
