# Arquitectura

Documento donde seguir el rastro a los invariantes de arquitectura del proyecto.

> **¿Que es un invariante de arquitectura?**
>
> - Principio o propiedad que debe ser respetada en todas las fases del diseño y desarrollo para garantizar la coherencia, estabilidad y correcto funcionamiento del sistema.
> - No se establecen arbitrariamente ni dependen de la voluntad de una sola persona. En cambio, se definen basados en requerimientos funcionales, no funcionales, estándares de la industria, **y del equipo**, y pueden cambiar para llegar a consensos con el objetivo de mejorar esta arquitectura.

## Motivacion

Queremos una arquitectura que permita iteración rapida de funcionalidades, de una forma mantenible y que preserve la calidad interna. Cuando creamos una arquitectura donde tenemos que hacer muchos pasos para hacer algo simple, o donde para hacer algo simple tenemos que sacrificar calidad interna, la arquitectura falla en su proposito.

> _Un objetivo eterno de la ingeniería de software ha sido separar el código que cambia con frecuencia del código que es estable._
>
> ~ James Coplien / Lean Architecture

## Capas

### Infraestructura
Se encarga de orquestar la comunicación con el exterior (APIs, usuarios, bases de datos) con la aplicación. Esta capa actúa como un puente entre el mundo externo y la lógica interna de la aplicación, garantizando que los datos se transmitan de manera eficiente y segura.

### Aplicación

Contiene la lógica de negocio. Usa las demás capas (entidades, repositorios) para ejecutar acciones que representen casos de uso del negocio. Es el corazón del sistema, donde se toman decisiones y se ejecutan acciones basadas en las reglas del negocio.

### Dominio

Da forma en código al negocio. Esta capa define las entidades y las reglas que rigen el comportamiento del sistema. Es esencial que esta capa esté bien definida y estructurada, ya que representa la esencia del negocio y sus operaciones.

### ¿Buscamos el desacoplamiento total?

No, y muchas veces perseguir este objetivo crea ineficiencias, diseños especulativos y abstracciones prematuras. El desacoplamiento es más un resultado de un buen diseño de arquitectura, para poder mantener las diferentes piezas de nuestro código que evolucinan a velocidades diferentes.

### Estructura de archivos

```
<root>/
├─ src/
│  ├─ controllers/  👈🏻 Controladores de express
│  ├─ entities/     👈🏻 Tipos e interfaces del dominio
│  ├─ lib/          👈🏻 Lógica que no encaja en el resto de secciones
│  ├─ repositories/ 👈🏻 Acceso a APIs y bases de datos
│  ├─ use-cases/    👈🏻 Casos de uso
│  ├─ index.ts      👈🏻 Punto de entrada de la aplicación
│  ├─ server.ts     👈🏻 Donde construimos las rutas de express
```

Se ha creado una estructura de archivos simple bajo la carpeta `src/`, que permite añadir y mantener de forma atomica cada capa de la aplicación.

#### Capa de infraestructura

Estos son los repositorios `src/repositories` y los controladores `src/controllers`.

##### Repositorios

