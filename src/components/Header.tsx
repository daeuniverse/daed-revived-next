'use client'

import i18n from 'i18next'
import { ActivityIcon, CogIcon, GlobeIcon, LanguagesIcon, NetworkIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserQuery } from '~/apis/query'
import { LogoText } from '~/components/LogoText'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { ModeToggle } from '~/components/ui/mode-toggle'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '~/components/ui/navigation-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

const Header: FC = () => {
  const { t } = useTranslation()
  const pathname = usePathname()
  const userQuery = useUserQuery()

  const navigationMenus = [
    { name: t('primitives.orchestrate'), route: '/orchestrate', Icon: ActivityIcon },
    { name: t('primitives.routing'), route: '/routing', Icon: NetworkIcon },
    { name: t('primitives.dns'), route: '/dns', Icon: GlobeIcon },
    { name: t('primitives.config'), route: '/config', Icon: CogIcon }
  ]

  return (
    <div className="flex w-full items-center justify-between p-2 sm:justify-center sm:p-4">
      <div className="hidden w-1/2 justify-start sm:block">
        <LogoText />
      </div>

      <div className="flex-shrink-0">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center justify-center gap-0 space-x-0 sm:gap-6">
            {navigationMenus.map((menu, index) => (
              <NavigationMenuItem key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavigationMenuLink asChild active={menu.route === pathname}>
                      <Link className={navigationMenuTriggerStyle()} href={menu.route}>
                        <menu.Icon className="w-4 flex-shrink-0 sm:w-6" />
                      </Link>
                    </NavigationMenuLink>
                  </TooltipTrigger>

                  <TooltipContent>{menu.name}</TooltipContent>
                </Tooltip>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex w-1/2 items-center justify-end gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void i18n.changeLanguage(i18n.language === 'en-US' ? 'zh-Hans' : 'en-US')}
              icon={<LanguagesIcon className="w-4" />}
            />
          </TooltipTrigger>

          <TooltipContent>{t('actions.switchLanguage')}</TooltipContent>
        </Tooltip>

        <ModeToggle />

        <Avatar>
          {userQuery.data?.user.avatar && (
            <Image width={40} height={40} src={userQuery.data.user.avatar} alt="avatar" />
          )}

          <AvatarFallback>daed</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
Header.displayName = 'Header'

export { Header }
