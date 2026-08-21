import type { Metadata } from "next";
import PacesProductApp from "@/components/paces-app/PacesProductApp";

export const metadata: Metadata = { title: "Paces Agent | Paces" };

export default function AgentPage() {
  return <PacesProductApp view="agent" />;
}
