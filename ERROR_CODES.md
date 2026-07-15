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
   `STATUS_UPDATED`, `USER_REMOVED`, `BRANCH_REMOVED`, `STATUS_CHANGED`, `CATEGORY_REMOVED`.
