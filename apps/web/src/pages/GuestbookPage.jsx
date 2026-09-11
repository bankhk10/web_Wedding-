import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API_URL = "/api/guestbook.php";
const PAGE_SIZE = 20;

function formatDate(value) {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function GuestbookCard({ message }) {
  return (
    <article className="rounded-2xl border border-[#F3C7D5] bg-white/80 p-5 shadow-[0_8px_20px_rgba(142,27,27,0.05)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-medium text-[#8E1B1B]">คุณ: {message.name}</h2>
        <time
          className="text-xs font-light text-[#B8909A]"
          dateTime={message.created_at}
        >
          {formatDate(message.created_at)}
        </time>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words font-light leading-relaxed text-[#3A1F24]">
        {message.message}
      </p>
    </article>
  );
}

export default function GuestbookPage() {
  const [messages, setMessages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loadState, setLoadState] = useState("loading");
  const [hasMore, setHasMore] = useState(true);

  const loadMessages = async (nextOffset) => {
    setLoadState("loading");

    try {
      const response = await fetch(
        `${API_URL}?limit=${PAGE_SIZE}&offset=${nextOffset}`,
      );
      const payload = await response.json();
      if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
        throw new Error("load failed");
      }

      setMessages((current) =>
        nextOffset === 0 ? payload.data : [...current, ...payload.data],
      );
      setOffset(nextOffset);
      setHasMore(payload.data.length === PAGE_SIZE);
      setLoadState("success");
    } catch {
      setLoadState("error");
    }
  };

  useEffect(() => {
    loadMessages(0);
  }, []);

  const isInitialLoading = loadState === "loading" && messages.length === 0;

  return (
    <main className="min-h-screen bg-[#FFF9FA] px-6 py-12 text-[#3A1F24] md:py-20">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-[#8E1B1B]"
          aria-label="กลับหน้าหลัก"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8C9CF] transition-all duration-300 group-hover:bg-[#FBECEF]">
            <ArrowLeft
              size={17}
              strokeWidth={1.4}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </span>

          <span className="text-sm font-light tracking-wide">กลับหน้าหลัก</span>
        </Link>
        <header className="mt-8 text-center">
          <h1 className="text-3xl font-medium tracking-[0.08em] text-[#8E1B1B] md:text-4xl">
            คำอวยพรทั้งหมด
          </h1>
          <p className="mt-4 text-lg italic font-light text-[#7A5A61]">
            คำอวยพรดี ๆ จากแขกของ Opal &amp; Bank
          </p>
        </header>

        {isInitialLoading && (
          <p className="mt-10 text-center font-light text-[#7A5A61]">
            กำลังโหลดคำอวยพร...
          </p>
        )}

        {loadState === "error" && messages.length === 0 && (
          <p className="mt-10 text-center font-light text-[#7A5A61]">
            ยังไม่สามารถโหลดคำอวยพรได้
          </p>
        )}

        {loadState === "success" && messages.length === 0 && (
          <div className="mt-10 text-center font-light text-[#7A5A61]">
            <p>ยังไม่มีคำอวยพรในขณะนี้</p>
            <p className="mt-1">
              มาเป็นคนแรกที่ส่งคำอวยพรให้ Opal &amp; Bank กันนะ 💕
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="grid gap-4 mt-10 sm:grid-cols-2">
            {messages.map((message) => (
              <GuestbookCard key={message.id} message={message} />
            ))}
          </div>
        )}

        {loadState === "error" && messages.length > 0 && (
          <p className="mt-8 text-center text-sm font-light text-[#8E1B1B]">
            ไม่สามารถโหลดคำอวยพรเพิ่มเติมได้ กรุณาลองใหม่อีกครั้ง
          </p>
        )}

        {messages.length > 0 && hasMore && (
          <button
            type="button"
            disabled={loadState === "loading"}
            onClick={() => loadMessages(offset + PAGE_SIZE)}
            className="mx-auto mt-10 flex rounded-full bg-[#C62828] px-7 py-2.5 text-sm text-white shadow-[0_10px_24px_rgba(198,40,40,0.2)] transition-colors hover:bg-[#8E1B1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            {loadState === "loading" ? "กำลังโหลด..." : "โหลดคำอวยพรเพิ่มเติม"}
          </button>
        )}

        {messages.length > 0 && !hasMore && (
          <p className="mt-10 text-center text-sm font-light text-[#B8909A]">
            แสดงคำอวยพรทั้งหมดแล้ว
          </p>
        )}
      </div>
    </main>
  );
}
