'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '~/lib/ui'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const dialogVariants = cva(
  'fixed z-50 flex flex-col w-full max-h-screen sm:max-h-[90vh] border bg-background shadow-lg duration-200 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-md',
  {
    variants: {
      position: {
        left: 'left-4 top-[50%] translate-y-[-50%] data-[state=closed]:slide-out-to-left data-[state=closed]:slide-out-to-top-[50%] data-[state=open]:slide-in-from-left data-[state=open]:slide-in-from-top-[50%]',
        center:
          'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[50%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[50%]',
        right:
          'right-4 top-[50%] translate-y-[-50%] data-[state=closed]:slide-out-to-right data-[state=closed]:slide-out-to-top-[50%] data-[state=open]:slide-in-from-right data-[state=open]:slide-in-from-top-[50%]',
        'top-left':
          'left-4 top-4 translate-x-0 translate-y-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        'top-center':
          'left-[50%] top-4 translate-x-[-50%] translate-y-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[50%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[50%]',
        'top-right':
          'left-auto right-4 top-4 translate-x-0 translate-y-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        'bottom-left':
          'bottom-4 left-4 translate-x-0 translate-y-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        'bottom-center':
          'bottom-4 left-[50%] translate-x-[-50%] translate-y-0 data-[state=closed]:slide-out-to-bottom-[50%] data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-bottom-[50%] data-[state=open]:slide-in-from-left-1/2',
        'bottom-right':
          'bottom-4 left-auto right-4 translate-x-0 translate-y-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
      },
      size: {
        default: 'w-full lg:max-w-lg',
        small: 'w-full lg:max-w-xl',
        medium: 'w-full lg:max-w-2xl',
        large: 'w-full lg:max-w-3xl',
        'extra-large': 'w-full lg:max-w-5xl',
        'super-large': 'w-full xl:max-w-6xl',
        'ultra-large': 'w-full xl:max-w-7xl',
        full: 'max-w-[calc(100%-15px)] md:max-w-[calc(100%-24px)] lg:max-w-[calc(100%-80px)]'
      }
    },
    defaultVariants: {
      position: 'center',
      size: 'default'
    }
  }
)

export interface DialogProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
  children?: React.ReactNode
  className?: string
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogProps>(
  ({ className, position, size, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Content ref={ref} className={cn(dialogVariants({ position, size }), className)} {...props}>
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'

    return <Comp ref={ref} className={cn('flex-1 overflow-y-auto p-4 sm:p-6', className)} {...props} />
  }
)
DialogBody.displayName = 'DialogBody'

const DialogHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'sticky top-0 z-[100] flex flex-col gap-2 border-b bg-background p-4 text-center sm:p-6 sm:text-left',
      className
    )}
    {...props}
  >
    {children}

    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
      <X className="h-4 w-4" />

      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  </div>
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'sticky bottom-0 flex flex-col-reverse gap-2 border-t bg-background p-4 sm:flex-row sm:justify-end sm:p-6',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }
