# Catálogo de códigos de error (OwnException)

Todas las respuestas de error generadas con `OwnException` tienen esta forma:

```json
{
  "statusCode": 409,
  "message": "mensaje técnico en el body",
  "error": "CODIGO_DE_ERROR"
}
```

El interceptor del front debe mapear por el campo **`error`** (el código), no por `message`,
porque el texto técnico puede cambiar y algunos módulos reutilizan el mismo mensaje para
distintos códigos.

---

## Auth (`auth.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `EC_AUTH` | 409 | Credenciales invalidas | Usuario o contraseña incorrectos. |
| `EC_RECOVER_NOT_FOUND` | 404 | No se encontró un usuario con esos datos | No encontramos una cuenta con ese usuario y correo. |

> `login()` también puede lanzar un `UnauthorizedException` estándar (401, sin `code`) cuando
> el usuario existe pero está inactivo ("La cuenta no está activa"). El interceptor debe tener
> un fallback para errores sin `code`.

---

## Users (`users.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_USERS` | 404 | Users not found | No hay usuarios registrados. |
| `NOT_FOUND_USER` | 404 | User not found / Usuario no encontrado | El usuario no existe. |
| `AE_USERNAME_CONFLICT` | 409 | User with the same username already exists for this commerce | Ya existe un usuario con ese nombre de usuario. |
| `AE_USERPHONE_CONFLICT` | 409 | User with the same userphone already exists for this commerce | Ya existe un usuario con ese teléfono. |
| `AE_USEREMAIL_CONFLICT` | 409 | User with the same useremail already exists for this commerce | Ya existe un usuario con ese correo electrónico. |
| `CREATE_ERROR` | 500 | Error al crear el usuario | No se pudo crear el usuario. Intenta nuevamente. |
| `UPDATE_ERROR` | 500 | Error al actualizar la usuario / Error updating user status | No se pudo actualizar el usuario. Intenta nuevamente. |
| `ASSIGN_ROLES_ERROR` | 500 | Error al asignar los roles del usuario | No se pudieron asignar los roles al usuario. |
| `LAST_OWNER_PROTECTED` | 409 | No se puede eliminar o inactivar al último administrador del comercio | No puedes eliminar o inactivar al último administrador del comercio. |

---

## Branches (`branches.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_BRANCHES` | 404 | Branches not found | No hay sucursales registradas. |
| `NOT_FOUND_BRANCH` | 404 | Branch not found / Sucursal no encontrada | La sucursal no existe. |
| `AE_NAME_CONFLICT` | 409 | Branch with the same branchname already exists for this commerce | Ya existe una sucursal con ese nombre. |
| `AE_ADDRESS_CONFLICT` | 409 | Branch with the same branchaddress already exists for this commerce | Ya existe una sucursal con esa dirección. |
| `CREATE_ERROR` | 500 | Error al crear la sucursal | No se pudo crear la sucursal. Intenta nuevamente. |
| `UPDATE_ERROR` | 500 | Error al actualizar la sucursal / Error updating branch status | No se pudo actualizar la sucursal. Intenta nuevamente. |
| `LAST_BRANCH_PROTECTED` | 409 | No se puede eliminar o inactivar la última sucursal activa del comercio | No puedes eliminar o inactivar la última sucursal activa del comercio. |

---

## Customers (`customers.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_CUSTOMERS` | 404 | Customers not found | No hay clientes registrados. |
| `NOT_FOUND_CUSTOMER` | 404 | Customer not found | El cliente no existe. |
| `AE_DOCUMENT_NUMBER_CONFLICT` | 409 | Customer with the same customerdocumentnumber already exists for this commerce | Ya existe un cliente con ese número de documento. |
| `CREATE_ERROR` | 500 | Error al crear el cliente final | No se pudo crear el cliente. Intenta nuevamente. |
| `UPDATE_ERROR` | 500 | Error al actualizar el cliente | No se pudo actualizar el cliente. Intenta nuevamente. |

