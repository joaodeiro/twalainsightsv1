import { LoadingSpinner } from './LoadingSpinner'

interface LoadingPageProps {
  text?: string
  fullScreen?: boolean
}

export function LoadingPage({ 
  text = 'A carregar página...', 
  fullScreen = true 
}: LoadingPageProps) {
  return (
    <div className={`
      flex items-center justify-center bg-gray-50 dark:bg-gray-900 
      ${fullScreen ? 'min-h-screen' : 'min-h-[400px]'}
    `}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <p className="text-gray-600 text-lg">
          {text}
        </p>
      </div>
    </div>
  )
}