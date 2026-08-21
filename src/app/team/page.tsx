import type { Metadata } from "next";
import PacesProductApp from "@/components/paces-app/PacesProductApp";

export const metadata: Metadata = { title: "Team | Paces" };

export default function TeamPage() {
  return <PacesProductApp view="team" />;
}
