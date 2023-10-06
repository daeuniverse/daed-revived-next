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
                <div className="flex items-center gap-2">
                  <Input {...field} />

                  <Button
                    className="h-fit w-fit p-2"
                    variant="destructive"
                    icon={<XIcon className="h-3 w-3" />}
                    onClick={() => remove(index)}
                  />
                </div>

                <FormMessage />
              </FormItem>
            )}
          />
        )
      })}

      <div className="self-end">
        <Button className="h-fit w-fit p-2" onClick={() => append('')} icon={<PlusIcon className="h-3 w-3" />} />
      </div>
    </div>
  )
}
ListInput.displayName = 'ListInput'

export { ListInput }
