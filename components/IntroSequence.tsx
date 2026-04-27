"use client";

/**
 * IntroSequence.tsx
 *
 * Full first-visit intro for A1 Motor Park:
 *   Phase 0 — Driver intro video plays fullscreen (muted, autoplay, playsinline)
 *   Phase 1 — Cross-fade to track preloader; track strokes draw in
 *   Phase 2 — Three chasing lights run around the track (brand-red, ink, data-green)
 *             Brand mark "A¹ motor park" fades in alongside
 *   Phase 3 — User clicks "Enter" (or auto-dismiss): the track-shaped knockout in the
 *             overlay mask scales from 0 → 60, logo-shaped hole grows beyond the viewport,
 *             revealing the real page. Component unmounts.
 *
 * Session-scoped: plays once per browser session. Set showOncePerSession={false}
 * during development so you see it on every refresh. The default prop value
 * ties this to NODE_ENV so you never have to remember.
 *
 * INTEGRATION (App Router, Next.js 14, next-intl):
 *
 *   // app/[lang]/layout.tsx
 *   import IntroSequence from "@/components/IntroSequence";
 *
 *   export default function RootLayout({ children, params: { lang } }) {
 *     return (
 *       <html lang={lang}>
 *         <body>
 *           <IntroSequence locale={lang as "bg" | "en"} />
 *           <div className="topo-bg" />
 *           <div className="grain-overlay" />
 *           {children}
 *         </body>
 *       </html>
 *     );
 *   }
 *
 * Defaults already point at /loading/intro.mp4 and /loading/intro-poster.jpg,
 * so no props are strictly required.
 *
 * TRACK_D below is a hand-traced silhouette approximation of the A1 Motor Park
 * circuit. For pixel-exact accuracy, replace it with the path from the logo's
 * source SVG. Transform-origin for the reveal (1280, 540) should be updated if
 * your replacement path has a different bounding-box center.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { trackPath, trackViewBox } from "@/lib/data/track";

// Real A1 Motor Park track geometry (auto-generated from public/track/a1.svg)
const TRACK_VB = `${trackViewBox.x} ${trackViewBox.y} ${trackViewBox.w} ${trackViewBox.h}`;
const TRACK_CX = trackViewBox.x + trackViewBox.w / 2;
const TRACK_CY = trackViewBox.y + trackViewBox.h / 2;

// sessionStorage (survives mobile pull-to-refresh since that stays in the
// same tab, but a fresh tab/browser session re-plays the cinematic intro).
// Use ?forceVideo=1 to replay within the same session, or ?skipIntro=1 to
// bypass the whole overlay.
const VIDEO_KEY = "a1mp_video_seen_v1";

type Phase = "hidden" | "video" | "preloader" | "revealing";

interface Props {
  /** Path to intro video, served from /public. Default: /loading/intro.mp4 */
  videoSrc?: string;
  /** Optional webm fallback — omit if you don't ship one. */
  videoSrcWebm?: string;
  /** Poster shown before the video can paint its first frame. Prevents black flash. */
  poster?: string;
  /** Current locale ("bg" or "en"). Affects button/meta labels only. */
  locale?: "bg" | "en";
  /** Override the line under "A¹". Default "motor park". */
  brandLine?: string;
  /** Override the meta line at top of preloader. */
  metaLine?: string;
  /**
   * @deprecated — no longer used. The video is now device-scoped via
   * localStorage (plays once ever), and the preloader replays on every
   * route change regardless of environment.
   */
  showOncePerSession?: boolean;
  /** Force-advance if video hasn't emitted `ended` by this ms. Default 6500. */
  videoTimeoutMs?: number;
  /**
   * Cinematic first-visit preloader duration. Longer so the track draw +
   * chase lights can actually play out. Default 4200.
   */
  preloaderTimeoutMs?: number;
  /**
   * Route-transition preloader duration. Kept short so clicking through
   * the menu feels snappy, not gated. Default 1100.
   */
  routeChangePreloaderMs?: number;
}

