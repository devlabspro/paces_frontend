import type { Metadata } from "next";
import PacesProductApp from "@/components/paces-app/PacesProductApp";

export const metadata: Metadata = { title: "Projects | Paces" };

export default function ProjectsPage() {
  return <PacesProductApp view="projects" />;
}
