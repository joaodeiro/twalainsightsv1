'use client'

import { usePrerequisites, PrerequisiteType } from '@/hooks/usePrerequisites'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { PrerequisiteModalContent } from '@/components/ui/PrerequisiteModalContent'

interface PrerequisitesCheckProps {
  children: React.ReactNode
}

const PREREQUISITE_TITLES = {
  custody: 'Conta de Custódia Necessária',
  transactions: 'Transações Necessárias'
}

export function PrerequisitesCheck({ children }: PrerequisitesCheckProps) {
  const { prerequisites, mounted, isAuthPage, closeModal } = usePrerequisites()
  const isMobile = useIsMobile()

  // Não mostrar modais se não estiver montado ou se estiver em páginas de auth
  if (!mounted || isAuthPage) {
    return <>{children}</>
  }

  // Encontrar modais ativos
  const custodyModal = prerequisites.find(p => p.type === 'custody')
  const transactionModal = prerequisites.find(p => p.type === 'transactions')

  // Função para renderizar modal/drawer
  const renderModal = (type: PrerequisiteType, isOpen: boolean) => {
    if (!isOpen) return null

    const title = PREREQUISITE_TITLES[type]
    const handleClose = () => closeModal(type)

    if (isMobile) {
      return (
        <Drawer
          key={type}
          isOpen={true}
          onClose={handleClose}
          title={title}
        >
          <PrerequisiteModalContent type={type} onClose={handleClose} />
        </Drawer>
      )
    }

    return (
      <Modal
        key={type}
        isOpen={true}
        onClose={handleClose}
        title={title}
      >
        <PrerequisiteModalContent type={type} onClose={handleClose} />
      </Modal>
    )
  }

  return (
    <>
      {children}
      
      {/* Renderizar modais ativos */}
      {renderModal('custody', custodyModal?.isOpen || false)}
      {renderModal('transactions', transactionModal?.isOpen || false)}
    </>
  )
} 