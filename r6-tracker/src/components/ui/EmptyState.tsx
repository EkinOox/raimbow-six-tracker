import { motion } from 'framer-motion';
import { MOTION_VARIANTS, BUTTON_STYLES } from '@/styles/shared-styles';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Composant d'état vide réutilisable
 */
export default function EmptyState({ 
  icon = "pi-search",
  title,
  description,
  actionLabel,
  onAction,
  className = "" 
}: EmptyStateProps) {
  return (
    <motion.div
      {...MOTION_VARIANTS.fadeIn}
      className={`text-center py-12 ${className}`}
    >
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className={`pi ${icon} text-white/50 text-2xl`}></i>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-white/60 mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={BUTTON_STYLES.primary}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
