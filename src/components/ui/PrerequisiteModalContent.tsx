import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PrerequisiteType } from '@/hooks/usePrerequisites'
import { Building, Calendar } from 'lucide-react'

interface PrerequisiteModalContentProps {
  type: PrerequisiteType
  onClose: () => void
}

const PREREQUISITE_CONFIG = {
  custody: {
    title: 'Primeiro Passo: Conta de Custódia',
    description: 'Para começar a usar o Twala Insights, você precisa cadastrar pelo menos uma conta de custódia. Isso nos ajuda a organizar seus investimentos por instituição.',
    actionUrl: '/custody-accounts',
    actionText: 'Cadastrar Conta de Custódia',
    icon: <Building className="w-8 h-8 text-primary-600" />,
    bgColor: 'bg-primary-100',
    iconColor: 'text-primary-600'
  },
  transactions: {
    title: 'Próximo Passo: Registrar Transações',
    description: 'Agora que você tem uma conta de custódia, registre suas primeiras transações de compra e venda. Isso nos permitirá calcular o desempenho da sua carteira.',
    actionUrl: '/transactions',
    actionText: 'Registrar Transação',
    icon: <Calendar className="w-8 h-8 text-success-600" />,
    bgColor: 'bg-success-100',
    iconColor: 'text-success-600'
  }
}

export function PrerequisiteModalContent({ type, onClose }: PrerequisiteModalContentProps) {
  const config = PREREQUISITE_CONFIG[type]

  return (
    <div className="text-center">
      <div className={`w-16 h-16 ${config.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
        {config.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>
      <p className="text-gray-600 mb-6">
        {config.description}
      </p>
      <div className="space-y-3">
        <Link href={config.actionUrl} onClick={onClose}>
          <Button className="w-full">
            {config.actionText}
          </Button>
        </Link>
        <Button 
          variant="secondary" 
          onClick={onClose}
          className="w-full"
        >
          Depois
        </Button>
      </div>
    </div>
  )
} 