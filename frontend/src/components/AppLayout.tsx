/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, History, User, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AppLayout({ children, activeTab, setActiveTab }: LayoutProps) {
  const user = {
    displayName: "Dr. Wildan Miladji",
    email: "wildan.miladji@sanggabuana.ac.id",
    photoURL: null
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#030712] relative overflow-hidden bg-dot-pattern">
        {/* Animated Background Accents */}
        <motion.div 
          animate={{ 
            opacity: [0.03, 0.06, 0.03] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500 blur-[80px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
        ></motion.div>
        <motion.div 
          animate={{ 
            opacity: [0.03, 0.05, 0.03] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-500 blur-[100px] rounded-full pointer-events-none transform-gpu will-change-[opacity]"
        ></motion.div>
        <motion.div 
          animate={{ 
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none"
        ></motion.div>

        <Sidebar className="border-r border-white/5 bg-black/40 backdrop-blur-xl">
          <SidebarHeader className="p-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">Lung-AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">
                Main Menu
              </SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeTab === "diagnosis"} 
                    onClick={() => setActiveTab("diagnosis")}
                    className={`flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-300 ${
                      activeTab === "diagnosis" 
                        ? "bg-white/10 text-white shadow-lg" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <LayoutDashboard className={`w-5 h-5 ${activeTab === "diagnosis" ? "text-blue-400" : ""}`} />
                    <span className="font-bold tracking-tight">Classification</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeTab === "history"} 
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-300 ${
                      activeTab === "history" 
                        ? "bg-white/10 text-white shadow-lg" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <History className={`w-5 h-5 ${activeTab === "history" ? "text-purple-400" : ""}`} />
                    <span className="font-bold tracking-tight">History</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeTab === "profile"} 
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-300 ${
                      activeTab === "profile" 
                        ? "bg-white/10 text-white shadow-lg" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <User className={`w-5 h-5 ${activeTab === "profile" ? "text-emerald-400" : ""}`} />
                    <span className="font-bold tracking-tight">Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto px-4 pb-8 space-y-4">
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen overflow-hidden z-10">
          <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden text-white" />
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight leading-none uppercase">
                  {activeTab === "diagnosis" && "Classification_Center"}
                  {activeTab === "history" && "Classification_History"}
                  {activeTab === "profile" && "Account_Settings"}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block space-y-0.5">
                <p className="text-sm font-bold text-white leading-none">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 font-mono italic tracking-tighter">{user?.email}</p>
              </div>
              <Avatar className="h-10 w-10 ring-2 ring-white/5 ring-offset-2 ring-offset-[#030712] transition-transform hover:scale-105 cursor-pointer">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="bg-white/10 text-white border border-white/10 font-bold">
                  {user?.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 lg:p-10">
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
