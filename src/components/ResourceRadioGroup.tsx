import { Radio, RadioGroup, RadioGroupProps, RadioProps } from '@nextui-org/react'
import { ElementRef, forwardRef } from 'react'

export const ResourceRadio = forwardRef<ElementRef<typeof Radio>, RadioProps>((props, ref) => {
  return (
    <Radio
      ref={ref}
      classNames={{
        base: 'm-0 max-w-full gap-4 rounded-lg border-2 border-transparent bg-content1 p-4 hover:bg-content2 data-[selected=true]:border-primary',
        labelWrapper: 'gap-2',
        label: 'inline-flex items-center gap-2'
      }}
      {...props}
    />
  )
})
ResourceRadio.displayName = 'ResourceRadio'

export const ResourceRadioGroup = forwardRef<ElementRef<typeof RadioGroup>, RadioGroupProps>((props, ref) => (
  <RadioGroup ref={ref} classNames={{ wrapper: 'gap-4' }} {...props} />
))
ResourceRadioGroup.displayName = 'ResourceRadioGroup'
