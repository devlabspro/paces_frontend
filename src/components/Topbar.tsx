import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useLogin } from "@/context/LoginContext";

interface NavigationItem {
  text: string;
  link: string;
}

interface TopbarProps {
  navigationItems?: NavigationItem[];
}

export default function Topbar({ navigationItems = [] }: TopbarProps) {
  const { username } = useLogin();

  return (
    <header className="bg-white p-4 flex items-center justify-between border-b border-[#e5e7eb]">
      <div className="flex items-center gap-8">
        <div className="text-black font-bold text-2xl">
          <Image
            src="/hamminglogo.png"
            alt="Hamming Logo"
            width={32}
            height={32}
          />
        </div>
        <nav className="flex items-center gap-6 text-gray-700">
          {navigationItems.map((item, index) => (
            <div key={index} className="flex items-center gap-6">
              {index > 0 && <span className="text-gray-400">•</span>}
              <a href={item.link} className="hover:text-black">
                {item.text}
              </a>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-black mr-2">{username}</div>
        <Avatar className="h-8 w-8 border-2 border-gray-300">
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
