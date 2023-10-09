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

## Historial de cambios

La idea de esta sección es dar mas comunicación sobre cada paso que se ha realizado en la prueba.

> ℹ️ **NO** es algo que haga en otros proyectos, pero me parece interesante tener un sitio donde poder hacer retrospectiva y documentar cada decisión tomada para valorar si fue el momento correcto de tomarla.

### Empezando

- Montar el proyecto (usando `npm`).
- Añadir TypeScript y generado archivo `tsconfig.json`.
  **¿Porque?**:
  - Quizas sea algo prematuro, pero la previsión de requisitos dice que tendremos que crear patrones estructurales.
  - TypeScript nos permitirá crear interfaces y otros contratos que deben ser cumplidos, creando errores explicitos si no se cumplen.
- Añadidas variables de entorno.
- Añadido express, usando el puerto que se ha añadido en la variable de entorno `process.env.PORT`.
- Añadida comprobación si no existe la variable de entorno `PORT`.

### Primeros endpoints

- Se ha elegido PostgreSQL como base de datos.
- Definicion de una [arquitectura](./ARCHITECTURE.md) simple.
- Se ha elegido [Prisma](https://www.prisma.io/) como ORM.
  **¿Porque?**
  - Muy sencillo de utilizar, con muy buen DX, ya que en base al modelo de datos definido en el archivo `.prisma`, genera las migraciones y el API del modulo `@prisma/client`.
  - Gracias a esa API generada (se crea automaticamente al ejecutar las migraciones) y al uso de TypeScript, contamos con test estaticos en la capa de infraestructura (repositorios).
- Añadimos un error handler global que se encarge de formatear errores de aplicación o JSON para el API. Si no se captura el error, se devolvera un 500 (Internal Server Error) sin mucha mas información para el exterior (por seguridad). En desarrollo los errores si se lanzan por consola.
- Añadimos endpoints de registro y login, validados con [Zod](https://zod.dev/).
  **¿Porque?**
  - Un validador muy sencillo, se define la forma del dato esperado, incluso pudiendo definir si esperamos un email, el numero maximo o minimo de caracteres, si es opcional, etc.
  - Los errores de validación pasan directamente al error handler global, y los pasa como respuestas `400` (BadRquest).
- Añadimos tests de integración de estos endpoints con `jest` y `supertest`.

### Endpoint de eliminación de usuarios

- Se ha añadido en endpoint `DELETE /api/users/:id` para eliminar usuarios. Solo funciona para usuarios admins.
- Se han añadido dos middlewares:

  - `withSession`: Se encarga de leer el JWT stateful que generamos previamente en el login/registro, y añade una propiedad `user` al objeto `Request` de express, en concepto de sesión de usuario.
  - `onlyAdmin`: En base a la sesión, se determina si la petición puede continuar al controlador, si no es así, se recibira un `Unauthorized 401`.

  ```ts
  router.post('/user/register', registerController) // 👈🏻 Sin sesión.
  router.post('/user/login', loginController) // 👈🏻 Sin sesión.
  router.delete('/user/:id', withSession, onlyAdmin, removeUserController) // 👈🏻 Con sesión, y solo para administradores.
  ```

> **👁️ Ojo**: Desde la concepción del proyecto, valoré la opción de hacer un token stateful, que es lo que existe hasta ahora. En principio tenia todo lo necesario y eliminaba la _complejidad accidental_ de crear un sistema de sesiones más complejo (memcached, Redis, etc), pero durante el desarrollo de este endpoint securizado me he dado cuenta de que el middleware `onlyAdmin` comprobaría en base al contenido del un token que dura 7 dias, por lo que aunque eliminasemos ese usuario, quien tenga ese token podrá seguir actuando como administrador. Esto es un problema de seguridad, ya que al no contar con un sistema de tokens mas complejo (acceso/refresco, se ha elegido un solo token por tiempos y velocidad de implementación) y al no comprobar si existe aun el usuario, o si sigue siendo admin, es un vector de ataque importante.
