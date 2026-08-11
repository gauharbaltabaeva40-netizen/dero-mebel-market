import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ChatProvider } from "./components/AiChatWidget";
import SiteLayout from "./components/SiteLayout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import FaqPage from "./pages/FaqPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <Home />
      </Route>
      <Route path={"/catalog"}>
        <Catalog />
      </Route>
      <Route path={"/products/:id"}>
        {(params) => <Product />}
      </Route>
      <Route path={"/faq"}>
        <FaqPage />
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <ChatProvider>
            <TooltipProvider>
              <Toaster />
              <SiteLayout>
                <Router />
              </SiteLayout>
            </TooltipProvider>
          </ChatProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
