import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  MessageCircle,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/common/Reveal";
import GuestbookSection from "@/components/common/GuestbookSection";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Static assets served from apps/web/public/images/cha-art.
const UP = "/images/b-p";

const GALLERY = [
  "wedding-couple-indoors-is-hugging-each-other-beautiful-model-woman-white-dress-man-suit-be-1-scaled.jpg",
  "wedding-couple-groom-bride-posing-white-studio-2-scaled.jpg",
  "wedding-couple-groom-bride-posing-white-studio-scaled.jpg",
  "wedding-couple-groom-bride-posing-white-studio-1-scaled.jpg",
  "wedding-couple-love-beautiful-bride-elegant-groom-black-background-stylish-newlywed-coup-scaled.jpg",
  "wedding-couple-indoors-is-hugging-each-other-beautiful-model-woman-white-dress-man-suit-be-scaled.jpg",
  "young-couple-wedding-day-scaled.jpg",
  "young-couple-wedding-day-3-scaled.jpg",
  "young-couple-wedding-day-5-scaled.jpg",
  "woman-white-dress-is-kneeling-floor-with-man-wearing-tutu-scaled.jpg",
  "man-woman-pose-front-gray-background-1-scaled.jpg",
  "man-woman-pose-photo-with-woman-holding-flowers-scaled.jpg",
].map((f) => `${UP}/2025/03/${f}`);

const TARGET = new Date("2026-11-22T00:00:00+07:00").getTime();

