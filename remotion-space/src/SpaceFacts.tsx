import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Audio,
  staticFile,
  spring,
} from "remotion";
import React from "react";

interface SpaceFactsProps {
  hook: string;
  body: string;
  cta: string;
  title: string;
  audioUrl?: string;
}

export const SpaceFacts: React.FC<SpaceFactsProps> = ({
  hook,
  body,
  cta,
  title,
  audioUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timing
  const hookStart = 0;
  const hookEnd = fps * 4; // 0-4s
  const bodyStart = fps * 4;
  const bodyEnd = fps * 52; // 4-52s
  const ctaStart = fps * 52;
  const ctaEnd = durationInFrames; // 52-60s

  // Hook animation
  const hookOpacity = interpolate(
    frame,
    [hookStart, hookStart + 15, hookEnd - 10, hookEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const hookScale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 12, stiffness: 100 },
  });

  // Body animation
  const bodyOpacity = interpolate(
    frame,
    [bodyStart, bodyStart + 15, bodyEnd - 10, bodyEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // CTA animation
  const ctaOpacity = interpolate(
    frame,
    [ctaStart, ctaStart + 15, ctaEnd],
    [0, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulsing glow
  const glow = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.4, 0.9]
  );

  // Star twinkle
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: ((i * 137.5) % 100),
    y: ((i * 97.3) % 100),
    size: (i % 3) + 1,
    opacity: interpolate(
      Math.sin((frame / fps + i * 0.3) * Math.PI),
      [-1, 1],
      [0.2, 0.9]
    ),
  }));

  // Scroll body text
  const bodyLines = body.match(/.{1,35}(\s|$)/g) || [body];
  const lineHeight = 52;
  const totalBodyHeight = bodyLines.length * lineHeight;
  const maxScroll = Math.max(0, totalBodyHeight - 600);
  const scrollY = interpolate(
    frame,
    [bodyStart + 30, bodyEnd - 20],
    [0, -maxScroll],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) }
  );

  const showHook = frame >= hookStart && frame < hookEnd;
  const showBody = frame >= bodyStart && frame < bodyEnd;
  const showCta = frame >= ctaStart;

  return (
    <AbsoluteFill style={{ background: "#000814", fontFamily: "sans-serif" }}>

      {/* Starfield */}
      <AbsoluteFill>
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              background: "#fff",
              opacity: star.opacity,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Nebula glow background */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 30% 40%, rgba(99,0,255,${glow * 0.3}) 0%, transparent 60%),
                     radial-gradient(ellipse at 70% 60%, rgba(0,150,255,${glow * 0.2}) 0%, transparent 50%)`,
      }} />

      {/* Top brand bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        padding: "32px 40px 20px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: "50%",
          background: "#63b4ff",
          boxShadow: "0 0 12px #63b4ff",
        }} />
        <span style={{
          color: "#63b4ff",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}>
          Dr. Cosmos
        </span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 22, marginLeft: 8 }}>
          Space Facts
        </span>
      </div>

      {/* HOOK */}
      {showHook && (
        <AbsoluteFill style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
          opacity: hookOpacity,
          transform: `scale(${hookScale})`,
        }}>
          <div style={{
            background: "rgba(99,0,255,0.15)",
            border: "2px solid rgba(99,180,255,0.5)",
            borderRadius: 24,
            padding: "48px 56px",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 22,
              color: "#63b4ff",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}>
              DID YOU KNOW?
            </div>
            <div style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.2,
              textShadow: "0 0 40px rgba(99,180,255,0.6)",
            }}>
              {hook}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* BODY */}
      {showBody && (
        <AbsoluteFill style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "120px 60px 160px",
          opacity: bodyOpacity,
          overflow: "hidden",
        }}>
          <div style={{ transform: `translateY(${scrollY}px)` }}>
            {bodyLines.map((line, i) => {
              const lineOpacity = interpolate(
                frame,
                [bodyStart + i * 8, bodyStart + i * 8 + 20],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div key={i} style={{
                  fontSize: 46,
                  color: "#ffffff",
                  lineHeight: 1.4,
                  marginBottom: 8,
                  opacity: lineOpacity,
                  fontWeight: 500,
                  textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                }}>
                  {line}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* CTA */}
      {showCta && (
        <AbsoluteFill style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 32,
          opacity: ctaOpacity,
          padding: "0 60px",
        }}>
          <div style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
          }}>
            {cta}
          </div>
          <div style={{
            background: "rgba(99,180,255,0.2)",
            border: "2px solid #63b4ff",
            borderRadius: 60,
            padding: "20px 48px",
            color: "#63b4ff",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}>
            FOLLOW FOR MORE 🚀
          </div>
        </AbsoluteFill>
      )}

      {/* Bottom gradient */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 160,
        background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
      }} />

      {/* Audio */}
      {audioUrl && <Audio src={audioUrl} />}
    </AbsoluteFill>
  );
};
