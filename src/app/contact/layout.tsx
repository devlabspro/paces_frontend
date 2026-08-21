import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get in Touch | Paces",
  description: "Talk with Paces about accelerating energy infrastructure development.",
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
