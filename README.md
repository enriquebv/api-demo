# api-demo

Servicio de ejemplo con Express, Prisma (ORM), Postgres y TypeScript.

## Funcionalidades:

- Registrarse (como cliente)
- Hacer login (como usuario o admin)
- Poder crear reservas de coches (_el recurso de ejemplo elegido_).
- Se puede editar y cancelar estas reservas.
- Se puede buscar las reservas propias, o como admin, las de todos los clientes, a traves de diferentes criterios (rangos de fecha, precio, coches, texto de la descripción, etc).
- Migraciones y seeders.

## Indice

- [Como usar](#como-usar)
  - [Prerequisitos](#prerequisitos)
  - [Instalación](#instalación)
  - [Como desarrollar](#como-desarrollar)
  - [Comandos utiles](#comandos-utiles)
    - [Modo desarrollo](#modo-desarrollo)
    - [Lanzar los tests](#lanzar-los-tests)
    - [Base de datos](#base-de-datos)
      - [Lanzar migraciones](#lanzar-migraciones)
      - [Hidratar la base de datos](#hidratar-la-base-de-datos)
      - [Inspeccionar la base de datos](#inspeccionar-la-base-de-datos)
    - [Compilar TypeScript](#compilar-typescript)
    - [Ejecutar producción](#ejecutar-producción)
- [Arquitectura](#arquitectura)
- [Postman](#postman)
- [Roadmap](#roadmap)

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
3. Ejecutar migraciones `npm run db:migrate` (quizas debas esperar a que el servidor Postgres esté 100% levantado).
4. Ejecutar el comando [`npm run dev`](#modo-desarrollo) para levantar el servidor.

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

```bash
npm run db:migrate
```

Ante cualquier cambio que se haya realizado en la base de datos (tablas, columnas, etc), se añadiran archivos `.sql` que contengan esos cambios.

##### Hidratar la base de datos

```bash
npm run db:seed
```

Si se necesitan, se pueden añadir datos de ejemplo introducidos previamente en un [_seeder_](./prisma/seed.ts).

##### Inspeccionar la base de datos

```bash
npm run db:inspect
```

Levanta en el puerto :5555 un editor de base de datos en el navegador.

#### Compilar TypeScript

```bash
npm run build
```

Esto generará una carpeta `dist`, que es una copia de `src` pero en JavaScript. Si existen errores de tipos fallará esta compilación de forma intencionada, no debería desplegarse código con errores.

#### Ejecutar producción

```bash
npm run start
```

Previamente [compilado el código TypeScript](#compilar-typescript).

## Arquitectura

Si quieres comprobar la estructura del código en el proyecto [consulta este documento](./ARCHITECTURE.md).

## Postman

Para probar el API disponible, se puede utilizar la [colección añadida en el repositorio](./postman.json).

- Hay que recordar que ciertos endpoints utilizan un token bearer, generado previamente por el endpoint de login. Una vez generado, es necesario actualizar esa cabecera `Authorization` en cada endpoint.
- Lanzando el seeder se genera el usuario administrador en la base de datos con el que poder crear un token de administrador al hacer login.

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
  - [x] Implementar tests unitarios
- **Seguridad**
  - [x] Error handling.
  - [x] Validar datos desde el exterior.
  - [x] CORS
  - [x] HTTPS
