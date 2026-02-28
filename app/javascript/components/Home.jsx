import HeroSection from './home/HeroSection'
import FeaturesSection from './home/FeaturesSection'
import MoreSection from './home/MoreSection'
import StatsSection from './home/StatsSection'
import WhySection from './home/WhySection'
import FaqSection from './home/FaqSection'
import PricingSection from './home/PricingSection'
import CtaSection from './home/CtaSection'
import { fillPath } from '@utils/pathBuilder'

export default function Home({ public_restaurant_template, panel_login }) {
  const restaurantLink = fillPath(public_restaurant_template, { slug: 'empanadas-demo' })
  const adminLoginPath = panel_login

  return (
    <div className="min-h-screen overflow-x-clip text-[var(--ink-900)]">
      <HeroSection restaurantLink={restaurantLink} adminLoginPath={adminLoginPath} />
      <FeaturesSection />
      <MoreSection />
      <StatsSection />
      <WhySection />
      <FaqSection />
      <PricingSection />
      <CtaSection restaurantLink={restaurantLink} adminLoginPath={adminLoginPath} />
    </div>
  )
}
