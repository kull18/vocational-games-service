# Vocational Games Service

Microservicio de juegos vocacionales para el proyecto **Oriéntate+**, desarrollado en TypeScript, utilizando Express.js, PostgreSQL y siguiendo de forma estricta los principios de la **Arquitectura Hexagonal**.

## Arquitectura y Directorios

El microservicio está organizado siguiendo una arquitectura hexagonal desacoplada donde el dominio no depende de ningún framework o biblioteca externa:

*   **src/domain**: Capa pura que contiene las entidades de negocio (`Game`, `Question`, `GameSession`, `GameResult`) y las excepciones personalizadas (`BusinessException`).
*   **src/application**: Casos de uso concretos del negocio y puertos (interfaces de entrada/salida) que definen los contratos para interactuar con la lógica del negocio y con la persistencia.
*   **src/infrastructure**: Contiene los adaptadores.
    *   **inputs/http**: Controladores y rutas de Express que adaptan las peticiones HTTP externas.
    *   **outputs/db**: El repositorio Postgres (`PostgresGameRepository`) que implementa la interfaz `GameRepositoryPort` mediante consultas nativas utilizando el módulo `pg` (ADR-01).
*   **src/core**: Componentes transversales (inyección de dependencias en `container.ts`, pool de base de datos en `pgPool.ts`, verificación de variables de entorno y middlewares globales como validación JWT y control de errores).

```text
orientate-vocational-games-service/
├── database/
│   └── init.sql                     # Script SQL DDL de la base de datos de juegos
├── src/
│   ├── core/                        # Componentes transversales compartidos (Cross-cutting Concerns)
│   │   ├── config/
│   │   │   ├── container.ts         # Inyección de dependencias manual y cableado del sistema
│   │   │   └── env.ts               # Validación de variables de entorno con dotenv
│   │   ├── database/
│   │   │   └── pgPool.ts            # Conexión/Pool de PostgreSQL compartida
│   │   └── middlewares/
│   │       ├── authMiddleware.ts    # Middleware para proteger rutas vía JWT
│   │       └── errorHandler.ts      # Middleware global de manejo de excepciones
│   ├── domain/                      # Capa de Dominio pura (Sin librerías externas ni Express)
│   │   ├── entities/
│   │   │   ├── Game.ts              # Entidad Minijuego
│   │   │   ├── Question.ts          # Entidad Pregunta/Escenario
│   │   │   ├── GameSession.ts       # Entidad de Sesión de juego
│   │   │   └── GameResult.ts        # Entidad de Resultado vocacional
│   │   └── exceptions/
│   │       └── BusinessException.ts # Errores de negocio personalizados
│   ├── application/                 # Capa de Aplicación (Casos de uso y Puertos)
│   │   ├── ports/
│   │   │   ├── inputs/              # Puertos de entrada (Interfaces de Casos de Uso)
│   │   │   │   └── GameUseCasesPort.ts
│   │   │   └── outputs/             # Puertos de salida (Interfaces de Adaptadores)
│   │   │       └── GameRepositoryPort.ts   # ADR-01: Interfaz para acceso a base de datos
│   │   └── use-cases/               # Clases concretas de Casos de Uso
│   │       ├── GetActiveGames.ts
│   │       ├── GetGameWithQuestions.ts
│   │       ├── StartGameSession.ts
│   │       ├── SubmitAnswer.ts
│   │       └── FinishGameSession.ts # Calcula las ponderaciones acumuladas RIASEC y cierra la sesión
│   ├── infrastructure/              # Capa de Infraestructura (Adaptadores del dominio)
│   │   └── adapters/
│   │       ├── inputs/              # Adaptadores de entrada (Express HTTP)
│   │       │   └── http/
│   │       │       ├── controllers/
│   │       │       │   └── GameController.ts
│   │       │       └── routes/
│   │       │           └── gameRoutes.ts
│   │       └── outputs/             # Adaptadores de salida específicos de negocio
│   │           └── db/
│   │               └── PostgresGameRepository.ts # ADR-01: Implementa GameRepositoryPort
│   ├── app.ts                       # Inicialización de Express y middlewares globales
│   └── server.ts                    # Punto de entrada para arrancar el servidor HTTP
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

## Modelo de Datos (PostgreSQL)

La estructura de base de datos se inicializa automáticamente desde [database/init.sql](file:///c:/Users/regib/Downloads/orientate+/vocational-games-service/database/init.sql) con las siguientes tablas:

1.  `games`: Contiene la información general de los minijuegos.
2.  `questions`: Almacena las preguntas o escenarios del juego con un campo `options` en formato `JSONB`, el cual guarda las respuestas válidas y el peso vocacional asociado (`{"R": 1.0, "I": 0.8}`).
3.  `game_sessions`: Mantiene el registro de intentos realizados por los alumnos.
4.  `student_answers`: Guarda de forma granular cada respuesta enviada por sesión y pregunta.
5.  `game_results`: Almacena el resultado consolidado del test vocacional en formato de puntaje RIASEC (`scores` tipo `JSONB`) una vez se ha finalizado la sesión.

---

## API Endpoints (Ruta Base: `/api/v1`)

### 1. Obtener juegos activos
*   **Método:** `GET`
*   **Path:** `/api/v1/games`
*   **Acceso:** Público
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "title": "Simulador de Roles Profesionales",
        "description": "Enfréntate a decisiones reales...",
        "category": "RIASEC",
        "isActive": true
      }
    ]
    ```

