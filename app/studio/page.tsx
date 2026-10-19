import type { Metadata } from "next";
import { StudioClient } from "./studio-client";

export const metadata: Metadata = {
  title: "Studio",
  description: "Turn speech and rough notes into clear, useful writing.",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <StudioClient />;
}
