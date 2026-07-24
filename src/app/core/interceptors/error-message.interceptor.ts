import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorGlobalException } from '../exceptions/error.interface';
import {
  DEFAULT_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGES,
  MODULE_ERROR_MESSAGES,
  ROLE_MESSAGE_FALLBACKS,
  STATUS_FALLBACK_MESSAGES,
} from '../const/error-messages.const';

function resolveModule(url: string): string | null {
  return Object.keys(MODULE_ERROR_MESSAGES).find(key => url.includes(`/${key}/`)) ?? null;
}

function resolveFriendlyMessage(url: string, err: HttpErrorResponse, body: Partial<ErrorGlobalException> | null): string {
  const code = body?.error;

  if (code) {
    const moduleKey = resolveModule(url);
    const moduleMessage = moduleKey ? MODULE_ERROR_MESSAGES[moduleKey][code] : undefined;
    if (moduleMessage) return moduleMessage;
    if (GENERIC_ERROR_MESSAGES[code]) return GENERIC_ERROR_MESSAGES[code];
  }

  if (body?.message) {
    const roleFallback = ROLE_MESSAGE_FALLBACKS.find(f => f.match.test(body.message!));
    if (roleFallback) return roleFallback.message;
  }

  return STATUS_FALLBACK_MESSAGES[err.status] ?? DEFAULT_ERROR_MESSAGE;
}

/**
 * Normaliza los errores HTTP de todos los módulos a un mensaje en español
 * apto para mostrar al usuario, mapeando por el código `error` del catálogo
 * en ERROR_CODES.md (nunca por `message`, que puede cambiar en el backend).
 *
 * Conserva `body.error` (el code) intacto para que los componentes que ya
 * hacen su propio switch sobre códigos puntuales (ej. AE_NAME_CONFLICT)
 * sigan funcionando igual; solo reescribe `body.message`.
 */
export const errorMessageInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const body = (err.error && typeof err.error === 'object') ? err.error as Partial<ErrorGlobalException> : null;
      const friendlyMessage = resolveFriendlyMessage(req.url, err, body);

      const normalized = new HttpErrorResponse({
        error: { ...(body ?? {}), message: friendlyMessage },
        headers: err.headers,
        status: err.status,
        statusText: err.statusText,
        url: err.url ?? undefined,
      });

      return throwError(() => normalized);
    })
  );
};
