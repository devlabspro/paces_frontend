import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLogin } from "@/context/LoginContext";
import { LucideIcon, LayoutDashboard, BookText } from "lucide-react";

const SIDEBAR_WIDTH = 256; // 64 * 4 = 256px (w-64)

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems?: NavItem[];
}

export default function Sidebar({ navItems = [] }: SidebarProps) {
  const { username, logout, isSubaccount } = useLogin();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path
      ? "border border-[#d1d5db] rounded-lg text-black"
      : "hover:bg-[#f9fafb]";
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="w-48 bg-white flex flex-col py-6 h-[calc(100vh-64px)]">
      {/* Map through navItems directly instead of defaultNavItems */}
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`flex items-center gap-3 px-4 py-2 mb-2 text-black ${isActive(
            item.path
          )}`}
          title={item.name}
        >
          {item.icon}
          <span>{item.name}</span>
        </Link>
      ))}

      {/* Add a spacer to push the logout button to the bottom */}
      <div className="flex-grow"></div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 mt-auto text-black hover:bg-[#f9fafb]"
        title="Logout"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 17L21 12L16 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Logout</span>
      </button>
    </aside>
  );
}

export { SIDEBAR_WIDTH };