### 2. Obtener estructura y preguntas de un juego
*   **Método:** `GET`
*   **Path:** `/api/v1/games/:gameId`
*   **Acceso:** Protegido (JWT Bearer Token)
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "game": {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "title": "Simulador de Roles Profesionales",
        ...
      },
      "questions": [
        {
          "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          "text": "Tu equipo escolar quiere crear un sitio web. ¿Qué rol prefieres tomar?",
          "type": "MULTIPLE_CHOICE",
          "options": [
            { "id": "opt1_1", "text": "Programar la lógica...", "weights": { "R": 1.0, "I": 0.8 } }
          ]
        }
      ]
    }
    ```

### 3. Iniciar una nueva sesión de juego
*   **Método:** `POST`
*   **Path:** `/api/v1/games/:gameId/start`
*   **Acceso:** Protegido (JWT Bearer Token)
*   **Respuesta Exitosa (201 Created):**
    ```json
    {
      "sessionId": "4dbac8d1-6789-4089-a292-959c25608671"
    }
    ```

### 4. Registrar respuesta elegida
*   **Método:** `POST`
*   **Path:** `/api/v1/games/:gameId/answers`
*   **Acceso:** Protegido (JWT Bearer Token)
*   **Body Requerido:**
    ```json
    {
      "sessionId": "4dbac8d1-6789-4089-a292-959c25608671",
      "questionId": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      "selectedOptionId": "opt1_1",
      "rawData": { "responseTimeMs": 1500 }
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "message": "Answer registered successfully"
    }
    ```

### 5. Finalizar sesión y calcular puntajes RIASEC
*   **Método:** `POST`
*   **Path:** `/api/v1/games/:gameId/finish`
*   **Acceso:** Protegido (JWT Bearer Token)
*   **Body Requerido:**
    ```json
    {
      "sessionId": "4dbac8d1-6789-4089-a292-959c25608671"
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "message": "Game session finished and results calculated",
      "result": {
        "id": "e2ac11c8-2b81-42e7-a9a3-5c7ea8a467e2",
        "sessionId": "4dbac8d1-6789-4089-a292-959c25608671",
        "userId": "151c72f1-67b1-4f0b-a010-093a8d116bb8",
        "gameId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "scores": { "R": 1.0, "I": 0.8 },
        "createdAt": "2026-06-23T18:30:00Z"
      }
    }
    ```

### 6. Obtener historial de resultados del estudiante
*   **Método:** `GET`
*   **Path:** `/api/v1/students/games/results`
*   **Acceso:** Protegido (JWT Bearer Token)
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "id": "e2ac11c8-2b81-42e7-a9a3-5c7ea8a467e2",
        "sessionId": "4dbac8d1-6789-4089-a292-959c25608671",
        "gameId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "scores": { "R": 1.0, "I": 0.8 },
        "createdAt": "2026-06-23T18:30:00Z"
      }
    ]
    ```

---

## Ejecución Local y Docker

### Requisitos previos
- Node.js v18+ y npm
- Docker y Docker Compose (opcional para levantar toda la pila)

### Configuración local rápida
1.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```
2.  Copia las variables de entorno del archivo ejemplo:
    ```bash
    cp .env.example .env
    ```
    *Nota: Modifica las credenciales y el `JWT_SECRET` en tu `.env` si es necesario.*
3.  Inicia el servidor en modo desarrollo (recarga en caliente activa):
    ```bash
    npm run dev
    ```

### Compilar y levantar con Docker Compose
Puedes levantar la base de datos de PostgreSQL e inicializar el servidor mediante:
```bash
docker-compose up --build
```
Esto creará el contenedor de base de datos Postgres expuesto en el puerto `5432` ejecutando la estructura de `init.sql`, y la aplicación de Express expuesta en el puerto `4000`.
