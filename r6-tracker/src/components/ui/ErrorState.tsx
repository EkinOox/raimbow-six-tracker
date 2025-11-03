import { motion } from 'framer-motion';
import { CONTAINER_STYLES, MOTION_VARIANTS } from '@/styles/shared-styles';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Composant d'erreur réutilisable avec option de retry
 */
export default function ErrorState({ 
  title = "Erreur de chargement",
  message, 
  onRetry,
  className = "" 
}: ErrorStateProps) {
  return (
    <motion.div
      {...MOTION_VARIANTS.fadeInScale}
      className={`${CONTAINER_STYLES.error} ${className}`}
    >
      <div className="flex items-start text-red-300">
        <i className="pi pi-exclamation-triangle mr-3 text-xl flex-shrink-0 mt-0.5"></i>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-red-300 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              <i className="pi pi-refresh mr-2"></i>
              Réessayer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
