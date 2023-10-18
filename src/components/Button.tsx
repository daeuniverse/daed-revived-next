import { ButtonProps, Button as NextButton } from '@nextui-org/react'
import { ElementRef, forwardRef } from 'react'

export const Button = forwardRef<ElementRef<typeof NextButton>, ButtonProps>(({ children, ...props }, ref) => (
  <NextButton ref={ref} {...props}>
    {props.isIconOnly && props.isLoading ? null : children}
  </NextButton>
))
Button.displayName = 'Button'