const LABELS = {
  bg: {
    skip: "ПРОПУСНИ",
    enter: "ВЛЕЗ В ПИСТАТА",
    loading: "ЗАРЕЖДА",
    meta: "◆ 3910M · 15 ЗАВОЯ · FIA GRADE 3 · САМОКОВ ◆",
    corner_bl: "САМОКОВ · BG",
    corner_br: "FIA G3 · 3910M · 15T",
    brand_mark: "A1 MOTOR PARK",
  },
  en: {
    skip: "SKIP",
    enter: "ENTER CIRCUIT",
    loading: "LOADING",
    meta: "◆ 3910M · 15 CORNERS · FIA GRADE 3 · SAMOKOV ◆",
    corner_bl: "SAMOKOV · BG",
    corner_br: "FIA G3 · 3910M · 15T",
    brand_mark: "A1 MOTOR PARK",
  },
} as const;

export default function IntroSequence({
  videoSrc = "/loading/intro.mp4",
  videoSrcWebm,
  poster = "/loading/intro-poster.jpg",
  locale = "bg",
  brandLine = "motor park",
  metaLine,
  videoTimeoutMs = 6500,
  preloaderTimeoutMs = 2000,
  routeChangePreloaderMs = 2000,
}: Props) {
  // Initial state is "preloader" (not "hidden") so the server-rendered
  // HTML already carries the overlay — no white flash of the page
  // content while React hydrates on first visit. The useEffect below
  // immediately flips to "hidden" for skipIntro / revisit cases.
  const [phase, setPhase] = useState<Phase>("preloader");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);
  const hardKillTimerRef = useRef<number | null>(null);
  const videoReadyRef = useRef(false);
  const isFirstRunRef = useRef(true);
  // Whether the Porsche video should play between preloader and reveal on
  // this particular mount. Decided once when the useEffect fires for the
  // initial pathname, then consumed.
  const shouldPlayVideoRef = useRef(false);
  // Whether the video element should exist in the DOM at all for this
  // mount. Mirrors shouldPlayVideoRef but is STATE so a re-render happens
  // when it changes, so React mounts/unmounts the <video> element.
  const [renderVideoEl, setRenderVideoEl] = useState(false);
  // Track scale adapts to viewport so the shape never overflows on
  // small screens. Re-computed on mount + resize.
  const [trackScale, setTrackScale] = useState(0.7);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Budget used for the capped MM:SS:CS readout + the self-heal timer.
  const mountedMs =
    phase === "hidden" || phase === "revealing"
      ? 0
      : (phase === "video" ? videoTimeoutMs : 0) + preloaderTimeoutMs + 1150;

  // Only the aria-label still uses the locale labels — the rest of the
  // chrome (ticker, meta, corner text, skip button) has been removed
  // for a cleaner intro per user request.
  const L = LABELS[locale] ?? LABELS.bg;

  // Trigger: initial visit + every route change.
  //
  // Flow:
  //   FIRST VISIT, video unseen, motion allowed:
  //     preloader (1.2 s) → video (≤6.5 s) → revealing (1.3 s) → hidden
  //   SUBSEQUENT or video-seen or reduced-motion:
  //     preloader (0.7 s on route change / 1.2 s first-run) → revealing → hidden
  //
  // The preloader ALWAYS runs first — the A1 logo + track read on a clean
  // black stage, then the video crossfades in, then the whole overlay
  // zooms out to reveal the page.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (searchParams?.get("skipIntro") === "1") {
      setPhase("hidden");
      setRenderVideoEl(false);
      // Consume the first-run flag so subsequent nav uses the snappy
      // route-change preloader, not the cinematic one.
      isFirstRunRef.current = false;
      return;
    }

    const forceVideo = searchParams?.get("forceVideo") === "1";
    const videoSeen =
      !forceVideo && window.sessionStorage.getItem(VIDEO_KEY) === "1";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const willShowVideo =
      isFirstRunRef.current && !videoSeen && !reducedMotion;
    shouldPlayVideoRef.current = willShowVideo;
    setRenderVideoEl(willShowVideo);

    // Every entry point begins with the preloader: arrows traceing 2
    // laps of the track while the outline draws in. First-visit will
    // then hand off to the Porsche video; subsequent routes go
    // straight from preloader to the red reveal.
    setPhase("preloader");
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [pathname, searchParams]);

  // Pick the preloader duration based on whether this is the very first
  // visit (cinematic) or a subsequent route change (snappy). On first
  // visit with video, the preloader holds for preloaderTimeoutMs before
  // crossfading into the Porsche clip.
  const currentPreloaderMs = isFirstRunRef.current
    ? preloaderTimeoutMs
    : routeChangePreloaderMs;

  // Phase-driven auto-advance.
  //
  // FIRST VISIT with video: the preloader is only a "waiting on the
  // Porsche video" indicator — we poll for readiness every 50 ms and
  // advance the instant the video can play. If it's already cached,
  // that happens on the very next tick, so the user effectively sees
  // the video immediately. Only when the video is actually buffering
  // does the preloader stay on screen.
  //
  // ROUTE CHANGE: full cinematic preloader for currentPreloaderMs
  // so the arrow has time to lap the track.
  useEffect(() => {
    if (phase === "hidden") return;
    if (phase === "preloader") {
      if (shouldPlayVideoRef.current) {
        // Short first tick — React needs a beat to mount the <video>.
        phaseTimerRef.current = window.setTimeout(advancePastPreloader, 50);
      } else if (currentPreloaderMs > 0) {
        phaseTimerRef.current = window.setTimeout(
          advancePastPreloader,
          currentPreloaderMs,
        );
      }
    } else if (phase === "video") {
      phaseTimerRef.current = window.setTimeout(finishVideo, videoTimeoutMs);
    }
    return () => {
      if (phaseTimerRef.current) {
        window.clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentPreloaderMs]);

  // Self-heal: force dismiss past the total budget regardless of state.
  useEffect(() => {
    if (phase === "hidden" || phase === "revealing") return;
    hardKillTimerRef.current = window.setTimeout(() => dismiss(), mountedMs + 250);
    return () => {
      if (hardKillTimerRef.current) {
        window.clearTimeout(hardKillTimerRef.current);
        hardKillTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mountedMs]);

  // ESC = skip forward.
  useEffect(() => {
    if (phase === "hidden") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (phase === "preloader") advancePastPreloader();
      else if (phase === "video") finishVideo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  // Unmount cleanup.
  useEffect(
    () => () => {
      if (unmountTimerRef.current) window.clearTimeout(unmountTimerRef.current);
      if (phaseTimerRef.current) window.clearTimeout(phaseTimerRef.current);
      if (hardKillTimerRef.current) window.clearTimeout(hardKillTimerRef.current);
      document.documentElement.style.overflow = "";
    },
    []
  );

  // Responsive track scale — smaller on mobile so the shape fits the
  // narrow viewport, growing up to full size on large screens.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setTrackScale(0.5);
      else if (w < 768) setTrackScale(0.62);
      else if (w < 1024) setTrackScale(0.72);
      else setTrackScale(0.82);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Called when the preloader's hold-beat has elapsed, or immediately
  // after mount on first visit. If the video isn't buffered yet, keep
  // polling (every 100 ms, up to ~5 s) so the preloader remains on
  // screen as a "loading" indicator. The moment the video fires
  // canplay, `onCanPlay` also nudges us forward (see <video>).
  const advancePastPreloader = (waited = 0) => {
    if (phaseTimerRef.current) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    if (shouldPlayVideoRef.current) {
      const ready = videoReadyRef.current;
      if (!ready && waited < 5000) {
        // Keep the preloader (arrows looping) on screen as a loading
        // indicator while the Porsche clip buffers.
        phaseTimerRef.current = window.setTimeout(
          () => advancePastPreloader(waited + 100),
          100,
        );
        return;
      }
      shouldPlayVideoRef.current = false;
      setPhase("video");
    } else {
      dismiss();
    }
  };

  // Called when the Porsche video ends (onEnded / onError / timeout).
  const finishVideo = () => {
    if (phaseTimerRef.current) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    try {
      videoRef.current?.pause();
    } catch {}
    try {
      window.sessionStorage.setItem(VIDEO_KEY, "1");
    } catch {}
    dismiss();
  };

  const dismiss = () => {
    if (phase === "revealing" || phase === "hidden") return;
    if (phaseTimerRef.current) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    setPhase("revealing");
    document.documentElement.style.overflow = "";
    // Mark video seen defensively if we dismiss during the video phase.
    try {
      window.sessionStorage.setItem(VIDEO_KEY, "1");
    } catch {}
    // Give the zoom-reveal (1100 ms) + a small safety margin before we
    // unmount the overlay.
    unmountTimerRef.current = window.setTimeout(() => {
      setPhase("hidden");
      isFirstRunRef.current = false;
      // Signal any deferred components (e.g. the 3D hero iframe) to hydrate.
      try {
        (window as unknown as { __a1Ready?: boolean }).__a1Ready = true;
        window.dispatchEvent(new CustomEvent("a1-ready"));
      } catch {}
      // Move focus to the primary landmark so keyboard/AT users have an
      // anchor after the overlay unmounts.
      const target =
        document.querySelector<HTMLElement>("main h1, main [tabindex], main") ??
        document.body;
      target?.focus?.({ preventScroll: true });
    }, 1150);
  };

  if (phase === "hidden") return null;

  const isVideo = phase === "video";
  const isPreloader = phase === "preloader";
  const isRevealing = phase === "revealing";

  return (
    <>
      <style>{css}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={L.brand_mark}
        className={[
          "a1mp-pl",
          isVideo ? "phase-video" : "",
          isPreloader ? "phase-preloader" : "",
          isRevealing ? "phase-revealing" : "",
          isFirstRunRef.current ? "is-first-run" : "is-subsequent",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Video element is mounted during the preloader phase too, so its
            data is already being fetched while the logo + track read — by
            the time phase=video the bytes are ready and the crossfade is
            instant. CSS gates its visibility per phase. */}
        {renderVideoEl && (
          <div className="a1mp-pl-video-wrap">
            <video
              ref={videoRef}
              className="a1mp-pl-video"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster={poster}
              onEnded={finishVideo}
              onError={finishVideo}
              onCanPlay={() => {
                videoReadyRef.current = true;
                // If the preloader is still waiting, jump forward right
                // now instead of waiting for the next poll tick.
                if (shouldPlayVideoRef.current && phase === "preloader") {
                  advancePastPreloader();
                }
              }}
              onCanPlayThrough={() => {
                videoReadyRef.current = true;
                if (shouldPlayVideoRef.current && phase === "preloader") {
                  advancePastPreloader();
                }
              }}
            >
              {videoSrcWebm && <source src={videoSrcWebm} type="video/webm" />}
              <source src={videoSrc} type="video/mp4" />
            </video>
            <div className="a1mp-pl-video-vignette" />
          </div>
        )}

        {/* Full-viewport SVG that carries BOTH the red sheet (with a
            track-shaped hole) AND the visible thin white outline +
            chase dots — all in the same coordinate system so they're
            aligned by construction. viewBox is a 1920×1080 stage with
            `slice` so the SVG always fills the viewport on every
            aspect ratio. The mask's white rect fills the full stage,
            so the red covers ALL of it; a translated + rotated +
            scaled copy of the track path cuts the hole. */}
        <svg
          className="a1mp-pl-svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="A1 Motor Park circuit"
        >
          <defs>
            <path id="a1mp-track" d={trackPath} fill="none" pathLength={100} />

            <mask id="a1mp-holeMask" maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="1920" height="1080" fill="white" />
              {/* Centre the track in the viewBox + scale it small:
                  1. rotate(90 cx cy) — horizontal orientation
                  2. translate(-cx -cy) — move track centre to origin
                  3. scale(0.3) — shrink
                  4. translate(960 540) — move origin to viewBox centre */}
              <g transform={`translate(960 540) scale(${trackScale}) translate(${-TRACK_CX} ${-TRACK_CY}) rotate(90 ${TRACK_CX} ${TRACK_CY})`}>
                {/* FILL punches out the whole interior of the track
                    loop — the big transparent window. Tiny stroke
                    just smooths the edge. The white outline (below)
                    is centred on the path so half sits on the red and
                    half on the hole — a clean white border. */}
                <path
                  d={trackPath}
                  fill="black"
                  fillRule="nonzero"
                  stroke="black"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            </mask>
          </defs>

          {/* Red sheet — fills the entire 1920×1080 stage, hole comes
              from the mask. Opacity 0 during preloader/video, fades to
              1 on revealing. */}
          <rect
            className="a1mp-pl-overlay"
            x="0" y="0" width="1920" height="1080"
            fill="var(--brand, #c8102e)"
            mask="url(#a1mp-holeMask)"
          />

          {/* Outline + chase — EXACT same transforms as the hole so
              they're perfectly aligned with the red edge. */}
          <g transform={`translate(960 540) scale(${trackScale}) translate(${-TRACK_CX} ${-TRACK_CY}) rotate(90 ${TRACK_CX} ${TRACK_CY})`}>
            <g className="a1mp-pl-visible">
              <use href="#a1mp-track" className="a1mp-pl-track-outer" />
              <use href="#a1mp-track" className="a1mp-pl-track-inner" />

              {/* White arrow with narrow red outline, tracing the
                  racing line. We drive the motion via CSS
                  `offset-path` + an `@keyframes` lap (see styles
                  below) instead of SMIL <animateMotion>. CSS motion
                  is composited and reliably restarts on remount,
                  while SMIL kept its document-timeline state across
                  Next route changes (IntroSequence lives in the
                  layout, so React reuses the DOM node) and stalled
                  the arrow on subsequent navigations.
                  `key={pathname}` is still here as a belt-and-
                  braces measure: it forces a fresh element + a fresh
                  CSS animation on every route change. */}
              <g
                key={pathname}
                className="a1mp-pl-arrow a1mp-pl-arrow-1"
                style={{ offsetPath: `path("${trackPath}")` }}
              >
                <polygon
                  points="-22,-14 22,0 -22,14 -14,0"
                  fill="#ffffff"
                  stroke="#c8102e"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
              </g>
            </g>
          </g>
        </svg>

        {/* Logo in its own absolute layer on top of the SVG so it's
            never covered by the red sheet. Positioned slightly above
            optical centre via padding-bottom on the stack. */}
        <div className="a1mp-pl-stack">
          <div className="a1mp-pl-logo">
            <Image
              src="/brand/a1-motor-park-logo.png"
              alt="A1 Motor Park"
              width={1000}
              height={252}
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
}

const css = `
.a1mp-pl {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: auto;
  font-family: var(--font-mono), ui-monospace, monospace;
  background: #000;
  color: var(--ink, #f2ede4);
  transform-origin: 50% 50%;
  will-change: opacity, transform;
  /* Force GPU layer + isolate paint so each frame only repaints this
     element. Critical for smooth high-scale zoom — without the
     contain property the browser tries to repaint ancestors too,
     which causes dropped frames. */
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  contain: layout style paint;
}
/* Preloader + video phases: deep black behind everything. The white
   track outline + logo sit on top; the video crossfades in over the
   black for the first-visit cinematic. */
.a1mp-pl.phase-preloader,
.a1mp-pl.phase-video {
  background: #000;
}
/* Reveal: overlay background goes transparent. The red surround now
   comes exclusively from the art SVG's <rect>, which has a track-shaped
   hole. The whole overlay (red + hole + outline + logo) scales past the
   viewport and fades — the hole grows until *it* is the viewport, and
   the page underneath is revealed through the shape of the track. */
.a1mp-pl.phase-revealing {
  pointer-events: none;
  background: transparent;
  /* Cinematic camera-pull. ease-in-out-cubic builds speed gradually
     through the middle and decelerates at the end — matches the
     Lando-style "feel you're being pulled into the page" rather than
     an instant punch. Only 2 keyframes so CSS interpolates every
     in-between frame at 60 fps with no stepping. */
  animation: a1mp-zoom-reveal 1100ms cubic-bezier(0.65, 0, 0.3, 1) forwards;
}
@keyframes a1mp-zoom-reveal {
  0%   { opacity: 1; transform: translate3d(0, 0, 0) scale(1);  }
  100% { opacity: 0; transform: translate3d(0, 0, 0) scale(12); }
}
@media (prefers-reduced-motion: reduce) {
  .a1mp-pl.phase-revealing {
    animation: a1mp-reveal-fade 420ms ease-out forwards;
  }
  @keyframes a1mp-reveal-fade {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
}

.a1mp-pl-video-wrap {
  position: absolute; inset: 0;
  opacity: 1;
  transition: opacity 0.6s ease-out;
}
.a1mp-pl.phase-preloader .a1mp-pl-video-wrap,
.a1mp-pl.phase-revealing .a1mp-pl-video-wrap {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transition: opacity 0.3s ease-out, visibility 0s linear 0.3s;
}
.a1mp-pl-video {
  width: 100%; height: 100%;
  object-fit: cover;
  /* Desktop: centre the frame. */
  object-position: 50% 50%;
  background: #000;
  display: block;
}
/* Mobile: the Porsche clip is landscape, so cover-crop would hide the
   subject on narrow viewports. Shift the focal point to the right so
   the driver's exit from the car stays in frame. */
@media (max-width: 767px) {
  .a1mp-pl-video {
    object-position: 65% 50%;
  }
}
.a1mp-pl-video-vignette {
  position: absolute; inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%),
    linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.6) 100%);
}
.a1mp-pl-skip {
  position: absolute;
  right: 2rem; bottom: 2rem;
  font: inherit;
  font-size: 0.65rem;
  letter-spacing: 0.35em;
  color: var(--ink, #f2ede4);
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(242, 237, 228, 0.25);
  backdrop-filter: blur(10px);
  padding: 0.8rem 1.4rem;
  cursor: pointer;
  text-transform: uppercase;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  z-index: 3;
}
.a1mp-pl-skip:hover {
  border-color: var(--brand, #c8102e);
  color: var(--brand, #c8102e);
}

/* Full-viewport SVG. preserveAspectRatio="xMidYMid slice" in the JSX
   means the viewBox always covers the viewport on every aspect ratio,
   so the red <rect> inside naturally fills the screen — no overflow
   tricks needed. */
.a1mp-pl-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  transition: opacity 0.5s ease-out;
  will-change: opacity;
  z-index: 2;
}
.a1mp-pl.phase-video .a1mp-pl-svg,
.a1mp-pl.phase-preloader .a1mp-pl-svg,
.a1mp-pl.phase-revealing .a1mp-pl-svg {
  opacity: 1;
}

/* Logo sits in its own layer ABOVE the red sheet, pinned near the top
   of the viewport so it never overlaps the big track window in the
   middle — and so the zoom-reveal doesn't crop through it. */
.a1mp-pl-stack {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: clamp(4vh, 7vh, 9vh);
  pointer-events: none;
  z-index: 4;
}

/* Visible group (outline + chase) stays visible through the reveal so
   the outline continues to read on the red — it's the GIF's signature. */
.a1mp-pl-visible {
  transform-origin: 440.5px 268px;
}

/* Not used for the mask-scale-reveal any more — whole overlay zooms. */
.a1mp-pl-hole {
  transform: scale(1);
}

/* The overlay rect IS the red sheet. It's invisible during preloader
   + video (so the black bg shows through) and fades in at the start of
   revealing. The track-shaped mask applied to this rect creates the
   transparent hole in the middle. Huge negative x/y + oversized w/h
   guarantee the red extends off-viewport at every zoom scale. */
.a1mp-pl-overlay {
  opacity: 0;
  transition: opacity 220ms ease-out;
}
.a1mp-pl.phase-revealing .a1mp-pl-overlay {
  opacity: 1;
}

.a1mp-pl-track-outer,
.a1mp-pl-track-inner {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  /* Default: fully drawn. The first-run cinematic undoes this and
     plays the draw-in animation. Subsequent route-change preloaders
     render the outline as already drawn — continuous. */
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
}
.a1mp-pl.is-first-run.phase-video .a1mp-pl-track-outer,
.a1mp-pl.is-first-run.phase-preloader .a1mp-pl-track-outer {
  stroke-dashoffset: 100;
  animation: a1mp-draw 1.4s cubic-bezier(0.65, 0, 0.35, 1) 0.3s forwards;
}
.a1mp-pl.is-first-run.phase-video .a1mp-pl-track-inner,
.a1mp-pl.is-first-run.phase-preloader .a1mp-pl-track-inner {
  stroke-dashoffset: 100;
  animation: a1mp-draw 1.4s cubic-bezier(0.65, 0, 0.35, 1) 0.5s forwards;
}
/* Crisp white outline bordering the big transparent window. 7 CSS px
   non-scaling-stroke reads clearly against the red edge at any zoom
   level. No drop-shadow filter — SVG filters are re-rasterised every
   animation frame, which causes visible stepping at high scales
   during the reveal. Clean stroke only. */
.a1mp-pl-track-outer {
  stroke: #ffffff;
  stroke-width: 7;
  opacity: 1;
  vector-effect: non-scaling-stroke;
}
/* Inner stroke is hidden — the thin single white line reads cleaner
   on both the black preloader bg and the red reveal bg. */
.a1mp-pl-track-inner { stroke: transparent; stroke-width: 0; vector-effect: non-scaling-stroke; }
@keyframes a1mp-draw { to { stroke-dashoffset: 0; } }

/* Chase arrow — white triangle with narrow red outline that follows
   the racing line via CSS offset-path (set inline on the element)
   plus offset-distance keyframes. The path itself is supplied per
   instance through inline style so React owns the geometry; the
   animation timing + auto-rotation live here.
   Composited motion is far more reliable than SMIL across route
   changes — SMIL kept the SVG document timeline state and stalled
   on second visits. */
.a1mp-pl-arrow {
  opacity: 0;
  transition: opacity 0.18s ease-out;
  offset-rotate: auto;
  offset-distance: 0%;
  animation: a1mp-trace 3.2s linear infinite;
}
.a1mp-pl.phase-video .a1mp-pl-arrow,
.a1mp-pl.phase-preloader .a1mp-pl-arrow {
  opacity: 1;
}
.a1mp-pl.phase-revealing .a1mp-pl-arrow { opacity: 0; }
@keyframes a1mp-fade { to { opacity: 1; } }
@keyframes a1mp-run  { to { stroke-dashoffset: -100; } }
@keyframes a1mp-trace {
  from { offset-distance: 0%; }
  to   { offset-distance: 100%; }
}

.a1mp-pl-logo {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
  filter: drop-shadow(0 4px 18px rgba(0,0,0,0.75));
  transition:
    opacity 0.7s cubic-bezier(0.22, 0.8, 0.3, 1),
    transform 0.9s cubic-bezier(0.22, 0.8, 0.3, 1);
  will-change: opacity, transform;
  pointer-events: none;
}
.a1mp-pl-logo img { width: auto; height: clamp(52px, 9vh, 88px); display: block; }
@media (min-width: 1024px) {
  .a1mp-pl-logo img { height: clamp(120px, 16vh, 180px); }
}
@media (min-width: 1440px) {
  .a1mp-pl-logo img { height: clamp(150px, 18vh, 210px); }
}
.a1mp-pl.phase-video .a1mp-pl-logo,
.a1mp-pl.phase-preloader .a1mp-pl-logo {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition-delay: 0.1s, 0.1s;
}
/* Logo stays visible through the zoom — it's part of the same element
   that scales, so no separate opacity animation is needed. */
.a1mp-pl.phase-revealing .a1mp-pl-logo {
  opacity: 1;
  transform: translateY(0) scale(1);
}
@keyframes a1mp-text-in { to { opacity: 1; } }

@keyframes a1mp-prompt { to { opacity: 1; } }

.a1mp-pl-ticker,
.a1mp-pl-brand-mark,
.a1mp-pl-corner {
  position: absolute;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  z-index: 3;
  opacity: 0;
  animation: a1mp-prompt 0.5s ease-out 0.3s forwards;
}
.a1mp-pl-ticker     { top: 2rem; left: 2rem; color: var(--brand, #c8102e); }
.a1mp-pl-brand-mark { top: 2rem; right: 2rem; color: rgba(242,237,228,0.5); text-align: right; }
.a1mp-pl-corner     { font-size: 0.55rem; color: rgba(242,237,228,0.35); }
.a1mp-pl-corner-bl  { bottom: 2rem; left: 2rem; }
.a1mp-pl-corner-br  { bottom: 2rem; right: 2rem; }
.a1mp-pl.phase-revealing .a1mp-pl-ticker,
.a1mp-pl.phase-revealing .a1mp-pl-brand-mark,
.a1mp-pl.phase-revealing .a1mp-pl-corner {
  opacity: 0; transition: opacity 0.2s;
}

.a1mp-pl.phase-video .a1mp-pl-ticker { color: rgba(242,237,228,0.75); }

@media (prefers-reduced-motion: reduce) {
  .a1mp-pl-track-outer,
  .a1mp-pl-track-inner { stroke-dashoffset: 0 !important; animation: none !important; }
  .a1mp-pl-chase,
  .a1mp-pl-arrow { opacity: 1 !important; animation: none !important; offset-distance: 50% !important; }
  .a1mp-pl-logo { opacity: 1 !important; transform: translate(-50%, -50%) scale(1) !important; transition: none !important; }
  .a1mp-pl-ticker,
  .a1mp-pl-brand-mark,
  .a1mp-pl-corner { opacity: 1 !important; animation: none !important; }
}
`;
