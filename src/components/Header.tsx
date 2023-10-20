'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Avatar,
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  useDisclosure
} from '@nextui-org/react'
import i18n from 'i18next'
import ky from 'ky'
import { useTheme } from 'next-themes'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useUserQuery } from '~/apis/query'
import { LogoText } from '~/components/LogoText'
import { ModalConfirmFormFooter } from '~/components/Modal'
import { updatePasswordFormDefault, useUpdatePasswordSchemaWithRefine } from '~/schemas/account'

export const Header: FC = () => {
  const { t } = useTranslation()
  const { theme: curTheme, setTheme } = useTheme()

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const {
    isOpen: isUpdatePasswordOpen,
    onOpen: onUpdatePasswordOpen,
    onClose: onUpdatePasswordClose,
    onOpenChange: onUpdatePasswordOpenChange
  } = useDisclosure()

  const updatePasswordSchemaWithRefine = useUpdatePasswordSchemaWithRefine()()

  const updatePasswordForm = useForm<z.infer<typeof updatePasswordSchemaWithRefine>>({
    resolver: zodResolver(updatePasswordSchemaWithRefine),
    defaultValues: updatePasswordFormDefault
  })

  const pathname = usePathname()
  const router = useRouter()
  const userQuery = useUserQuery()

  const navigationMenus = [
    { name: t('primitives.network'), route: '/network' },
    { name: t('primitives.rule'), route: '/rule' }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isUpdatePasswordOpen) updatePasswordForm.reset()
    }, 150)

    return () => timer && clearTimeout(timer)
  }, [isUpdatePasswordOpen, updatePasswordForm])

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

          <DropdownMenu
            aria-label="Profile Actions"
            variant="flat"
            onAction={(key) => {
              if (key === 'update-password') onUpdatePasswordOpen()
            }}
          >
            <DropdownSection title={t('primitives.accountSettings')} showDivider>
              <DropdownItem key="profile" textValue="profile" className="py-2">
                <p className="font-semibold">{t('primitives.username', { username: userQuery.data?.user.username })}</p>

                <p className="font-semibold">
                  {t('primitives.accountName', { accountName: userQuery.data?.user.name })}
                </p>
              </DropdownItem>

              <DropdownItem key="update-password" textValue="update-password">
                {t('actions.updatePassword')}
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

      <Modal isOpen={isUpdatePasswordOpen} onOpenChange={onUpdatePasswordOpenChange}>
        <form
          onSubmit={updatePasswordForm.handleSubmit(async (values) => {
            try {
              await ky.post('/api/update-password', {
                json: { currentPassword: values.currentPassword, newPassword: values.newPassword }
              })

              onUpdatePasswordClose()
            } catch {}
          })}
        >
          <ModalContent>
            <ModalHeader>{t('actions.updatePassword')}</ModalHeader>

            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  type="password"
                  label={t('primitives.currentPassword')}
                  placeholder={t('primitives.currentPassword')}
                  errorMessage={updatePasswordForm.formState.errors.currentPassword?.message}
                  {...updatePasswordForm.register('currentPassword')}
                />

                <Input
                  type="password"
                  label={t('primitives.newPassword')}
                  placeholder={t('primitives.newPassword')}
                  errorMessage={updatePasswordForm.formState.errors.newPassword?.message}
                  {...updatePasswordForm.register('newPassword')}
                />

                <Input
                  type="password"
                  label={t('primitives.confirmPassword')}
                  placeholder={t('primitives.confirmPassword')}
                  errorMessage={updatePasswordForm.formState.errors.confirmPassword?.message}
                  {...updatePasswordForm.register('confirmPassword')}
                />
              </div>
            </ModalBody>

            <ModalConfirmFormFooter
              onCancel={onUpdatePasswordClose}
              isSubmitting={updatePasswordForm.formState.isSubmitting}
            />
          </ModalContent>
        </form>
      </Modal>
    </Navbar>
  )
}
Header.displayName = 'Header'
