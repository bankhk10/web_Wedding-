import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/common/Reveal";

const API_URL = "/api/guestbook.php";
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;

function GuestbookMessages() {
  const [messages, setMessages] = useState([]);
  const [loadState, setLoadState] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}?limit=4`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error("load failed");
        return payload.data;
      })
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoadState("success");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadState("error");
      });

    return () => controller.abort();
  }, []);

  if (loadState === "loading") {
    return (
      <p className="mt-8 text-center font-light text-[#7A5A61]">
        กำลังโหลดคำอวยพร...
      </p>
    );
  }

  if (loadState === "error") {
    return (
      <p className="mt-8 text-center font-light text-[#7A5A61]">
        ยังไม่สามารถโหลดคำอวยพรได้
      </p>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="mt-8 text-center font-light text-[#7A5A61]">
        <p>ยังไม่มีคำอวยพรในขณะนี้</p>
        <p className="mt-1">
          มาเป็นคนแรกที่ส่งคำอวยพรให้ Opal &amp; Bank กันนะ 💕
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="grid gap-4 text-left sm:grid-cols-2">
        {messages.map((message) => (
          <article
            key={message.id}
            className="rounded-2xl border border-[#F3C7D5] bg-white/70 p-5 shadow-[0_8px_20px_rgba(142,27,27,0.05)]"
          >
            <h3 className="font-medium text-[#8E1B1B]">คุณ: {message.name}</h3>
            <p className="mt-3 whitespace-pre-wrap break-words font-light leading-relaxed text-[#3A1F24]">
              {message.message}
            </p>
          </article>
        ))}
      </div>
      <Link
        to="/guestbook"
        className="mt-8 inline-flex items-center justify-center rounded-full border border-[#E91E63] bg-white px-6 py-2.5 text-sm font-medium text-[#C62828] shadow-[0_8px_20px_rgba(198,40,40,0.08)] transition-colors hover:bg-[#FCE4EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2"
      >
        💌 ดูคำอวยพรทั้งหมด
      </Link>
    </div>
  );
}

function GuestbookForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitState === "loading") return;

    setSubmitState("loading");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) throw new Error("submit failed");

      setName("");
      setMessage("");
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <form className="mt-8 space-y-4 text-left" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          htmlFor="guestbook-name"
          className="text-sm font-medium text-[#3A1F24]"
        >
          ชื่อของคุณ
        </label>
        <input
          id="guestbook-name"
          required
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-full border border-[#F3C7D5] bg-[#FFF9FA] px-4 py-2 font-light text-[#3A1F24] outline-none transition-colors placeholder:text-[#B8909A] focus:border-[#E91E63] focus:ring-2 focus:ring-[#FCE4EC]"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="guestbook-message"
          className="text-sm font-medium text-[#3A1F24]"
        >
          คำอวยพร
        </label>
        <textarea
          id="guestbook-message"
          required
          maxLength={MAX_MESSAGE_LENGTH}
          rows={4}
          placeholder="เขียนคำอวยพรถึง Opal & Bank"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full resize-y rounded-2xl border border-[#F3C7D5] bg-[#FFF9FA] px-4 py-2 font-light text-[#3A1F24] outline-none transition-colors placeholder:text-[#B8909A] focus:border-[#E91E63] focus:ring-2 focus:ring-[#FCE4EC]"
        />
      </div>
      <button
        type="submit"
        disabled={submitState === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C62828] py-2.5 tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(198,40,40,0.2)] transition-colors hover:bg-[#8E1B1B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E91E63] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        <PenLine className="w-4 h-4" aria-hidden="true" />
        {submitState === "loading" ? "กำลังส่ง..." : "ส่งคำอวยพร"}
      </button>
      {submitState === "success" && (
        <p
          className="text-center text-sm font-light text-[#8E1B1B]"
          role="status"
        >
          💌 ส่งคำอวยพรเรียบร้อยแล้ว
          <br />
          ขอบคุณสำหรับคำอวยพรดีๆ คำอวยพรจะปรากฏบนเว็บไซต์หลังจากตรวจสอบแล้ว
        </p>
      )}
      {submitState === "error" && (
        <p
          className="text-center text-sm font-light text-[#8E1B1B]"
          role="alert"
        >
          ไม่สามารถส่งคำอวยพรได้ กรุณาลองใหม่อีกครั้ง
        </p>
      )}
    </form>
  );
}

export default function GuestbookSection() {
  return (
    <section className="mx-auto my-6 max-w-3xl rounded-[2rem] border border-[#F7D8E2] bg-[#FCE4EC]/70 px-6 py-16 text-center shadow-[0_16px_50px_rgba(142,27,27,0.06)] md:my-10 md:py-24">
      <Reveal>
        <h2 className="text-3xl font-medium tracking-[0.08em] text-[#8E1B1B]">
          💌 คำอวยพรจากแขกของเรา
        </h2>
        <p className="mt-6 text-lg italic leading-relaxed text-[#7A5A61]">
          เชิญทุกท่านมาร่วมเป็นส่วนหนึ่งในการเติมเต็มความสุขให้กับเรา
        </p>
        <GuestbookForm />
        <GuestbookMessages />
        <p className="mt-8 inline-flex items-center gap-2 text-sm font-light text-[#7A5A61]">
          <PenLine className="h-4 w-4 text-[#E91E63]" aria-hidden="true" />
          คำอวยพรจะแสดงหลังจากได้รับการตรวจสอบแล้ว
        </p>
      </Reveal>
    </section>
  );
}
