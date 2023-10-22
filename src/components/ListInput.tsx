'use client'

import { Input } from '@nextui-org/react'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { FC } from 'react'
import { Controller, useFieldArray } from 'react-hook-form'
import { Button } from '~/components/Button'

export const ListInput: FC<{ name: string }> = ({ name }) => {
  const { fields, append, remove } = useFieldArray({ name })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((item, index) => (
        <Controller
          key={item.id}
          name={`${name}.${index}`}
          render={({ field, fieldState }) => (
            <div className="flex items-start gap-2">
              <Input errorMessage={fieldState.error?.message} {...field} />

              <Button color="danger" onPress={() => remove(index)} isIconOnly>
                <IconTrash />
              </Button>
            </div>
          )}
        />
      ))}

      <div className="self-end">
        <Button color="primary" onPress={() => append('')} isIconOnly>
          <IconPlus />
        </Button>
      </div>
    </div>
  )
}
ListInput.displayName = 'ListInput'
