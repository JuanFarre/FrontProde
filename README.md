# ⚽ ProdeApp - Frontend Angular

Aplicación web para pronósticos deportivos desarrollada en Angular 16 con Angular Material. Interfaz moderna y responsive para gestionar pronósticos, ver rankings y administrar partidos de fútbol.

## 🔗 Repositorios del Proyecto

- **Frontend (este repo)**: [FrontProde](https://github.com/JuanFarre/FrontProde)
- **Backend API**: [prode2.0](https://github.com/JuanFarre/prode2.0)

## 🚀 Características

- ✅ **Interfaz moderna** con Angular Material
- ⚽ **Gestión de pronósticos** en tiempo real
- 🏆 **Sistema de ranking** con múltiples vistas
- 🎫 **Gestión de tickets** personales
- 👑 **Panel de administración** completo
- 🔐 **Autenticación JWT** con guards
- 📱 **Diseño responsive** para todos los dispositivos
- 🎨 **UI/UX profesional** con animaciones

## 🛠️ Tecnologías Utilizadas

- **Angular 16.2.16**
- **TypeScript**
- **Angular Material** para componentes UI
- **RxJS** para programación reactiva
- **Angular Router** para navegación
- **Angular Guards** para protección de rutas
- **CSS3** con diseño responsive
- **Angular CLI** para desarrollo

## 📋 Requisitos Previos

- **Node.js 18** o superior
- **npm** o **yarn**
- **Angular CLI 16** o superior
- **Backend API** ejecutándose (ver [repositorio backend](https://github.com/JuanFarre/prode2.0))

## ⚙️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/JuanFarre/FrontProde.git
cd FrontProde/prodeFront
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Environment
Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // URL de tu backend
};
```

### 4. Configurar Backend
Asegúrate de que el backend esté ejecutándose en `http://localhost:8080`

Ver instrucciones en: [Backend Repository](https://github.com/JuanFarre/prode2.0)

## 🚀 Ejecutar la Aplicación

### Desarrollo
```bash
ng serve

# La aplicación estará disponible en: http://localhost:4200
```

### Build para Producción
```bash
ng build --prod

# Los archivos se generarán en: dist/
```

### Tests
```bash
# Ejecutar tests unitarios
ng test

# Ejecutar tests e2e
ng e2e
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── components/           # Componentes de la aplicación
│   │   ├── header/          # Navegación principal
│   │   ├── ranking/         # Sistema de ranking
│   │   ├── pronosticos/     # Gestión de pronósticos
│   │   ├── mis-tickets/     # Tickets del usuario
│   │   ├── partidos/        # Gestión de partidos (Admin)
│   │   ├── equipos/         # Gestión de equipos (Admin)
│   │   └── ...
│   ├── services/            # Servicios Angular
│   │   ├── ranking.service.ts
│   │   ├── usuario.service.ts
│   │   ├── auth.service.ts
│   │   └── ...
│   ├── models/              # Interfaces TypeScript
│   ├── guards/              # Guards de autenticación
│   ├── dialog-editar-entidad/
│   ├── dialog-eliminar-entidad/
│   ├── app-routing.module.ts
│   └── app.module.ts
├── assets/                  # Recursos estáticos
└── environments/            # Configuraciones de entorno
```

## 🔐 Funcionalidades

### Para Usuarios
- 📝 **Login/Registro** con validación
- ⚽ **Ver partidos** disponibles para pronosticar
- 🎯 **Crear pronósticos** con interfaz intuitiva
- 🎫 **Gestionar mis tickets** personales
- 🏆 **Ver ranking** general y por fecha
- 📊 **Detalles de pronósticos** con estados visuales

### Para Administradores
- 🏟️ **Gestionar equipos** con escudos
- ⚽ **Administrar partidos** y fechas
- 🏆 **Gestionar torneos** completos
- 👥 **Administración de usuarios**
- 📊 **Dashboard** con estadísticas

## 🎨 Componentes Principales

### Ranking Component
- 🏆 **Ranking general** de usuarios
- 📅 **Ranking por fecha** específica
- 👁️ **Detalles de pronósticos** expandibles
- 🎨 **Estilos visuales** para estados (acertado, pendiente, errado)

### Header Component
- 🧭 **Navegación dinámica** por roles
- 👤 **Menú de usuario** con logout
- 📱 **Responsive design**

### ProdeApp Features
- 🎫 **Sistema de tickets** agrupados
- ⚽ **Pronósticos visuales** con escudos
- 📊 **Estados en tiempo real**
- 🏆 **Puntuación automática**

## 🔒 Seguridad

- **JWT Authentication** con interceptors
- **Route Guards** para protección de rutas
- **Role-based access** (USER/ADMIN)
- **Token refresh** automático
- **Session management** segura

## 🎯 Servicios

### RankingService
```typescript
// Obtener ranking general
getRankingGeneral(): Observable<RankingItem[]>

// Obtener ranking por fecha
getRankingPorFecha(fechaId: number): Observable<RankingItem[]>
```

### AuthService
- Autenticación JWT
- Gestión de tokens
- Guards de rutas

### UsuarioService
- Gestión de perfiles
- Operaciones CRUD

## 📱 Responsive Design

- 📱 **Mobile-first** approach
- 💻 **Desktop optimized**
- 📋 **Tablet compatible**
- 🎨 **Angular Material** responsive components

## 🔧 Configuración del Environment

### Development
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### Production
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api-produccion.com/api'
};
```

## 🔍 Scripts Disponibles

```bash
# Desarrollo
npm start                 # ng serve
npm run build            # ng build
npm run test             # ng test
npm run lint             # ng lint
npm run e2e              # ng e2e

# Producción
npm run build:prod       # ng build --prod
```

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^16.2.16",
  "@angular/material": "^16.x.x",
  "@angular/cdk": "^16.x.x",
  "rxjs": "^7.x.x",
  "typescript": "^5.x.x"
}
```

## 👨‍💻 Autor

**Juan Farré**
- GitHub: [@JuanFarre](https://github.com/JuanFarre)
- Email: juanfarre99@gmail.com

## 🔗 Enlaces Relacionados

- [Backend API](https://github.com/JuanFarre/prode2.0) - API REST con Spring Boot

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

⭐ **¡Dale una estrella si te gustó el proyecto!** ⭐

### 🚨 Importante

- Asegúrate de que el **backend esté ejecutándose** antes de iniciar el frontend
- Configura correctamente la **URL del API** en `environment.ts`
- Para **desarrollo local**, usa `http://localhost:8080/api`
- Para **producción**, actualiza la URL a tu servidor de backend