---

## Categories (`categories.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_CATEGORIES` | 404 | Categories not found | No hay categorías registradas. |
| `NOT_FOUND_CATEGORY` | 404 | Categoria no encontrada | La categoría no existe. |
| `AE_NAME_CATEGORY` | 409 | Category name already exists for this commerce | Ya existe una categoría con ese nombre. |
| `CREATE_ERROR` | 500 | Error al Crear la categoria | No se pudo crear la categoría. Intenta nuevamente. |
| `UPDATE_ERROR` | 500 | Error al actualizar la categoria / Error updating category status | No se pudo actualizar la categoría. Intenta nuevamente. |

---

## Commerces (`commerces.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_COMMERCE` | 404 | Commerce not found | El comercio no existe. |
| `NOT_FOUND_USER` | 404 | User not found | El usuario no existe. |
| `AE_SLUG_CONFLICT` | 409 | Commerce slug already exists | Ese identificador (slug) ya está en uso. |
| `AE_DOCUMENT_CONFLICT` | 409 | Commerce document number already exists | Ya existe un comercio con ese número de documento. |
| `AE_USERNAME_CONFLICT` | 409 | Username already exists | Ese nombre de usuario ya está en uso. |
| `AE_USEREMAIL_CONFLICT` | 409 | User email already exists | Ese correo electrónico ya está en uso. |
| `CREATE_ERROR` | 500 | Error creating commerce. Please try again. / Error creating commerce setup. Please try again. | No se pudo crear el comercio. Intenta nuevamente. |

---

## Services (`services.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_SERVICES` | 404 | Services not found | No hay servicios registrados. |
| `NOT_FOUND_SERVICE` | 404 | Service not found / Servicio no encontrado / Categoria no encontrada | El servicio no existe. |
| `AE_SERVICENAME_CONFLICT` | 409 | Service name already exists for this commerce | Ya existe un servicio con ese nombre. |
| `CREATE_ERROR` | 500 | Error creating service. Please try again. | No se pudo crear el servicio. Intenta nuevamente. |
| `UPDATE_ERROR` | 500 | Error al actualizar el servicio / Error updating service status | No se pudo actualizar el servicio. Intenta nuevamente. |
| `MAX_IMAGES_REACHED` | 409 | El servicio solo admite 5 imágenes en total (ya tiene X, quedan Y disponibles) | Este servicio ya alcanzó el máximo de 5 imágenes. |
| `NO_IMAGES_PROVIDED` | 400 | Debes enviar al menos una imagen | Selecciona al menos una imagen para subir. |
| `INVALID_PRIMARY_INDEX` | 400 | primaryindex está fuera del rango de imágenes enviadas | Ocurrió un error al marcar la imagen principal. Intenta de nuevo. |

---

## Sales (`sales.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_SALES` | 404 | Sales not found | No hay ventas registradas. |
| `NOT_FOUND_SALE` | 404 | Sale not found | La venta no existe. |
| `NOT_FOUND_SEQUENCE` | 404 | Sequence not found | No se encontró la secuencia de numeración para el comercio. |
| `COMMERCE_UUID_REQUIRED` | 400 | Commerce uuid is required | Falta el identificador del comercio. |
| `BRANCH_UUID_REQUIRED` | 400 | Branch uuid is required | Falta el identificador de la sucursal. |
| `CREATE_ERROR` | 500 | Error al crear la venta | No se pudo crear la venta. Intenta nuevamente. |
| `NOT_FOUND_SALE_DETAIL` | 404 | Sale detail not found | El detalle de la venta no existe. |
| `CREATE_SALE_DETAIL_ERROR` | 500 | Error al agregar el detalle de la venta | No se pudo agregar el producto o servicio a la venta. |
| `REMOVE_SALE_DETAIL_ERROR` | 500 | Error al eliminar el detalle de la venta | No se pudo eliminar el detalle de la venta. |
| `SALE_PENDING_PROTECTED` | 409 | Solo se pueden editar ventas pendientes | Solo puedes editar ventas que estén pendientes. |
| `UPDATE_SALE_ERROR` | 500 | Error al actualizar la venta | No se pudo actualizar la venta. Intenta nuevamente. |
| `UPDATE_SALE_DETAIL_ERROR` | 500 | Error al actualizar el detalle de la venta | No se pudo actualizar el detalle de la venta. |

