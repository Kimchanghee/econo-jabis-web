import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageContext, useLanguageState } from "./hooks/useLanguage";
import Index from "./pages/Index";
import ArticleDetail from "./pages/ArticleDetail";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const state = useLanguageState();
  return (
    <LanguageContext.Provider value={state}>
      {children}
    </LanguageContext.Provider>
  );
};

const App = () => (
  <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </LanguageProvider>
);

export default App;