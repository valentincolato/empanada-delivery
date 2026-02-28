import HeroSection from './home/HeroSection'
import FeaturesSection from './home/FeaturesSection'
import MoreSection from './home/MoreSection'
import StatsSection from './home/StatsSection'
import WhySection from './home/WhySection'
import FaqSection from './home/FaqSection'
import PricingSection from './home/PricingSection'
import CtaSection from './home/CtaSection'

const RESTAURANT_LINK = '/empanadas-demo'

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip text-[var(--ink-900)]">
      <HeroSection restaurantLink={RESTAURANT_LINK} />
      <FeaturesSection />
      <MoreSection />
      <StatsSection />
      <WhySection />
      <FaqSection />
      <PricingSection />
      <CtaSection restaurantLink={RESTAURANT_LINK} />
    </div>
  )
}
