import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AISolutionsSection from '../components/landing/AISolutionsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import PreviewsSection from '../components/landing/PreviewsSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import { CTASection, Footer } from '../components/landing/CTA_Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AISolutionsSection />
        <HowItWorksSection />
        <PreviewsSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
