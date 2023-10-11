# api-demo-revel

Prueba tecnica para senior back-end developer en Node.js

## Como usar

### Prerequisitos

- Node.js `v20`.
- Docker.

### Instalación

1. Clonar el repositorio
2. Ejecutar el comando `npm install`, para instalar las dependencias.
3. Copiar el archivo `.env.template` como `.env`, reemplazar las variables de entorno si fuese necesario.

### Como desarrollar

1. Seguir los pasos de [instalación](#instalación).
2. Ejecutar el comando `docker compose up -d` para levantar una base de datos Postgres local.
3. Ejecutar el comando [`npm run dev`](#modo-desarrollo) para levantar el servidor.

### Como desplegar en producción

1. Seguir los pasos de [instalación](#instalación).
2. Configurar las variable de entorno:

   - `DATABASE_URL`: La URL a la base de datos postgres de producción.
   - `JWT_SECRET`: Una clave segura para firmar los tokens.
   - `NODE_ENV`: En producción siempre debe ser `production`.

3. Ejecutar el comando [`npm run dev`](#modo-desarrollo) para levantar el servidor.

### Comandos utiles

#### Modo desarrollo

Para ejecutar el servicio para trabajar en el mismo, el comando `npm run dev` permitirá levantar el servidor, reiniciandolo en cada cambio del mismo.

#### Lanzar los tests

Este comando ejecuta los tests de integración y unitarios. Recordemos que para poder ejecutar los tests de integración, hay que previamente levantar una base de datos (los datos que se introducen en los tests, o para los tests, se destruyen al final de los mismos).

```bash
npm run test
```

#### Base de datos

##### Lanzar migraciones

Ante cualquier cambio que se haya realizado en la base de datos (tablas, columnas, etc), se añadiran archivos `.sql` que contengan esos cambios. Para aplicarlos, con ejecutar el comando `npm run db:migrate` actualizará al base de datos.

##### Hidratar la base de datos

Si se necesitan, se pueden añadir datos de ejemplo introducidos previamente en un [_seeder_](./prisma/seed.ts), ejecutando el comando `npm run db:seed`. Actualmente se añade una cuenta de administrador con el email `admin@test.com` y la contraseña `Admin1` (con propositos demostrativos, no usar en producción).

##### Inspeccionar la base de datos

Aunque se puede utilizar herramientas como DataGrip o DBeaver para inspeccionar la base de datos postgres, no es necesario en este proyecto. Ejecutando el comando `npm run db:inspect` se accederá a un editor de base de datos en el navegador, para realizar operaciones rapidas (eliminar registros, cambiar datos, etc).

#### Compilar TypeScript

En producción se ejecuta código JavaScript, mientras que en desarrollo se desarrolla con TypeScript. Para compilar este codigo a JavaScript, ejecutaremos `npm run build`. Esto generará una carpeta `dist`, que es una copia de `src` pero en JavaScript. Si existen errores de tipos fallará esta compilación de forma intencionada, no debería desplegarse código con errores.

#### Ejecutar producción

Previamente [compilado el código TypeScript](#compilar-typescript), se lanzaría el comando `npm run start`.

## Roadmap

- **Registro y login de usuarios**
  - [x] Contraseñas cifradas
  - [x] Se devuelven tokens en JWT al hacer login.
- **Operaciones CRUD:**
  - [x] Crear reservas como usuario.
    - [x] Fecha de reserva (inicio, fin).
    - [x] Las reservas tendran un precio computado en base a los meses reservados.
    - [x] Se debe reservar minimo por 30 días.
    - [x] Los periodos de reserva deben ser cada 30 días. Si se eligen 31 días, se reservan 2 meses (60 días).
  - [x] Editar reservas.
    - [x] No se puede editar una reserva cancelada (ni por admins).
    - [x] Cambiar fecha de reserva (debe cambiar el precio)
    - [x] Cambiar coche (debe cambiar el precio)
  - [x] "Cancelar" reservas
    - [x] Como usuario las propias.
    - [x] Como admin cualquiera.
- **Sistema de busqueda**:
  - Busqueda incluyente de reservas por:
    - [x] Fecha (rango)
    - [x] Precio (rango)
    - [x] Estado (cancelado o no)
    - [x] Como admin se pueden buscar todas, como usuario las propias.
- **Base de datos**
  - [x] Postgres
  - [x] ORM (Prisma)
- **Tests**
  - [x] Implementar tests de integración
  - [ ] Crear informe de cobertura
  - [ ] Pipeline de CI (nice to have)
- **Seguridad**
  - [x] Error handling.
    - [ ] Log de errores con UUID.
  - [x] Validar datos desde el exterior.
  - [ ] CORS
  - [ ] HTTPS
