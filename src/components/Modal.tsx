import { ModalProps, Modal as NextModal, cn } from '@nextui-org/react'
import { ElementRef, forwardRef } from 'react'

export const Modal = forwardRef<ElementRef<typeof NextModal>, ModalProps>(({ className, ...props }, ref) => (
  <NextModal ref={ref} size="xl" backdrop="blur" scrollBehavior="inside" className={cn('mx-0', className)} {...props} />
))
Modal.displayName = 'Modal'
