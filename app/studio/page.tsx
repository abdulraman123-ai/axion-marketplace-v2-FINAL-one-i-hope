import type { Metadata } from "next";
import { StudioClient } from "./studio-client";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Build a focused service offer, organize prospects, draft personalized outreach, and track next actions with ClientLaunch.",
};

export default function StudioPage() {
  return <StudioClient />;
}
