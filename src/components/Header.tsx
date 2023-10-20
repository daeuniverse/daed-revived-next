'use client'

import {
  Avatar,
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle
} from '@nextui-org/react'
import i18n from 'i18next'
import ky from 'ky'
import { useTheme } from 'next-themes'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserQuery } from '~/apis/query'
import { LogoText } from '~/components/LogoText'

const Header: FC = () => {
  const { t } = useTranslation()
  const { theme: curTheme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const userQuery = useUserQuery()

  const navigationMenus = [
    { name: t('primitives.network'), route: '/network' },
    { name: t('primitives.rule'), route: '/rule' }
  ]

  return (
    <Navbar isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle className="sm:hidden" />

        <NavbarBrand>
          <NextLink href="/">
            <LogoText />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        {navigationMenus.map((menu, index) => (
          <NavbarItem key={index} isActive={menu.route === pathname}>
            <Link as={NextLink} href={menu.route} color={menu.route === pathname ? 'secondary' : 'foreground'}>
              {menu.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="secondary"
              size="sm"
              name={userQuery.data?.user.name || userQuery.data?.user.username}
              src={userQuery.data?.user.avatar || ''}
            />
          </DropdownTrigger>

          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownSection title={t('primitives.accountSettings')} showDivider>
              <DropdownItem
                key="profile"
                textValue="profile"
                className="py-2"
                onPress={() => {
                  console.log('account settings')
                }}
              >
                <p className="font-semibold">{t('primitives.username', { username: userQuery.data?.user.username })}</p>

                <p className="font-semibold">
                  {t('primitives.accountName', { accountName: userQuery.data?.user.name })}
                </p>
              </DropdownItem>
            </DropdownSection>

            <DropdownSection title={t('actions.switchTheme')} showDivider>
              <DropdownItem key="theme" textValue="theme">
                <ButtonGroup>
                  {[
                    ['system', t('actions.systemMode')],
                    ['dark', t('actions.darkMode')],
                    ['light', t('actions.lightMode')]
                  ].map(([theme, title]) => (
                    <Button
                      key={theme}
                      onPress={() => setTheme(theme)}
                      color={theme === curTheme ? 'primary' : 'secondary'}
                    >
                      {title}
                    </Button>
                  ))}
                </ButtonGroup>
              </DropdownItem>
            </DropdownSection>

            <DropdownSection title={t('actions.switchLanguage')} showDivider>
              <DropdownItem key="language" textValue="language">
                <ButtonGroup>
                  {[
                    ['en-US', t('primitives.english')],
                    ['zh-Hans', t('primitives.chineseSimplified')]
                  ].map(([language, title]) => (
                    <Button
                      key={language}
                      onPress={() => i18n.changeLanguage(language)}
                      color={language === i18n.language ? 'primary' : 'secondary'}
                    >
                      {title}
                    </Button>
                  ))}
                </ButtonGroup>
              </DropdownItem>
            </DropdownSection>

            <DropdownItem
              key="logout"
              color="danger"
              onClick={async () => {
                await ky.post('/api/logout')

                router.replace('/login')
              }}
            >
              {t('actions.logout')}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      <NavbarMenu>
        {navigationMenus.map((menu, index) => (
          <NavbarMenuItem key={index}>
            <Link as={NextLink} className="w-full" href={menu.route} size="lg" onPress={() => setIsMenuOpen(false)}>
              {menu.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  )
}
Header.displayName = 'Header'

export { Header }
