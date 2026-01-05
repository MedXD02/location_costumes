// Utilitaires pour la gestion du réseau

/**
 * Vérifie si l'erreur est une erreur de connexion réseau
 */
export const isNetworkError = (error) => {
  return (
    error.message === 'Network Error' ||
    error.message.includes('Network request failed') ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
  );
};

/**
 * Obtient un message d'erreur convivial
 */
export const getErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et que le serveur est démarré.';
  }
  
  if (error.response) {
    // Erreur de réponse du serveur
    const status = error.response.status;
    if (status === 404) {
      return 'Ressource introuvable';
    } else if (status === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    } else if (status === 422) {
      return error.response.data?.message || 'Données invalides';
    }
    return error.response.data?.message || 'Une erreur est survenue';
  }
  
  return error.message || 'Une erreur inattendue est survenue';
};

/**
 * Obtient l'adresse IP locale (pour développement)
 */
export const getLocalIP = () => {
  // Cette fonction devrait être appelée côté serveur ou via une API
  // Pour l'instant, retourne null et l'utilisateur doit configurer manuellement
  return null;
};


