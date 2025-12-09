import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { StatsSection } from "@/components/home/stats-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FAQSection } from "@/components/home/faq-section";
import { IntegrationsSection } from "@/components/home/integrations-section";
import { PricingSection } from "@/components/home/pricing-section";
import { CTASection } from "@/components/home/cta-section";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "react-hot-toast";

export default function HomePage() {
  return (
    <>
      <ErrorBoundary>
      <Toaster position="top-right" />
        <ToastProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <HeroSection />
              <FeaturesSection />
              <StatsSection />
              <HowItWorksSection />
              <IntegrationsSection />
              <TestimonialsSection />
              <FAQSection />
              <PricingSection />
              <CTASection />
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </ErrorBoundary>
    </>
  );
}
