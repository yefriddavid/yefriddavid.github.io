# Login Flow

Diagrama de flujo del sistema de autenticación de CashFlow.

```mermaid
flowchart TD
    A([Usuario abre la app]) --> B{Firebase Auth\nresuelve estado}

    B -- "undefined (resolviendo)" --> C[🔄 Spinner pantalla completa]
    C --> B

    B -- "null (sin sesión)" --> D[Redirige a /login]
    B -- "user object (sesión activa)" --> E[Valida sessionId\nen Firestore]

    E -- válida --> F[✅ Rutas autenticadas\nsegún rol]
    E -- inválida --> D

    D --> G[Login.js\nFormulario usuario/contraseña]
    G --> H{¿Recordar sesión?\ncookie guardada?}
    H -- sí --> I[Pre-llena el formulario]
    H -- no --> G

    G --> J[handleSubmit\nsignIn username + password]

    J --> K{Firebase Auth\nsignInWithEmailAndPassword}

    K -- ✅ OK --> N[Firebase Auth activo\ntoken en IndexedDB]
    K -- ❌ user-not-found\ninvalid-credential --> L[Ruta legacy:\ngetUserForAuth en Firestore]

    L -- no existe --> M[❌ Error: Credenciales incorrectas]
    L -- inactivo --> M

    L --> O{hashPassword\n¿coincide?}
    O -- ❌ no --> M
    O -- ✅ sí --> P[createUserWithEmailAndPassword\nMigración lazy automática]
    P --> N

    N --> Q[getUserForAuth\nObtiene perfil Firestore\nrol, nombre, landingPage]
    Q --> R[createSession\nen Firestore]
    R --> S[Guarda en localStorage\ntoken, username, sessionId, landingPage]
    S --> T[dispatch fetchProfile\nnavigate landingPage]

    T --> U[onAuthStateChanged\ndispara en AppContent]
    U --> F

    F --> V{Usuario hace logout}
    V --> W[deleteSession en Firestore]
    W --> X[Firebase signOut\nlimpia IndexedDB]
    X --> Y[Limpia localStorage]
    Y --> Z[dispatch clearProfile]
    Z --> D

    subgraph TOKEN ["🔄 Refresh token automático (en background)"]
        AA[Token ID expira 1h] --> BB[Firebase SDK refresca\nautomáticamente via IndexedDB]
        BB --> CC[getIdToken devuelve\nnuevo token válido]
    end

    subgraph MIDDLEWARE ["⚙️ Middleware en cada petición"]
        DD[firestoreCall / axiosInterceptor] --> EE[getIdToken antes\nde cada llamada]
        EE -- 401/permission-denied --> FF[forceTokenRefresh + retry]
        FF -- falla --> GG[signOut → /login]
    end
```

## Puntos clave

| Etapa | Qué pasa |
|---|---|
| **Arranque** | Firebase resuelve estado desde IndexedDB antes de mostrar cualquier ruta |
| **Login normal** | `signInWithEmailAndPassword` → perfil Firestore → session record |
| **Login legacy** | Firestore hash check → migración automática a Firebase Auth → continúa |
| **Session validation** | Al arrancar con sesión activa, verifica el sessionId en Firestore (previene sesiones robadas) |
| **Refresh token** | Firebase SDK lo maneja solo en IndexedDB, sin intervención manual |
| **Middleware** | Cada llamada a Firestore/API inyecta un token fresco; en 401 fuerza refresh y reintenta |
| **Logout** | Elimina sesión Firestore + Firebase signOut (invalida IndexedDB) + limpia localStorage |

## Archivos involucrados

| Archivo | Responsabilidad |
|---|---|
| `src/views/pages/login/Login.js` | Formulario y submit handler |
| `src/services/auth/firebaseAuth.js` | `signIn`, `signOut`, `getToken`, `onAuthChange` |
| `src/components/AppContent.js` | Guard de rutas vía `onAuthStateChanged` |
| `src/services/providers/firebase/firebaseClient.js` | Middleware Firestore (token + retry + errores) |
| `src/services/providers/api/utilApi.js` | Interceptor Axios (token + retry en 401) |
| `src/services/providers/firebase/Security/sessions.js` | CRUD de sesiones en Firestore |
