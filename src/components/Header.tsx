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
  Spinner,
  useDisclosure
} from '@nextui-org/react'
import i18n from 'i18next'
import ky from 'ky'
import { useTheme } from 'next-themes'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useUpdateAvatarMutation, useUpdateNameMutation } from '~/apis/mutation'
import { useUserQuery } from '~/apis/query'
import { LogoText } from '~/components/LogoText'
import { Modal, ModalConfirmFormFooter, ModalSubmitFormFooter } from '~/components/Modal'
import { updatePasswordFormDefault, useUpdatePasswordSchemaWithRefine } from '~/schemas/account'

const AvatarUploader: FC<{ name: string }> = ({ name }) => {
  const [uploading, setUploading] = useState(false)

  return (
    <Controller
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-center">
          <div className="flex h-32 w-32 items-center justify-center">
            {uploading ? <Spinner /> : <Avatar size="lg" as="label" htmlFor="avatar" showFallback src={field.value} />}
          </div>

          <input
            id="avatar"
            type="file"
            hidden
            accept="image/*"
            multiple={false}
            onChange={async (e) => {
              setUploading(true)

              const file = e.target.files?.item(0)

              if (!file) return

              const formData = new FormData()
              formData.append('avatar', file)

              try {
                const { url } = await ky.post('/api/avatar', { body: formData }).json<{ url: string }>()

                field.onChange(url)
              } finally {
                setUploading(false)
              }
            }}
          />
        </div>
      )}
    />
  )
}

export const Header: FC = () => {
  const { t } = useTranslation()
  const { theme: curTheme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  const userQuery = useUserQuery()

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const {
    isOpen: isUpdateProfileOpen,
    onOpen: onUpdateProfileOpen,
    onClose: onUpdateProfileClose,
    onOpenChange: onUpdateProfileOpenChange
  } = useDisclosure()

  const updateProfileSchema = z.object({
    name: z.string().min(4).max(20),
    avatar: z.string().min(1)
  })

  const updateProfileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: '', avatar: '' }
  })

  const updateProfileFormDirty = Object.values(updateProfileForm.formState.dirtyFields).some((dirty) => dirty)

  const updateNameMutation = useUpdateNameMutation()
  const updateAvatarMutation = useUpdateAvatarMutation()

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
              showFallback
              name={userQuery.data?.user.name || userQuery.data?.user.username}
              src={userQuery.data?.user.avatar || ''}
            />
          </DropdownTrigger>

          <DropdownMenu
            aria-label="Profile Actions"
            variant="flat"
            onAction={(key) => {
              if (key === 'profile') {
                updateProfileForm.reset({
                  name: userQuery.data?.user.name || '',
                  avatar: userQuery.data?.user.avatar || ''
                })
                onUpdateProfileOpen()
              }
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
                {t('actions.update', {
                  resourceName: t('form.fields.password')
                })}
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

      <Modal isOpen={isUpdateProfileOpen} onOpenChange={onUpdateProfileOpenChange}>
        <FormProvider {...updateProfileForm}>
          <form
            onSubmit={updateProfileForm.handleSubmit(async (values) => {
              try {
                if (values.name !== userQuery.data?.user.name) {
                  await updateNameMutation.mutateAsync(values.name)
                }

                if (values.avatar !== userQuery.data?.user.avatar) {
                  await updateAvatarMutation.mutateAsync(values.avatar)
                }

                onUpdateProfileClose()
              } catch {}
            })}
          >
            <ModalContent>
              <ModalHeader>{t('actions.update', { resourceName: t('primitives.profile') })}</ModalHeader>

              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label={t('form.fields.name')}
                    placeholder={t('form.fields.name')}
                    errorMessage={updateProfileForm.formState.errors.name?.message}
                    {...updateProfileForm.register('name')}
                  />

                  <AvatarUploader name="avatar" />
                </div>
              </ModalBody>

              <ModalSubmitFormFooter
                reset={updateProfileForm.reset}
                isResetDisabled={!updateProfileFormDirty}
                isSubmitting={updateProfileForm.formState.isSubmitting}
              />
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>

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
            <ModalHeader>{t('actions.update', { resourceName: t('form.fields.password') })}</ModalHeader>

            <ModalBody>
              <div className="flex flex-col gap-4">
                <Input
                  type="password"
                  label={t('form.fields.currentPassword')}
                  placeholder={t('form.fields.currentPassword')}
                  errorMessage={updatePasswordForm.formState.errors.currentPassword?.message}
                  {...updatePasswordForm.register('currentPassword')}
                />

                <Input
                  type="password"
                  label={t('form.fields.newPassword')}
                  placeholder={t('form.fields.newPassword')}
                  errorMessage={updatePasswordForm.formState.errors.newPassword?.message}
                  {...updatePasswordForm.register('newPassword')}
                />

                <Input
                  type="password"
                  label={t('form.fields.confirmPassword')}
                  placeholder={t('form.fields.confirmPassword')}
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
