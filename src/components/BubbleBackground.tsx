const bubbles = [
  { size: 320, left: "4%", bottom: "-12%", delay: "0s", duration: "10s", opacity: 0.38, anim: "bubble-rise" },
  { size: 200, left: "68%", bottom: "8%", delay: "-2s", duration: "9s", opacity: 0.32, anim: "bubble-float" },
  { size: 140, left: "35%", bottom: "22%", delay: "-4s", duration: "8s", opacity: 0.36, anim: "bubble-sway" },
  { size: 260, left: "85%", bottom: "-6%", delay: "-1s", duration: "11s", opacity: 0.26, anim: "bubble-rise" },
  { size: 100, left: "15%", bottom: "40%", delay: "-6s", duration: "7s", opacity: 0.42, anim: "bubble-float" },
  { size: 180, left: "52%", bottom: "2%", delay: "-3s", duration: "9.5s", opacity: 0.33, anim: "bubble-sway" },
  { size: 80, left: "78%", bottom: "35%", delay: "-5s", duration: "6.5s", opacity: 0.45, anim: "bubble-rise" },
  { size: 220, left: "-6%", bottom: "18%", delay: "-7s", duration: "12s", opacity: 0.28, anim: "bubble-float" },
  { size: 110, left: "25%", bottom: "6%", delay: "-1.5s", duration: "8s", opacity: 0.35, anim: "bubble-sway" },
  { size: 160, left: "60%", bottom: "48%", delay: "-5s", duration: "9s", opacity: 0.3, anim: "bubble-rise" },
  { size: 70, left: "92%", bottom: "55%", delay: "-3s", duration: "6s", opacity: 0.4, anim: "bubble-float" },
  { size: 130, left: "8%", bottom: "62%", delay: "-8s", duration: "10.5s", opacity: 0.31, anim: "bubble-sway" },
  { size: 95, left: "44%", bottom: "72%", delay: "-6s", duration: "7.5s", opacity: 0.37, anim: "bubble-rise" },
  { size: 240, left: "72%", bottom: "78%", delay: "-9s", duration: "13s", opacity: 0.24, anim: "bubble-float" },
  { size: 55, left: "20%", bottom: "85%", delay: "-7s", duration: "5.5s", opacity: 0.44, anim: "bubble-sway" },
  { size: 175, left: "48%", bottom: "88%", delay: "-10s", duration: "11.5s", opacity: 0.29, anim: "bubble-rise" },
  { size: 120, left: "88%", bottom: "18%", delay: "-11s", duration: "8s", opacity: 0.34, anim: "bubble-float" },
  { size: 65, left: "58%", bottom: "30%", delay: "-12s", duration: "6.5s", opacity: 0.41, anim: "bubble-sway" },
] as const;

export function BubbleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/95 to-green-100/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(52,211,153,0.22),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(16,185,129,0.14),transparent)]" />

      {bubbles.map((b, i) => (
        <span
          key={i}
          className={`bubble rounded-full border border-white/40 bg-gradient-to-br from-teal-200/55 to-emerald-300/40 shadow-[inset_0_-8px_24px_rgba(255,255,255,0.4)] backdrop-blur-[2px] ${b.anim} ${i % 2 === 0 ? "bubble-reverse" : ""}`}
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            bottom: b.bottom,
            opacity: b.opacity,
            animationDelay: b.delay,
            animationDuration: b.duration,
            ["--bubble-drift" as string]: `${12 + (i % 5) * 8}px`,
          }}
        />
      ))}
    </div>
  );
}
