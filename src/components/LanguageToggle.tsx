'use client'

import i18n from 'i18next'
import { LanguagesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export const LanguageToggle = () => {
  const { t } = useTranslation()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className="h-auto w-auto p-2 sm:p-3"
          onClick={() => void i18n.changeLanguage(i18n.language === 'en-US' ? 'zh-Hans' : 'en-US')}
          icon={<LanguagesIcon className="h-4 w-4" />}
        />
      </TooltipTrigger>

      <TooltipContent>{t('actions.switchLanguage')}</TooltipContent>
    </Tooltip>
  )
}
