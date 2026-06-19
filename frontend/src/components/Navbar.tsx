import { Activity, Home, Sparkles, GitBranch, BookOpen, Scan, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { FloatingNav } from "@/components/ui/floating-navbar";

const navItems = [
  { name: "Beranda", link: "/", icon: <Home className="w-4 h-4" /> },
  { name: "Fitur", link: "/features", icon: <Sparkles className="w-4 h-4" /> },
  { name: "Proses", link: "/process", icon: <GitBranch className="w-4 h-4" /> },
  { name: "Tutorial", link: "/tutorial", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Klasifikasi", link: "/classify", icon: <Scan className="w-4 h-4" /> },
  { name: "Histori", link: "/history", icon: <Clock className="w-4 h-4" /> },
];

export default function Navbar() {
  return (
    <FloatingNav
      navItems={navItems}
      logo={
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-black tracking-tight text-white hidden md:block">
            Lung<span className="gradient-text">-AI</span>
          </span>
        </Link>
      }
      ctaButton={{
        label: "Klasifikasi",
        link: "/classify",
      }}
    />
  );
}
