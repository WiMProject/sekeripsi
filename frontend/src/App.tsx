/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import ProcessPage from "./pages/ProcessPage";
import TutorialPage from "./pages/TutorialPage";
import ClassifyPage from "./pages/ClassifyPage";
import HistoryPage from "./pages/HistoryPage";

function AppContent() {
  return (
    <div className="min-h-screen bg-[#030712] bg-dot-pattern relative">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/classify" element={<ClassifyPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppContent />
        <Toaster position="top-right" expand={true} richColors />
      </TooltipProvider>
    </BrowserRouter>
  );
}