> `NOT_FOUND_SEQUENCE` también puede aparecer al generar el consecutivo de pagos, ya que
> `payments.service.ts` reutiliza `sales.service.ts` → `next()` para eso.

---

## Payments (`payments.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_PAYMENT` | 404 | Payments not found / Payment not found | El pago no existe. |
| `NOT_FOUND_SALE` | 404 | Sale not found | La venta no existe. |
| `SALE_STATUS_ERROR` | 406 | Sale is finished | Esta venta ya está finalizada, no se pueden registrar más pagos. |
| `PAYMENT_EXCEEDS_PENDING` | 400 | El monto del pago no puede ser mayor a la deuda pendiente | El monto ingresado supera la deuda pendiente de la venta. |
| `CREATE_PAYMENT_ERROR` | 500 | Error al crear el pago | No se pudo registrar el pago. Intenta nuevamente. |
| `PAYMENT_METHODS_FETCH_ERROR` | 502 / 500 | Error al obtener los metodos de pago | No se pudieron cargar los métodos de pago disponibles. |

---

## Schedules (`schedules.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_SCHEDULES` | 404 | Schedules not found | No hay horarios registrados. |
| `NOT_FOUND_SCHEDULE` | 404 | Schedule not found / Schedule not found after update / Schedule no encontrado | El horario no existe. |
| `AE_SCHEDULE` | 409 | Schedule already exists for this user | Ya existe un horario con esos datos para este usuario. |
| `SCHEDULE_NOT_FOUND` | 404 | Schedule not found (en `clone`) | El horario que quieres clonar no existe. |
| `INVALID_USER` | 400 | The schedule already belongs to this user | Este horario ya pertenece a ese usuario. |
| `CREATE_ERROR` | 500 | Error create schedule | No se pudo crear el horario. Intenta nuevamente. |
| `UPDATE_ERROR` | 500 | Error update schedule / Error updating schedule status | No se pudo actualizar el horario. Intenta nuevamente. |
| `CLONE_ERROR` | 500 | Error clone schedule | No se pudo clonar el horario. Intenta nuevamente. |

> `clone()` usa `SCHEDULE_NOT_FOUND` para el mismo caso ("horario no encontrado") que en
> `update()`/`changeStatus()` usa `NOT_FOUND_SCHEDULE`. Es una inconsistencia existente en el
> código; el interceptor del front debe mapear ambos códigos al mismo mensaje hasta que se
> unifique en el backend.

---

## Appointments (`appointments.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_APPOINTMENTS` | 404 | Appointments not found | No hay citas registradas. |
| `NOT_FOUND_APPOINTMENT` | 404 | Appointment not found | La cita no existe. |
| `COMMERCE_UUID_REQUIRED` | 400 | Commerce uuid is required | Falta el identificador del comercio. |
| `BRANCH_UUID_REQUIRED` | 400 | Branch uuid is required | Falta el identificador de la sucursal. |
| `CREATE_ERROR` | 500 | Error al crear la cita | No se pudo crear la cita. Intenta nuevamente. |
| `UPDATE_APPOINTMENT_ERROR` | 500 | Error al actualizar la cita | No se pudo actualizar la cita. Intenta nuevamente. |
| `APPOINTMENT_COMPLETED_PROTECTED` | 409 | Completed or Cancelled appointments cannot be edited. | No puedes editar una cita completada o cancelada. |

