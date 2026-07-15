export type ErrorCodeMap = Record<string, string>;

/**
 * Mensajes válidos para todos los módulos, usados cuando el código no tiene
 * una entrada más específica en MODULE_ERROR_MESSAGES para ese módulo.
 */
export const GENERIC_ERROR_MESSAGES: ErrorCodeMap = {
  NOT_FOUND_USER: 'El usuario no existe.',
  AE_USERNAME_CONFLICT: 'Ese nombre de usuario ya está en uso.',
  AE_USEREMAIL_CONFLICT: 'Ese correo electrónico ya está en uso.',
  CREATE_ERROR: 'No se pudo completar el registro. Inténtalo nuevamente.',
  UPDATE_ERROR: 'No se pudo completar la actualización. Inténtalo nuevamente.',
};

/**
 * Catálogo de códigos de OwnException por módulo (ver ERROR_CODES.md).
 * La clave de cada módulo debe coincidir con el segmento de la URL del
 * endpoint (ej. BACK_URL/branches/v1 -> 'branches').
 */
export const MODULE_ERROR_MESSAGES: Record<string, ErrorCodeMap> = {
  auth: {
    EC_AUTH: 'Usuario o contraseña incorrectos.',
    EC_RECOVER_NOT_FOUND: 'No encontramos una cuenta con ese usuario y correo.',
  },
  users: {
    NOT_FOUND_USERS: 'No hay usuarios registrados.',
    NOT_FOUND_USER: 'El usuario no existe.',
    AE_USERNAME_CONFLICT: 'Ya existe un usuario con ese nombre de usuario.',
    AE_USERPHONE_CONFLICT: 'Ya existe un usuario con ese teléfono.',
    AE_USEREMAIL_CONFLICT: 'Ya existe un usuario con ese correo electrónico.',
    CREATE_ERROR: 'No se pudo crear el usuario. Intenta nuevamente.',
    UPDATE_ERROR: 'No se pudo actualizar el usuario. Intenta nuevamente.',
    ASSIGN_ROLES_ERROR: 'No se pudieron asignar los roles al usuario.',
    LAST_OWNER_PROTECTED: 'No puedes eliminar o inactivar al último administrador del comercio.',
  },
  branches: {
    NOT_FOUND_BRANCHES: 'No hay sucursales registradas.',
    NOT_FOUND_BRANCH: 'La sucursal no existe.',
    AE_NAME_CONFLICT: 'Ya existe una sucursal con ese nombre.',
    AE_ADDRESS_CONFLICT: 'Ya existe una sucursal con esa dirección.',
    CREATE_ERROR: 'No se pudo crear la sucursal. Intenta nuevamente.',
    UPDATE_ERROR: 'No se pudo actualizar la sucursal. Intenta nuevamente.',
    LAST_BRANCH_PROTECTED: 'No puedes eliminar o inactivar la última sucursal activa del comercio.',
  },
  customers: {
    NOT_FOUND_CUSTOMERS: 'No hay clientes registrados.',
    NOT_FOUND_CUSTOMER: 'El cliente no existe.',
    AE_DOCUMENT_NUMBER_CONFLICT: 'Ya existe un cliente con ese número de documento.',
    CREATE_ERROR: 'No se pudo crear el cliente. Intenta nuevamente.',
    UPDATE_ERROR: 'No se pudo actualizar el cliente. Intenta nuevamente.',
  },
  categories: {
    NOT_FOUND_CATEGORIES: 'No hay categorías registradas.',
    NOT_FOUND_CATEGORY: 'La categoría no existe.',
    AE_NAME_CATEGORY: 'Ya existe una categoría con ese nombre.',
    CREATE_ERROR: 'No se pudo crear la categoría. Intenta nuevamente.',
    UPDATE_ERROR: 'No se pudo actualizar la categoría. Intenta nuevamente.',
  },
  commerces: {
    NOT_FOUND_COMMERCE: 'El comercio no existe.',
    NOT_FOUND_USER: 'El usuario no existe.',
    AE_SLUG_CONFLICT: 'Ese identificador (slug) ya está en uso.',
    AE_DOCUMENT_CONFLICT: 'Ya existe un comercio con ese número de documento.',
    AE_USERNAME_CONFLICT: 'Ese nombre de usuario ya está en uso.',
    AE_USEREMAIL_CONFLICT: 'Ese correo electrónico ya está en uso.',
    CREATE_ERROR: 'No se pudo crear el comercio. Intenta nuevamente.',
  },
};

/**
 * El módulo de roles no usa OwnException (sin campo `error`), así que se
 * reconoce por coincidencia de texto sobre el mensaje técnico de Nest.
 */
export const ROLE_MESSAGE_FALLBACKS: Array<{ match: RegExp; message: string }> = [
  { match: /role not found/i, message: 'El rol no existe.' },
  { match: /role name already exists/i, message: 'Ya existe un rol con ese nombre.' },
  { match: /no se puede eliminar el rol principal/i, message: 'No puedes eliminar el rol principal del comercio.' },
  { match: /do not belong to this commerce/i, message: 'Uno o más roles seleccionados no son válidos.' },
];

/**
 * Fallback genérico por statusCode cuando no hay `error` (code) reconocible
 * ni coincidencia de mensaje (ver "Recomendación para el interceptor" en ERROR_CODES.md).
 */
export const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  400: 'Datos inválidos. Revisa la información e inténtalo nuevamente.',
  401: 'No autorizado. Inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No encontrado.',
  409: 'Conflicto con datos existentes.',
  500: 'Error del servidor. Inténtalo más tarde.',
};

export const DEFAULT_ERROR_MESSAGE = 'Ocurrió un error inesperado. Inténtalo nuevamente.';
