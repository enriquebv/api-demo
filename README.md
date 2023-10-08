# api-demo-revel

Prueba tecnica para senior back-end developer en Node.js

## Como usar

### Prerequisitos

- Node.js `v20`.
- Docker.

### Instalación y uso

1. Clonar el repositorio
2. Ejecutar el comando `npm install`, para instalar las dependencias.
3. Ejecutar el comando `docker compose up -d` para levantar otros servicos, como base de datos, etc.
4. Copiar el archivo `.env.template` como `.env`, reemplazar las variables de entorno si fuese necesario.
5. Ya se puede levantar el servicio con el comando [`npm run dev`](#modo-desarrollo).

### Como desplegar en producción

### Comandos utiles

#### Modo desarrollo

#### Crear `dist`

#### Ejecutar `dist`

## Historial de cambios

La idea de esta sección es dar mas comunicación sobre cada paso que se ha realizado en la prueba.

> ℹ️ **NO** es algo que haga en otros proyectos, pero me parece interesante tener un sitio donde poder hacer retrospectiva y documentar cada decisión tomada para valorar si fue el momento correcto de tomarla.

### Commit #1: Initial commit

- Montar el proyecto (usando `npm`).
- Añadir TypeScript y generado archivo `tsconfig.json`.
  - **¿Porque TypeScript?**:
    - Quizas sea algo prematuro, pero la previsión de requisitos dice que tendremos que crear patrones estructurales.
    - TypeScript nos permitirá crear interfaces y otros contratos que deben ser cumplidos, creando errores explicitos si no se cumplen.
- Añadidas variables de entorno.
- Añadido express, usando el puerto que se ha añadido en la variable de entorno `process.env.PORT`.

### Commit #2: Add env guard

- Añadida comprobación si no existe la variable de entorno `PORT`.
