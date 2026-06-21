"use client";

const LINE_OPACITY = 0.22;

export function PitchBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#0A1020]" />

      <div className="pitch-parallax absolute inset-[-4%]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 74% at 50% 52%, rgba(12, 48, 32, 0.38) 0%, rgba(8, 28, 18, 0.1) 48%, rgba(10, 16, 32, 0) 74%)",
          }}
        />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 700"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <rect
            x="48"
            y="44"
            width="304"
            height="612"
            rx="2"
            stroke="white"
            strokeOpacity={LINE_OPACITY}
            strokeWidth="1"
          />
          <line
            x1="48"
            y1="350"
            x2="352"
            y2="350"
            stroke="white"
            strokeOpacity={LINE_OPACITY * 0.9}
            strokeWidth="0.9"
          />
          <circle
            cx="200"
            cy="350"
            r="50"
            stroke="white"
            strokeOpacity={LINE_OPACITY * 0.85}
            strokeWidth="0.9"
          />
          <circle
            cx="200"
            cy="350"
            r="2.5"
            fill="white"
            fillOpacity={LINE_OPACITY * 0.7}
          />
          <rect
            x="112"
            y="44"
            width="176"
            height="68"
            stroke="white"
            strokeOpacity={LINE_OPACITY * 0.75}
            strokeWidth="0.8"
          />
          <rect
            x="112"
            y="588"
            width="176"
            height="68"
            stroke="white"
            strokeOpacity={LINE_OPACITY * 0.75}
            strokeWidth="0.8"
          />
          <rect
            x="152"
            y="44"
            width="96"
            height="26"
            stroke="white"
            strokeOpacity={LINE_OPACITY * 0.6}
            strokeWidth="0.7"
          />
          <rect
            x="152"
            y="630"
            width="96"
            height="26"
            stroke="white"
            strokeOpacity={LINE_OPACITY * 0.6}
            strokeWidth="0.7"
          />
        </svg>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 76% 62% at 50% 46%, transparent 0%, #0A1020 82%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0A1020] via-[#0A1020]/88 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A1020] via-[#0A1020]/94 to-transparent" />
    </div>
  );
}