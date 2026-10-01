import type { ComponentProps } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
export const Sheet = Dialog.Root
export const SheetTitle = Dialog.Title
export const SheetDescription = Dialog.Description
export function SheetContent({
  children,
  className,
  ...props
}: ComponentProps<typeof Dialog.Content>) {
  const { t } = useTranslation()
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className={cn('sheet-content', className)} {...props}>
        {children}
        <Dialog.Close
          className="sheet-close button button-ghost button-icon"
          aria-label={t('form.closeLabel')}
        >
          <X size={19} />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
