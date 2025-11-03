import { LOADING_STYLES } from '@/styles/shared-styles';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Composant de chargement réutilisable
 */
export default function LoadingState({ 
  message = "Chargement...", 
  className = "" 
}: LoadingStateProps) {
  return (
    <div className={`${LOADING_STYLES.container} ${className}`}>
      <div className={LOADING_STYLES.text}>
        <div className={LOADING_STYLES.spinner}></div>
        <span>{message}</span>
      </div>
    </div>
  );
}