Contando con un [patrón estructural de fachada](https://refactoring.guru/es/design-patterns/facade), se proporcionan clases (que cada una representa una entidad del dominio, o una tabla/colección de la base de datos) que exponen una interfaz muy sencilla para operar con la base de datos. La idea de esta interfaz es que no use ni devuelva estructuras de datos de la base de datos subyacente (o del ORM), ya que en este caso estariamos acoplando las diferentes capas de la aplicación a ese motor de base de datos o ese ORM.

- Consideramos invariante de arquitectura que un repositorio solo puede recibir y devolver _entidades_, deben ocultar el motor interno de base de datos.
- Los archivos deben terminar en `<nombre>.repository.ts`.
- Las clases deben terminar en `<nombre>Repository`.
- Deben importarse del archivo `src/repositories/index.ts`, el cual se encarga de "construir" los repositorios.

##### Controladores

Se encargan del control de acceso a los recursos de la aplicación, y de devolver información al exterior. No deben contener lógica, ya que esa responsabilidad pertenece a los casos de uso, solo deben preparar esos datos del exterior para que sean validos para la lógica de negocio. Generalmente llaman a una función de caso de uso (`src/actions`), pasandole lo que necesita (generalmente, una entidad y un repositorio).

> **🤔 "Pero si mi lógica fuese muy simple, ¿porque no llamo directamente al metodo del repositorio?"**: Tecnicamente, no deberiamos ejecutar lógica de negocio en esta capa, ya que hacerlo de esta forma haría que no fuese simetrica la imlementación y sería sencillo caer en "bueno, ahora si son dos lineas tampoco hace falta".
>
> Pero **esta arquitectura lo permite** siempre y cuando seamos responsables en el futuro de detectar cuando sera necesario mover ese código a su caso de uso (por repetición, etc).

```ts
// login.controller.ts

const LoginBodyValidator = z.object({
  email: z.string(),
  password: z.string(),
})

const loginController = asyncController(async (req, res) => {
  const body = LoginBodyValidator.parse(req.body) // 💡 Aqui se realiza la validación del body, y a la vez se le da forma.
  const response = await loginUseCase(body, userRepository)

  res.send(response)
})

export default loginController
```

- Los archivos deben terminar en `<nombre>.controller.ts`.
- Los metodos deben terminar en `<nombre>Controller`.
- Si el controlador es una función asincrona, debe utilizar `asyncController` como en el ejemplo. Esto permitirá que los errores del controlador lleguen hasta el error handler.
- Se utiliza `zod` para validar los datos, ya que permite de forma muy simple, comprobar que los datos cumplen los requisitos, totalmente configurables. Si no pasa la validación, se emitirá un error que el error handler recogerá para proporcionarlo de forma legible:

  ```json
  // Respuesta de ejemplo cuando sucede un error durante el registro porque los datos no son correctos.

  {
    "error": {
      "code": "BadRequest",
      "reasons": [
        "name: String must contain at least 1 character(s)",
        "email: Invalid email",
        "password: String must contain at least 4 character(s)",
        "password: Password must contain an uppercase and a number."
      ]
    }
  }
  ```

#### Capa de aplicación

Esto son los casos de uso `src/use-cases`.

Aqui es donde se ejecutan llamadas a repositorios, usando entidades como fuente de datos, y contiene el core de las lógica de negocio. Es una de las partes más importantes, y que más se debería asegurar, ya que es donde reside el valor del negocio. Al final, un framework de routing (express) o un motor de base de datos se pueden reemplazar, pero la lógica de negocio deberia permanecer inmutable, y evoluciona a ritmos completamente diferentes que estos aspectos. Podremos escalar la base de datos sin que cambie nuestro negocio, o nuestro negocio puede cambiar sin que cambie la infraestrutura, pero cambios en cada ambito no debería suponer un cambio en los dos.

```ts
// login.use-case.ts

export default async function loginUseCase(
  credentials: { email: string; password: string },
  userRepository: UserRepository
) {
  const user = await userRepository.getUserByEmail(credentials.email)
  const isValidPassword = await compareHashedPassword(credentials.password, user.password)

  if (!isValidPassword) {
    throw new InvalidPasswordError()
  }

  return await createUserStatefulTokenUseCase(user)
}
```

**Invariantes de arquitectura:**

- Los archivos deben terminar en `<nombre>.use-case.ts`.
- Las funciones deben terminar en `<nombre>UseCase`.
- Tambien por estes motivo, se pasan repositorios, los cuales esconden la implementación de base de datos real, protegiendo a esta logica de negocio de cambios en este ambito.

#### Dominio

Aqui es donde estan las entidades `src/entities`.

Generalmente son interfaces o tipos (aunque pueden ser clases), que definen una forma del negocio. Por ejemplo, un usuario es algo que existe en el negocio, por lo que definimos su forma en código con la interfaz `UserEntity`.

- Los archivos deben terminar en `<nombre>.entity.ts`.
- Las entidades deben terminar en `<nombre>Entity`.

```ts
// user.entity.ts

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserEntity {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
}

export type UserToCreateEntity = Pick<UserEntity, 'name' | 'email' | 'password'>
```
