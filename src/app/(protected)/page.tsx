'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { UserQuery } from '~/apis/gql/graphql'
import { Editor } from '~/components/Editor'
import { ListInput } from '~/components/ListInput'
import { TagsInput, TagsInputOption } from '~/components/TagsInput'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { useToast } from '~/components/ui/use-toast'
import { useGraphqlClient } from '~/contexts'

const books: TagsInputOption[] = [
  { value: 'book-1', description: 'Harper Lee', title: 'To Kill a Mockingbird' },
  { value: 'book-2', description: 'Lev Tolstoy', title: 'War and Peace' },
  { value: 'book-3', description: 'Fyodor Dostoyevsy', title: 'The Idiot' },
  { value: 'book-4', description: 'Oscar Wilde', title: 'A Picture of Dorian Gray' },
  { value: 'book-5', description: 'George Orwell', title: '1984' },
  { value: 'book-6', description: 'Jane Austen', title: 'Pride and Prejudice' },
  { value: 'book-7', description: 'Marcus Aurelius', title: 'Meditations' },
  { value: 'book-8', description: 'Fyodor Dostoevsky', title: 'The Brothers Karamazov' },
  { value: 'book-9', description: 'Lev Tolstoy', title: 'Anna Karenina' },
  { value: 'book-10', description: 'Fyodor Dostoevsky', title: 'Crime and Punishment' }
]

export default function HomePage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const graphqlClient = useGraphqlClient()
  const userQuery = useQuery<UserQuery>({
    queryKey: ['user'],
    queryFn: () =>
      graphqlClient.request(gql`
        query User {
          user {
            username
            name
            avatar
          }
        }
      `)
  })

  const [editorValue, setEditorValue] = useState(
    `
pname(NetworkManager, systemd-resolved, dnsmasq) -> must_direct
dip(geoip:private) -> direct
dip(geoip:cn) -> direct
domain(geosite:cn) -> direct 
`.trim()
  )

  const schema = z.object({
    books: z.array(z.string().min(1)).min(1),
    authors: z.array(z.string().min(1)).min(1)
  })
  const form = useForm<z.infer<typeof schema>>({
    shouldFocusError: true,
    resolver: zodResolver(schema),
    defaultValues: {
      books: ['book-1', 'book-2'],
      authors: [
        'author-1',
        'author-2',
        'author-3',
        'author-4',
        'author-5',
        'author-6',
        'author-7',
        'author-8',
        'author-9'
      ]
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <p>Name: {userQuery.data?.user.name}</p>
      <p>Username: {userQuery.data?.user.username}</p>

      <Avatar>
        {userQuery.data?.user.avatar && <AvatarImage src={userQuery.data.user.avatar} />}

        <AvatarFallback>{userQuery.data?.user.username[0]}</AvatarFallback>
      </Avatar>

      <Editor height="20vh" language="dae" value={editorValue} onChange={(value) => value && setEditorValue(value)} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            toast({ title: 'Success', description: JSON.stringify(values) })
          })}
        >
          <FormField
            name="books"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>books</FormLabel>

                <FormControl>
                  <TagsInput options={books} placeholder="Select a book" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="authors"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>authors</FormLabel>

                <FormControl>
                  <ListInput name={field.name} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="reset" variant="secondary" onClick={() => form.reset()}>
            {t('actions.reset')}
          </Button>
          <Button type="submit">{t('actions.submit')}</Button>
        </form>
      </Form>
    </div>
  )
}
