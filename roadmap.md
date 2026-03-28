# Roadmap de Mejoras - Social Media App

## Tabla de Contenidos
1. [Criticas](#criticas)
2. [Altas](#altas)
3. [Medias](#medias)
4. [Bajas](#bajas)

---

## Criticas

### 1. Eliminar duplicacion de `createComment`

**Problema**: Existe `createComment` en dos archivos:
- `src/actions/post.action.ts:204-272`
- `src/actions/comment.action.ts:9-76`

Ademas, el de `post.action.ts` NO sanitiza el contenido.

**Impacto**: Bug critico - inconsistencias en datos y potencial XSS.

**Pasos de implementacion**:

```typescript
// Paso 1: Eliminar createComment de src/actions/post.action.ts

// Eliminar estas lineas (204-272):
export async function createComment(postId: string, content: string) { ... }

// Paso 2: Asegurar que post.action.ts importa desde comment.action.ts
// En src/actions/post.action.ts, agregar import:
import { createComment } from "./comment.action";

// Paso 3: Reemplazar la llamada inline por el import
// En toggleLike, donde se llama a createComment, cambiar a:
// await createComment(postId, content);

// Paso 4: Verificar que comment.action.ts sanitiza correctamente
// Ya esta hecho en lineas 21-25 de comment.action.ts
```

**Verificacion**: Ejecutar `npm run build` y probar crear comentario.

---

### 2. Agregar autorizacion a `deletePostAndRedirect`

**Problema**: `src/actions/post.action.ts:305-316` no verifica propiedad del post.

```typescript
// PROBLEMA:
export async function deletePostAndRedirect(postId: string) {
  await prisma.post.delete({ where: { id: postId } }); // Sin verificacion!
  redirect("/");
}
```

**Impacto**: Cualquier usuario puede eliminar cualquier post via URL directa.

**Pasos de implementacion**:

```typescript
// Paso 1: Modificar deletePostAndRedirect
export async function deletePostAndRedirect(postId: string) {
  const userId = await getDbUserId();
  if (!userId) redirect("/sign-in");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) redirect("/");

  if (post.authorId !== userId) {
    throw new Error("Unauthorized - no delete permission");
  }

  await prisma.notification.deleteMany({ where: { postId } });
  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/");
  redirect("/");
}
```

**Verificacion**: Intentar eliminar post de otro usuario debe fallar.

---

### 3. Sanitizar contenido en `createComment` de `post.action.ts`

**Problema**: Si se usa la version de `post.action.ts`, no sanitiza input.

**Pasos de implementacion**:

```typescript
// En src/actions/post.action.ts, function createComment:

// Agregar sanitizacion antes de crear comment:
const sanitizedContent = sanitizeInput(content);

if (sanitizedContent.length > 280) {
  return { success: false, error: "Comment too long (max 280 characters)" };
}

// Usar sanitizedContent en lugar de content
const newComment = await tx.comment.create({
  data: {
    content: sanitizedContent, // Cambiar aqui
    authorId: userId,
    postId,
  },
});
```

**Verificacion**: Probar con `<script>alert('xss')</script>`.

---

## Altas

### 4. Migrar polling a WebSocket o Server-Sent Events (SSE)

**Problema**: `NotificationsIndicator.tsx` usa polling cada 10s.
- 100 usuarios = 10 requests/segundo
- No escala

**Pasos de implementacion**:

```typescript
// Paso 1: Crear API route para SSE
// src/app/api/notifications/stream/route.ts

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const sendNotification = async () => {
        const count = await prisma.notification.count({
          where: { userId, read: false },
        });
        
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ count })}\n\n`)
        );
      };

      // Enviar inicialmente
      await sendNotification();

      // Enviar cada 10s o cuando hay cambio
      const interval = setInterval(async () => {
        try {
          await sendNotification();
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 10000);

      // Cleanup en desconexion
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Paso 2: Modificar NotificationsIndicator
// src/components/NotificationsIndicator.tsx

useEffect(() => {
  const eventSource = new EventSource('/api/notifications/stream');
  
  eventSource.onmessage = (event) => {
    const { count } = JSON.parse(event.data);
    setCount(count);
  };

  eventSource.onerror = () => {
    console.error('SSE connection error');
    eventSource.close();
  };

  return () => eventSource.close();
}, []);
```

**Verificacion**: Verificar que el contador se actualiza en tiempo real.

---

### 5. Agregar paginacion a seguidores

**Problema**: `getProfileByUsername` trae TODOS los seguidores.

```typescript
// src/actions/profile.action.ts:46-69
followers: { select: { follower: {...} } } // Sin limite!
```

**Pasos de implementacion**:

```typescript
// Paso 1: Modificar getProfileByUsername
export async function getProfileByUsername(
  username: string,
  followersCursor?: string,
  followingCursor?: string,
  limit: number = 20
) {
  // ... query existente ...
  
  // En followers:
  followers: {
    take: limit + 1,
    cursor: followersCursor ? { id: followersCursor } : undefined,
    select: { id: true, follower: {...} },
  },
  following: {
    take: limit + 1,
    cursor: followingCursor ? { id: followingCursor } : undefined,
    select: { id: true, following: {...} },
  },
  
  // Retornar cursores
  return {
    ...user,
    followers,
    following,
    followersNextCursor: /* calcular */,
    followingNextCursor: /* calcular */,
  };
}

// Paso 2: Crear API routes para followers/following
// src/app/api/profile/[username]/followers/route.ts
// src/app/api/profile/[username]/following/route.ts

// Paso 3: Crear componentes de paginacion
// src/components/profile/FollowersList.tsx (ya existe, modificar)
```

---

### 6. Configurar ESLint

**Problema**: `npm run lint` pide configuracion interactiva.

**Pasos de implementacion**:

```bash
# Paso 1: Crear .eslintrc.json
```

```json
{
  "Root": true,
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

```bash
# Paso 2: Instalar dependencias si no existen
npm install -D eslint eslint-config-next

# Paso 3: Agregar script si no existe en package.json
# "lint": "next lint" ya existe

# Paso 4: Crear .eslintignore
node_modules/
.next/
dist/
build/
```

**Verificacion**: `npm run lint` debe ejecutarse sin prompts.

---

### 7. Agregar Error Boundaries

**Problema**: Si una pagina falla, muestra error crudo de Next.js.

**Pasos de implementacion**:

```typescript
// Paso 1: Crear componente ErrorBoundary
// src/components/ErrorBoundary.tsx

"use client";

import { Component, ReactNode } from "react";
import { Button } from "./ui/button";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Paso 2: Crear global-error.tsx
// src/app/global-error.tsx

"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <h1 className="text-4xl font-bold mb-4">500 - Server Error</h1>
            <p className="text-muted-foreground mb-6">
              Our servers are having issues. Please try again later.
            </p>
            <Button onClick={reset}>Try again</Button>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}

// Paso 3: Crear error.tsx por pagina si es necesario
// src/app/error.tsx (para /)
// src/app/profile/error.tsx
// src/app/notifications/error.tsx
```

---

## Medias

### 8. Crear archivo de constantes

**Problema**: Valores hardcodeados en multiples archivos.

**Pasos de implementacion**:

```typescript
// src/lib/constants.ts

export const LIMITS = {
  POST_CONTENT_MAX: 500,
  COMMENT_CONTENT_MAX: 280,
  BIO_MAX: 160,
  NAME_MAX: 30,
  LOCATION_MAX: 30,
  WEBSITE_MAX: 100,
  PAGINATION_TAKE: 10,
  SUGGESTED_USERS: 3,
  SEARCH_RESULTS: 5,
} as const;

export const POLLING_INTERVALS = {
  NOTIFICATIONS: 10000, // 10 seconds
} as const;

export const NOTIFICATION_TYPES = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  FOLLOW: "FOLLOW",
  MENTION: "MENTION",
} as const;

export const ROUTES = {
  HOME: "/",
  PROFILE: (username: string) => `/profile/${encodeURIComponent(username)}`,
  POST: (id: string) => `/post/${id}`,
  NOTIFICATIONS: "/notifications",
  SIGN_IN: "/sign-in",
} as const;

export const VALIDATION = {
  USERNAME_REGEX: /^[a-zA-Z0-9_+.-]+$/,
  MENTION_REGEX: /@([a-zA-Z0-9_+.-]+)/g,
} as const;
```

Luego usar en acciones y componentes.

---

### 9. Agregar Empty States

**Problema**: No hay estados vacios visuales.

**Pasos de implementacion**:

```typescript
// src/components/EmptyState.tsx

import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Uso en paginas:
import { MessageCircleIcon } from "lucide-react";

{posts.length === 0 ? (
  <EmptyState
    icon={MessageCircleIcon}
    title="No posts yet"
    description="Be the first to share something!"
    action={{ label: "Create Post", onClick: () => {/* ... */} }}
  />
) : (
  <PostsList posts={posts} />
)}
```

---

### 10. Reemplazar window.confirm con AlertDialog

**Problema**: `LikeButton.tsx:41` usa `window.confirm`.

```typescript
// src/components/LikeButton.tsx

// Eliminar:
const confirmed = window.confirm("Are you sure you want to delete this post?");

// Usar DeleteAlertDialog ya existente
// O importar AlertDialog de shadcn/ui

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DeletePostButton = ({ postId }: { postId: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deletePostAndRedirect(postId);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="flex items-center gap-1 text-destructive hover:opacity-80 transition text-sm">
          <TrashIcon className="w-4 h-4" />
          Delete Post
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete post?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

---

### 11. Usar enum en vez de magic strings

**Problema**: `"MENTION" as const` repetido en multiples archivos.

**Pasos de implementacion**:

```typescript
// src/lib/types/notifications.ts

export const NotificationType = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  FOLLOW: "FOLLOW",
  MENTION: "MENTION",
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// Usar en Prisma schema:
// NOTA: Prisma ya tiene el enum definido
```

```typescript
// En acciones, importar y usar:
import { NotificationType } from "@/lib/types/notifications";

data: { type: NotificationType.LIKE, ... }
```

---

## Bajas

### 12. Separar componentes en carpetas por dominio

**Problema**: `components/` es plano con muchos archivos sueltos.

**Estructura propuesta**:

```
src/components/
├── features/
│   ├── posts/
│   │   ├── components/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostHeader.tsx
│   │   │   ├── PostImage.tsx
│   │   │   ├── PostActions.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── usePosts.ts
│   │   └── types.ts
│   ├── profile/
│   │   ├── components/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileTabs.tsx
│   │   │   └── index.ts
│   │   └── types.ts
│   ├── notifications/
│   │   └── components/
│   │       ├── NotificationItem.tsx
│   │       ├── NotificationList.tsx
│   │       └── index.ts
│   └── comments/
│       ├── CommentForm.tsx
│       ├── CommentsList.tsx
│       └── index.ts
├── ui/                    # shadcn/ui (mantener igual)
└── shared/                # Componentes compartidos
    ├── EmptyState.tsx
    ├── ErrorBoundary.tsx
    ├── LoadingSkeleton.tsx
    └── index.ts
```

**Pasos de implementacion**:

```bash
# Paso 1: Crear estructura de carpetas
mkdir -p src/components/features/{posts,profile,notifications,comments}/components
mkdir -p src/components/shared

# Paso 2: Mover archivos manteniendo historial de git
git mv src/components/PostCard.tsx src/components/features/posts/components/PostCard.tsx
# ... repetir para cada archivo ...

# Paso 3: Crear index.ts de exports
# src/components/features/posts/components/index.ts
export { PostCard } from "./PostCard";
export { PostHeader } from "./PostHeader";
// ...

# Paso 4: Actualizar imports en toda la app
# Buscar y reemplazar:
# "from @/components/PostCard" -> "from @/components/features/posts/components"
```

---

### 13. Agregar Docker

**Pasos de implementacion**:

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Development image
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
ENV DATABASE_URL=postgresql://user:password@db:5432/socialmedia

EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build image
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/socialmedia
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${CLERK_PUBLISHABLE_KEY}
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: socialmedia
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d socialmedia"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

### 14. Crear `.env.example`

**Pasos de implementacion**:

```bash
# Crear .env.example
cat > .env.example << 'EOF'
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/socialmedia

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# UploadThing
UPLOADTHING_SECRET=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
UPLOADTHING_APP_ID=xxxxxxxxxxxxxxxx
EOF

# Actualizar .gitignore
echo ".env" >> .gitignore
# Asegurarse que .env.example NO esta en gitignore
```

---

## Checklist de Implementacion

### Fase 1: Criticas (Semana 1)
- [ ] Eliminar duplicacion de createComment
- [ ] Agregar autorizacion a deletePostAndRedirect
- [ ] Sanitizar contenido en createComment

### Fase 2: Altas (Semana 2-3)
- [ ] Configurar ESLint
- [ ] Agregar Error Boundaries
- [ ] Migrar polling a SSE
- [ ] Agregar paginacion a seguidores

### Fase 3: Medias (Semana 4-5)
- [ ] Crear archivo de constantes
- [ ] Agregar Empty States
- [ ] Reemplazar window.confirm
- [ ] Usar enum en vez de magic strings

### Fase 4: Bajas (Semana 6+)
- [ ] Separar componentes en carpetas
- [ ] Agregar Docker
- [ ] Crear .env.example
- [ ] Configurar tests (Jest + Playwright)

---

## Notas de Implementacion

1. **Antes de cada cambio**: Hacer backup o commit antes de modificar archivos criticos.

2. **Testing**: Des pues de cada implementacion, verificar:
   - `npm run build` pasa
   - Funcionalidad funciona manualmente
   - No hay errores en consola

3. **Code Review**: Para cambios grandes, crear branch separada:
   ```bash
   git checkout -b fix/critical-auth-bugs
   ```

4. **Rollback**: Si algo falla:
   ```bash
   git checkout HEAD -- src/
   ```

---

## Recursos

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Prisma Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog)
- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