function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins };
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
      setPerView(
        window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3,
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pages = Math.ceil(GALLERY.length / perView);

  useEffect(() => {
    if (activeIndex !== null) return undefined;

    timer.current = setInterval(() => setPage((p) => (p + 1) % pages), 2500);
    return () => clearInterval(timer.current);
  }, [activeIndex, pages]);

  useEffect(() => {
    if (page >= pages) setPage(0);
  }, [pages, page]);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((index) =>
      index === null ? 0 : (index - 1 + GALLERY.length) % GALLERY.length,
    );
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((index) =>
      index === null ? 0 : (index + 1) % GALLERY.length,
    );
  }, []);

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
              {GALLERY.slice(pi * perView, pi * perView + perView).map(
                (src, imageOffset) => {
                  const imageIndex = pi * perView + imageOffset;
                  return (
                    <div
                      key={src}
                      className="w-full"
                      style={{ maxWidth: `${100 / perView}%` }}
                    >
                      <button
                        type="button"
                        onClick={(event) => {
                          triggerRef.current = event.currentTarget;
                          setActiveIndex(imageIndex);
                        }}
                        aria-label={`Open pre-wedding photo ${imageIndex + 1} of ${GALLERY.length}`}
                        className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C62828] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF5F7]"
                      >
                        <img
                          src={src}
                          alt={`Opal and Bank pre-wedding photo ${imageIndex + 1}`}
                          loading="lazy"
                          className="aspect-[2/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105"
                        />
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#8E1B1B]/45 via-[#C62828]/10 to-[#E91E63]/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                        <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#C62828] opacity-0 shadow-[0_8px_24px_rgba(142,27,27,0.18)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 scale-90">
                          <Maximize2 className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </button>
                    </div>
                  );
                },
              )}
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
              i === page ? "bg-[#C62828]" : "bg-[#F3C7D5] hover:bg-[#E91E63]/60"
            }`}
          />
        ))}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={handleOpenChange}>
        <DialogContent className="!left-0 !top-0 !flex !h-[100dvh] !w-full !max-w-none !translate-x-0 !translate-y-0 !flex-col !gap-0 border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">
            Pre-wedding photo viewer
          </DialogTitle>
          <DialogDescription className="sr-only">
            Use the previous and next controls, arrow keys, or swipe to browse
            the gallery.
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
                className="absolute z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#8E1B1B] shadow-lg shadow-black/20 transition-colors right-4 top-4 hover:bg-[#FCE4EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </DialogClose>

            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous photo"
              className="absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#8E1B1B] shadow-lg shadow-black/20 transition-colors left-2 hover:bg-[#FCE4EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
            >
              <ChevronLeft className="h-7 w-7" aria-hidden="true" />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={activeIndex}
                src={GALLERY[activeIndex]}
                alt={`Opal and Bank pre-wedding photo ${activeIndex + 1}`}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="object-contain max-w-full max-h-full shadow-2xl select-none"
                draggable="false"
              />
            </AnimatePresence>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#8E1B1B] shadow-lg shadow-black/20 transition-colors right-2 hover:bg-[#FCE4EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
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
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-16 w-12 shrink-0 overflow-hidden rounded-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-20 sm:w-14 ${
                  index === activeIndex
                    ? "ring-2 ring-[#E91E63] ring-offset-2 ring-offset-black opacity-100"
                    : "opacity-60 hover:opacity-100"
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

export default function HomePage() {
  const { days, hours, mins } = useCountdown();

  return (
    <main className="bg-[#FFF9FA] font-light text-[#3A1F24]">
      <Helmet>
        <title>Opal &amp; Bank</title>
        <meta
          name="description"
          content="Opal and Bank — ขอเรียนเชิญร่วมงานมงคลสมรส วันที่ 22 พฤศจิกายน 2569 ณ ภัตตาคาร มิตรภาพ แคทเทอริ่ง จ.ศรีสะเกษ"
        />
      </Helmet>

      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#3A1F24]">
        <img
          src={`${UP}/2025/03/R24-053_01.jpg`}
          alt="การ์ดแต่งงานออนไลน์ Opal and Bank"
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#3A1F24]/10 via-transparent to-[#8E1B1B]/45" />
        <Reveal y={30}>
          <img
            src={`${UP}/2025/03/R24-053_01.png`}
            alt="Opal Bank"
            className="relative w-40 drop-shadow-[0_10px_24px_rgba(58,31,36,0.3)] sm:w-56 md:w-64"
          />
        </Reveal>
      </section>

      {/* Invitation */}
      <section className="mx-auto my-6 max-w-6xl rounded-[2rem] bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(142,27,27,0.06)] md:my-10 md:py-24">
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
      <section className="mx-auto my-6 max-w-4xl rounded-[2rem] border border-[#F7D8E2] bg-[#FCE4EC]/70 px-6 py-16 text-center shadow-[0_16px_50px_rgba(142,27,27,0.06)] md:my-10 md:py-24">
        <Reveal>
          <img
            src={`${UP}/2025/03/R24-053_01.png`}
            alt="Opal Bank"
            className="mx-auto w-28 md:w-36"
            loading="lazy"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <img
            src={`${UP}/2025/05/wedding-date-transparent.svg`}
            alt="Let's celebrate together on our special day on"
            className="w-full max-w-lg mx-auto mt-4"
            loading="lazy"
          />
        </Reveal>
        {/* <Reveal delay={0.15}>
          <img
            src={`${UP}/2025/03/R24-053_06.png`}
            alt="25 May 26"
            className="w-full max-w-md mx-auto"
            loading="lazy"
          />
        </Reveal> */}
        <Reveal delay={0.2}>
          <div className="flex items-start justify-center gap-10 mt-10 sm:gap-16">
            {[
              [days, "วัน"],
              [hours, "ชั่วโมง"],
              [mins, "นาที"],
            ].map(([v, label]) => (
              <div key={label} className="w-16">
                <div className="text-4xl font-normal text-[#8E1B1B] sm:text-5xl">
                  {v}
                </div>
                <div className="mt-1 text-sm font-medium tracking-widest text-[#7A5A61]">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        {/* <Reveal delay={0.25}>
          <a
            href={`${UP}/2025/03/R24-053.ics`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block rounded-full bg-[#C62828] px-8 py-2.5 text-sm tracking-[0.2em] text-white shadow-[0_10px_24px_rgba(198,40,40,0.2)] transition-colors hover:bg-[#8E1B1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            เพิ่มลงปฏิทินของคุณ
          </a>
        </Reveal> */}
      </section>

      {/* Schedule */}
      <section className="mx-auto my-6 max-w-5xl rounded-[2rem] bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(142,27,27,0.06)] md:my-10 md:py-24">
        {/* <Reveal>
          <img
            src={`${UP}/2024/12/Asset-21.png`}
            alt="Schedule"
            className="w-full max-w-xl mx-auto"
            loading="lazy"
          />
        </Reveal> */}
        <p className="text-3xl font-medium text-[#8E1B1B] bg-gradient-to-r from-[#d91818] to-[#E91E63] bg-clip-text text-transparent">
          กำหนดการงานแต่งงาน
        </p>
        <Reveal delay={0.1}>
          <img
            src={`${UP}/2025/03/R24-053-03-768x723.jpg`}
            alt="Cha and Art"
            className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-[#FCE4EC] object-cover shadow-[0_14px_36px_rgba(142,27,27,0.08)]"
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
      <section className="mx-auto my-6 max-w-6xl rounded-[2rem] border border-[#F7D8E2] bg-[#FFF5F7] px-6 py-16 text-center shadow-[0_16px_50px_rgba(142,27,27,0.06)] md:my-10 md:py-24">
        <Reveal>
          <h2 className="text-3xl font-medium tracking-wide text-[#8E1B1B]">
            Gallery
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mx-auto mt-10 aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-[#F3C7D5] bg-white shadow-[0_14px_36px_rgba(142,27,27,0.08)]">
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
      <section className="mx-auto my-6 max-w-6xl rounded-[2rem] bg-white px-6 py-16 shadow-[0_16px_50px_rgba(142,27,27,0.06)] md:my-10 md:py-24">
        <div className="grid items-center grid-cols-1 gap-12 mt-12 md:grid-cols-2">
          <Reveal className="text-center">
            <p className="mx-auto max-w-md text-lg italic leading-relaxed text-[#3A1F24]">
              <strong className="font-medium">
                “เพื่อให้เราสามารถวางแผนในการดูแลท่าน
                ซึ่งเป็นแขกคนสำคัญได้อย่างเต็มที่
                ขอรบกวนทุกท่านทำแบบตอบรับการเข้าร่วมงานให้เราด้วยนะคะ/ครับ”
              </strong>
            </p>
            <p className="mt-6 italic tracking-widest text-[#7A5A61] uppercase">
              Hope to see you at our wedding
            </p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeSm2ywJBxV6uqrbjHFUQbNLG6SuVDqo_hfoJjRI2AD5lCPiw/viewform?usp=sf_link"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-[#C62828] px-8 py-2.5 text-sm text-white shadow-[0_10px_24px_rgba(198,40,40,0.2)] transition-colors hover:bg-[#8E1B1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              กดเพื่อลงทะเบียนเข้าร่วมงาน
            </a>
          </Reveal>
          <Reveal delay={0.15}>
            <img
              src={`${UP}/2025/03/bride-groom-pose-photo-2-768x1152.jpg`}
              alt="Opal and Bank"
              className="mx-auto w-full max-w-md rounded-2xl border border-[#FCE4EC] object-cover shadow-[0_14px_36px_rgba(142,27,27,0.08)]"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      {/* Guestbook */}
      <GuestbookSection />

      {/* Venue */}
      <section className="mx-auto my-6 max-w-6xl rounded-[2rem] bg-white px-6 py-16 text-center shadow-[0_16px_50px_rgba(142,27,27,0.06)] md:my-10 md:py-24">
        <Reveal>
          <MapPin className="mx-auto h-6 w-6 text-[#E91E63]" />
          <h2 className="mt-3 text-2xl font-medium text-[#8E1B1B]">
            สถานที่จัดงาน
          </h2>
          <p className="mt-1 text-xl font-light text-[#7A5A61]">
            มิตรภาพ เเคทเทอริ่ง จ.ศรีสะเกษ
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#F3C7D5] shadow-[0_14px_36px_rgba(142,27,27,0.08)]">
            <iframe
              title="มิตรภาพ เเคทเทอริ่ง จ.ศรีสะเกษ"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.9100080386024!2d104.32314777148537!3d15.117936547973716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3116e2da3576d0c7%3A0xe2605fdd5a6c0a5f!2z4Lig4Lix4LiV4LiV4Liy4LiE4Liy4LijIOC4oeC4tOC4leC4o-C4oOC4suC4ng!5e0!3m2!1sth!2sth!4v1789097371885!5m2!1sth!2sth"
              className="h-[380px] w-full border-0"
              loading="lazy"
            />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 flex items-center justify-center gap-2 font-light text-[#7A5A61]">
            <MapPin className="h-4 w-4 text-[#E91E63]" />
            431 ซอยปลัดมณฑล, ต.เมืองใต้ อ.เมืองศรีสะเกษ จ.ศรีสะเกษ 33000
          </p>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=15.1179069,104.3254308&destination_place_id=ChIJx9B2NdriFjERXwpsWt1fYOI"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full rounded-full bg-[#C62828] py-3 text-sm tracking-[0.3em] text-white shadow-[0_10px_24px_rgba(198,40,40,0.2)] transition-colors hover:bg-[#8E1B1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2 active:scale-[0.99]"
          >
            นำทางไปยังสถานที่จัดงาน
          </a>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="px-6 pt-12 pb-16 text-center">
        <p className="text-sm font-light text-[#7A5A61]">Wedding Celebration</p>
        <p className="mt-2 text-4xl font-medium tracking-tight text-[#8E1B1B]">
          Opal & Bank
        </p>
        <p className="mt-1 text-sm font-light text-[#7A5A61]">
          กราบขออภัยหากมิได้มาเรียนเชิญด้วยตนเอง
        </p>
      </footer>

      {/* Floating contact */}
      {/* <a
        href="https://www.facebook.com/Bankhk13452/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="สอบถาม"
        className="fixed z-40 flex items-center gap-2 bottom-6 right-6"
      >
        <span className="rounded-full border border-[#F3C7D5] bg-white px-3 py-1 text-xs text-[#7A5A61] shadow-[0_8px_20px_rgba(142,27,27,0.1)]">
          สอบถาม
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#C62828] to-[#E91E63] text-white shadow-[0_10px_24px_rgba(198,40,40,0.28)] transition-transform hover:scale-105">
          <MessageCircle className="w-6 h-6" />
        </span>
      </a>

      <GuestbookDialog open={gbOpen} onOpenChange={setGbOpen} /> */}
    </main>
  );
}
