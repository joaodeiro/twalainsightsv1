import { Card } from './Card'
import { LoadingSpinner } from './LoadingSpinner'

interface LoadingCardProps {
  text?: string
  className?: string
  height?: 'sm' | 'md' | 'lg'
}

export function LoadingCard({ 
  text = 'Carregando...', 
  className,
  height = 'md' 
}: LoadingCardProps) {
  const heightClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64'
  }

  return (
    <Card className={className}>
      <div className={`flex items-center justify-center ${heightClasses[height]}`}>
        <LoadingSpinner size="lg" text={text} />
      </div>
    </Card>
  )
}