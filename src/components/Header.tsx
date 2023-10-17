'use client'

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
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
import ky from 'ky'
import { ActivityIcon, CogIcon, GlobeIcon, NetworkIcon } from 'lucide-react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserQuery } from '~/apis/query'
import { LogoText } from '~/components/LogoText'

const Header: FC = () => {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const userQuery = useUserQuery()

  const navigationMenus = [
    { name: t('primitives.orchestrate'), route: '/orchestrate', Icon: ActivityIcon },
    { name: t('primitives.routing'), route: '/routing', Icon: NetworkIcon },
    { name: t('primitives.dns'), route: '/dns', Icon: GlobeIcon },
    { name: t('primitives.config'), route: '/config', Icon: CogIcon }
  ]

  return (
    <Navbar isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle className="sm:hidden" />

        <NavbarBrand>
          <LogoText />
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
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">zoey@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="team_settings">Team Settings</DropdownItem>
            <DropdownItem key="analytics">Analytics</DropdownItem>
            <DropdownItem key="system">System</DropdownItem>
            <DropdownItem key="configurations">Configurations</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>

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
            <Link as={NextLink} className="w-full" href={menu.route} size="lg">
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
