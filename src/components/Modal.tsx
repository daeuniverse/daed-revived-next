'use client'

import { ModalFooter, ModalFooterProps, ModalProps, Modal as NextModal, cn } from '@nextui-org/react'
import { ElementRef, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'

export const Modal = forwardRef<ElementRef<typeof NextModal>, ModalProps>(({ className, ...props }, ref) => (
  <NextModal ref={ref} size="xl" backdrop="blur" scrollBehavior="inside" className={cn('mx-0', className)} {...props} />
))
Modal.displayName = 'Modal'

export const ModalSubmitFormFooter = forwardRef<
  ElementRef<typeof ModalFooter>,
  ModalFooterProps & {
    isResetDisabled?: boolean
    isSubmitDisabled?: boolean
    reset: () => void
    isSubmitting?: boolean
  }
>(({ isResetDisabled, isSubmitDisabled, reset, isSubmitting, ...props }, ref) => {
  const { t } = useTranslation()

  return (
    <ModalFooter ref={ref} {...props}>
      <Button type="reset" color="secondary" isDisabled={isResetDisabled} onPress={() => reset()}>
        {t('actions.reset')}
      </Button>

      <Button type="submit" isDisabled={isSubmitDisabled} isLoading={isSubmitting}>
        {t('actions.submit')}
      </Button>
    </ModalFooter>
  )
})
ModalSubmitFormFooter.displayName = 'ModalSubmitFormFooter'

export const ModalConfirmFormFooter = forwardRef<
  ElementRef<typeof ModalFooter>,
  ModalFooterProps & {
    isSubmitting?: boolean
    onCancel: () => void
    onConfirm?: () => Promise<unknown>
  }
>(({ onCancel, onConfirm, isSubmitting, ...props }, ref) => {
  const { t } = useTranslation()

  return (
    <ModalFooter ref={ref} {...props}>
      <Button color="secondary" onPress={onCancel}>
        {t('actions.cancel')}
      </Button>

      <Button type="submit" color="danger" isLoading={isSubmitting} onPress={onConfirm}>
        {t('actions.confirm')}
      </Button>
    </ModalFooter>
  )
})
ModalConfirmFormFooter.displayName = 'ModalConfirmFormFooter'
