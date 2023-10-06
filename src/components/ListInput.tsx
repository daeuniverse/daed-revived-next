'use client'

import { PlusIcon, XIcon } from 'lucide-react'
import { FC } from 'react'
import { useFieldArray } from 'react-hook-form'
import { Button } from '~/components/ui/button'
import { FormField, FormItem, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'

const ListInput: FC<{ name: string }> = ({ name }) => {
  const { fields, append, remove } = useFieldArray({ name })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((item, index) => {
        return (
          <FormField
            key={item.id}
            name={`${name}.${index}`}
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-2">
                  <Input {...field} />

                  <Button
                    variant="destructive"
                    size="icon"
                    icon={<XIcon className="w-4" />}
                    onClick={() => remove(index)}
                  />
                </div>

                <FormMessage />
              </FormItem>
            )}
          />
        )
      })}

      <Button onClick={() => append('')} icon={<PlusIcon className="w-4" />} />
    </div>
  )
}
ListInput.displayName = 'ListInput'

export { ListInput }
