import type { Metadata } from "next";
import PacesProductApp from "@/components/paces-app/PacesProductApp";

export const metadata: Metadata = { title: "Settings | Paces" };

export default function AccountSettingsPage() {
  return <PacesProductApp view="settings" />;
}
