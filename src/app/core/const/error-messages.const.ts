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
  // storage.service.ts es compartido por commerces/users/services (uploadLogo, uploadImage, addImages)
  // y no vive bajo un segmento de URL propio, por eso va en el catálogo genérico.
  STORAGE_UPLOAD_ERROR: 'No se pudo subir la imagen. Intenta nuevamente.',
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
    NOT_FOUND_SERVICE: 'Uno o más servicios seleccionados no son válidos para este comercio.',
    ASSIGN_SERVICES_ERROR: 'No se pudieron asignar los servicios al usuario.',
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
  // Endpoint público consumido por la landing de comercios (app-landing).
  'landing-commerces': {
    NOT_FOUND_COMMERCE: 'No encontramos un comercio con ese identificador. Verifica el enlace o el slug e inténtalo de nuevo.',
    COMMERCE_NOT_ACTIVE: 'Este comercio no está activo actualmente.',
    NOT_FOUND_BRANCH: 'La sucursal seleccionada ya no está disponible. Elige otra.',
    NOT_FOUND_PROFESSIONAL: 'El profesional seleccionado ya no está disponible. Elige otro.',
    NOT_FOUND_SERVICE: 'Uno de los servicios seleccionados ya no está disponible.',
    APPOINTMENT_TOKEN_NOT_FOUND: 'No encontramos ninguna cita con ese enlace. Verifica que sea correcto.',
    USER_NOT_SCHEDULED: 'El profesional no tiene horario disponible ese día. Elige otra fecha.',
    APPOINTMENT_OUTSIDE_SCHEDULE: 'Esa hora ya no está dentro del horario del profesional. Elige otra.',
    USER_ON_LICENSE: 'El profesional no está disponible en esa fecha u horario. Elige otro momento.',
    APPOINTMENT_TIME_CONFLICT: 'Justo se ocupó ese horario. Elige otro disponible.',
    APPOINTMENT_DURATION_REQUIRED: 'Selecciona al menos un servicio para poder agendar la cita.',
    AE_DOCUMENT_NUMBER_CONFLICT: 'Ya existe un cliente registrado con ese número de documento en este comercio.',
    NOT_FOUND_CUSTOMER: 'No encontramos ningún cliente con ese documento en este comercio.',
    INVALID_CUSTOMER_SELECTION: 'No puedes seleccionar un cliente existente y registrarte como uno nuevo al mismo tiempo.',
  },
  services: {
    NOT_FOUND_SERVICES: 'No hay servicios registrados.',
    NOT_FOUND_SERVICE: 'El servicio no existe.',
    AE_SERVICENAME_CONFLICT: 'Ya existe un servicio con ese nombre.',
    CREATE_ERROR: 'No se pudo crear el servicio. Intenta nuevamente.',
    UPDATE_ERROR: 'No se pudo actualizar el servicio. Intenta nuevamente.',
    MAX_IMAGES_REACHED: 'Este servicio ya alcanzó el máximo de 5 imágenes.',
    NO_IMAGES_PROVIDED: 'Selecciona al menos una imagen para subir.',
    INVALID_PRIMARY_INDEX: 'Ocurrió un error al marcar la imagen principal. Intenta de nuevo.',
  },
  appointments: {
    NOT_FOUND_APPOINTMENTS: 'No hay citas registradas.',
    NOT_FOUND_APPOINTMENT: 'La cita no existe.',
    COMMERCE_UUID_REQUIRED: 'Falta el identificador del comercio.',
    BRANCH_UUID_REQUIRED: 'Falta el identificador de la sucursal.',
    CREATE_ERROR: 'No se pudo crear la cita. Intenta nuevamente.',
    UPDATE_APPOINTMENT_ERROR: 'No se pudo actualizar la cita. Intenta nuevamente.',
    APPOINTMENT_COMPLETED_PROTECTED: 'No puedes editar una cita completada o cancelada.',
    APPOINTMENT_DURATION_REQUIRED: 'Selecciona al menos un servicio o indica la duración de la cita.',
    USER_NOT_SCHEDULED: 'El profesional seleccionado no tiene un horario activo ese día.',
    APPOINTMENT_OUTSIDE_SCHEDULE: 'La hora elegida está fuera del horario del profesional.',
    USER_ON_LICENSE: 'El profesional tiene una licencia aprobada en esa fecha y horario.',
    APPOINTMENT_TIME_CONFLICT: 'El profesional ya tiene otra cita en ese horario.',
    INVALID_APPOINTMENT_STATUS_TRANSITION: 'Esa cita ya no puede cambiar a ese estado. Actualiza la página e inténtalo de nuevo.',
    APPOINTMENT_NOT_FINALIZABLE: 'Esta cita no se puede finalizar en su estado actual.',
    NOT_FOUND_SEQUENCE: 'No se encontró la numeración de ventas configurada para este comercio. Habla con un administrador.',
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
