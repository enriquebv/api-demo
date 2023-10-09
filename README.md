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
