import { ConfigSection } from './ConfigSection'
import { DNSSection } from './DNSSection'
import { RoutingSection } from './RoutingSection'

export default function RulePage() {
  return (
    <div className="flex flex-col gap-4">
      <RoutingSection />

      <DNSSection />

      <ConfigSection />
    </div>
  )
}
