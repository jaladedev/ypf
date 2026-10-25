import { ImageResponse } from "next/og";

export const alt = "Young Planners Forum, Nigerian Institute of Town Planners";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0b3d2a 0%, #14633f 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 4, opacity: 0.8 }}>
          NIGERIAN INSTITUTE OF TOWN PLANNERS
        </div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          Young Planners Forum
        </div>
        <div style={{ fontSize: 34, marginTop: 28, opacity: 0.9 }}>
          Building sustainable cities, together.
        </div>
      </div>
    ),
    size,
  );
}
