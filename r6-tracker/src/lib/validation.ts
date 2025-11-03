import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Formate les erreurs Zod en un objet lisible
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  
  return formatted;
}

/**
 * Retourne une réponse d'erreur de validation
 */
export function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: 'Erreur de validation',
      details: formatZodErrors(error),
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

/**
 * Valide les données avec un schéma Zod côté serveur
 * Retourne soit les données validées, soit une réponse d'erreur
 */
export function validateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, response: validationErrorResponse(error) };
    }
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Erreur de validation inconnue',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Valide les données côté client et retourne les erreurs
 */
export function validateClientData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string[]> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatZodErrors(error) };
    }
    return {
      success: false,
      errors: { _global: ['Erreur de validation inconnue'] },
    };
  }
}

/**
 * Extrait le premier message d'erreur pour chaque champ
 */
export function getFirstErrors(errors: Record<string, string[]>): Record<string, string> {
  const result: Record<string, string> = {};
  Object.keys(errors).forEach((key) => {
    result[key] = errors[key][0];
  });
  return result;
}
