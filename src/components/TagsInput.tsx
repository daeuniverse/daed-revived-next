'use client'

import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react'
import * as Portal from '@radix-ui/react-portal'
import { useCombobox, useMultipleSelection } from 'downshift'
import { differenceWith } from 'lodash'
import { ChevronDownIcon, ChevronUpIcon, XIcon } from 'lucide-react'
import { matchSorter } from 'match-sorter'
import { HTMLAttributes, ReactNode, forwardRef, useMemo, useState } from 'react'
import { useMeasure } from 'react-use'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/ui'

export type TagsInputOption = {
  value: string
  title?: string
  description?: ReactNode
}

export type TagsInputProps = {
  options?: TagsInputOption[]
  value?: TagsInputOption['value'][]
  onChange?: (value: TagsInputOption['value'][]) => void
} & Omit<HTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>

const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
  ({ className, options = [], value = [], onChange, ...props }, ref) => {
    const [inputValue, setInputValue] = useState('')

    const items = useMemo(
      () =>
        matchSorter(
          differenceWith(options, value, (option, b) => option.value === b),
          inputValue,
          { sorter: (rankedItems) => rankedItems, keys: ['title', 'description'] }
        ),
      [inputValue, value, options]
    )

    const { getSelectedItemProps, getDropdownProps, removeSelectedItem } = useMultipleSelection({
      selectedItems: value,

      onStateChange({ selectedItems: newSelectedItems, type }) {
        switch (type) {
          case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
          case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
          case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
          case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
            newSelectedItems && onChange?.(newSelectedItems)

            break

          default:
            break
        }
      }
    })

    const { isOpen, getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
      items,
      itemToString: (item) => (item?.title ? item.title : ''),
      defaultHighlightedIndex: 0,
      selectedItem: null,
      inputValue,

      stateReducer(_state, actionAndChanges) {
        const { changes, type } = actionAndChanges

        switch (type) {
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            return { ...changes, isOpen: true, highlightedIndex: 0 }

          default:
            return changes
        }
      },

      onStateChange({ inputValue: newInputValue, type, selectedItem: newSelectedItem }) {
        switch (type) {
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
          case useCombobox.stateChangeTypes.InputBlur:
            if (newSelectedItem) {
              onChange?.([...value, newSelectedItem.value])
              setInputValue('')
            }

            break

          case useCombobox.stateChangeTypes.InputChange:
            setInputValue(newInputValue || '')

            break

          default:
            break
        }
      }
    })

    const open = !!(isOpen && items.length)

    const [measureRef, { width }] = useMeasure<HTMLDivElement>()

    const { refs, floatingStyles } = useFloating({
      whileElementsMounted: autoUpdate,
      middleware: [offset(4), flip()]
    })

    return (
      <div ref={measureRef}>
        <div
          ref={refs.setReference}
          className="inline-flex w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2 shadow-sm focus-within:outline-none focus-within:ring-1 focus-within:ring-ring"
        >
          {value.map((selectedValue, index) => (
            <Badge
              key={index}
              className="gap-1 ring-offset-background"
              {...getSelectedItemProps({ selectedItem: selectedValue, index })}
            >
              {options.find((option) => option.value === selectedValue)?.title || selectedValue}

              <Button
                variant="ghost"
                size="icon"
                className="h-auto w-auto"
                onClick={(e) => {
                  e.stopPropagation()

                  removeSelectedItem(selectedValue)
                }}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          <div className="flex flex-1 grow gap-2">
            <input
              ref={ref}
              {...getInputProps(
                getDropdownProps({
                  className: cn(
                    'min-w-[2rem] flex-1 bg-inherit text-sm outline-0 placeholder:text-muted-foreground outline-none ring-0',
                    className
                  ),
                  preventKeyAction: isOpen
                })
              )}
              {...props}
            />

            <Button
              variant="secondary"
              className="h-fit w-fit p-1"
              {...getToggleButtonProps()}
              icon={open ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
            />
          </div>
        </div>

        <div className={cn(open && 'hidden')} {...getMenuProps()}>
          {open && (
            <Portal.Root ref={refs.setFloating} className="z-[100]" style={{ width, ...floatingStyles }}>
              <ul className="max-h-64 overflow-y-auto rounded bg-background">
                {items.map((item, index) => (
                  <li
                    key={index}
                    {...getItemProps({
                      item,
                      index,
                      className: cn(
                        highlightedIndex === index && 'bg-accent ',
                        'flex cursor-pointer flex-col gap-1 p-2'
                      )
                    })}
                  >
                    <span className={cn(highlightedIndex === index && 'font-bold', 'text-sm')}>
                      {item.title || item.value}
                    </span>

                    {item.description && <span className="text-xs">{item.description}</span>}
                  </li>
                ))}
              </ul>
            </Portal.Root>
          )}
        </div>
      </div>
    )
  }
)
TagsInput.displayName = 'TagsInput'

export { TagsInput }