> `COMMERCE_UUID_REQUIRED` y `BRANCH_UUID_REQUIRED` son los mismos códigos que usa
> `sales.service.ts`; comparten significado en toda la app.

---

## License (`license.service.ts`)

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `NOT_FOUND_LICENSES` | 404 | Licenses not found | No hay licencias registradas. |
| `NOT_FOUND_LICENSE` | 404 | License not found | La licencia no existe. |
| `NOT_FOUND_USER` | 404 | Usuario no encontrado | El usuario no existe. |
| `AE_LICENSE` | 409 | License already exists for this user | Ya existe una licencia de ese tipo y periodo para este usuario. |
| `LICENSE_STATUS_PROTECTED` | 409 | Rejected or expired licenses cannot be edited. | No puedes editar una licencia rechazada o vencida. |
| `INVALID_STATUS_TRANSITION` | 409 | Cannot change license status from X to Y | No se puede cambiar la licencia a ese estado desde su estado actual. |
| `CREATE_ERROR` | 500 | Error create license | No se pudo crear la licencia. Intenta nuevamente. |
| `UPDATE_ERROR` | 500 | Error update license / Error updating license status | No se pudo actualizar la licencia. Intenta nuevamente. |

> `updateStatus()` solo permite transiciones válidas: `REQUESTED → APPROVED/REJECTED`,
> `APPROVED → REJECTED/EXPIRED`. `REJECTED` y `EXPIRED` son estados terminales (sin transiciones
> salientes); cualquier otro salto responde `INVALID_STATUS_TRANSITION`.

---

## Storage (`storage.service.ts`) — compartido por `commerces`, `users` y `services`

| Código | HTTP | Mensaje técnico | Mensaje sugerido para el usuario |
|---|---|---|---|
| `STORAGE_UPLOAD_ERROR` | 500 | Error al subir el archivo | No se pudo subir la imagen. Intenta nuevamente. |

> Este código puede aparecer en cualquier flujo que suba archivos a Cloudflare: `uploadLogo`
> (commerces), `uploadImage` (users) y `addImages` (services).

---

## Roles (`roles.service.ts`) — sin códigos propios

Este módulo **no** usa `OwnException`, así que sus errores no traen un `code` identificable, solo
`statusCode` + `message` estándar de Nest:

| HTTP | Mensaje | Origen |
|---|---|---|
| 404 | Role not found | `NotFoundException` |
| 409 | Role name already exists for this commerce | `ConflictException` |
| 409 | No se puede eliminar el rol principal del comercio | `ConflictException` |
| 400 | One or more roles do not belong to this commerce | `BadRequestException` |

El interceptor tendrá que hacer fallback por `statusCode` + coincidencia de `message` para este
módulo, o bien conviene migrarlo a `OwnException` con códigos (`NF_ROLE`, `AE_NAME_ROLE`,
`LAST_ROLE_PROTECTED`, `ROLES_NOT_IN_COMMERCE`, por ejemplo) para que sea consistente con el resto.

---

## Recomendación para el interceptor

1. Mapear por `error.response.error` (el `code`) primero.
2. Si no hay `code` (por ejemplo, errores de `roles` o excepciones de Nest/validación no
   controladas), hacer fallback a un mensaje genérico según `statusCode`
   (400 → "Datos inválidos", 401 → "No autorizado", 403 → "No tienes permisos",
   404 → "No encontrado", 409 → "Conflicto con datos existentes", 500 → "Error del servidor").
3. Tratar como **no error** los códigos de éxito devueltos junto con 200 (no vienen de
   `OwnException`, son parte del body normal): `RECOVER_OK`, `PASSWORD_MODIFIED`,
   `STATUS_UPDATED`, `USER_REMOVED`, `BRANCH_REMOVED`, `STATUS_CHANGED`, `CATEGORY_REMOVED`,
   `SERVICE_REMOVED`.
