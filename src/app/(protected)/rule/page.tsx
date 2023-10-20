import Config from './Config'
import DNS from './DNS'
import Routing from './Routing'

export default function RulePage() {
  return (
    <div className="flex flex-col gap-4">
      <Routing />
      <DNS />
      <Config />
    </div>
  )
}
