# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a TypeScript monorepo using npm workspaces and Turbo for build orchestration. The architecture consists of:

- **apps/web**: Next.js web application (`@myapp/web`)
- **apps/app**: Expo/React Native mobile application
- **packages/shared**: Shared TypeScript library (`@myapp/shared`)

The shared package is consumed by the web application and provides common utilities and types across the platform.

## Development Commands

### Root Level Commands (npm workspaces)
- `npm run dev:app`: Start the Expo mobile app
- `npm run dev:web`: Start the Next.js web app in development mode
- `npm run build`: Build all apps and packages (shared → web → app)
- `npm run build:shared`: Build only the shared package
- `npm run build:web`: Build only the web application
- `npm run build:app`: Build only the mobile application
- `npm run lint`: Run linting across all packages and apps

### Web App (apps/web)
- `cd apps/web && npm run dev`: Start Next.js dev server on all interfaces (0.0.0.0)
- `cd apps/web && npm run build`: Production build
- `cd apps/web && npm run start`: Start production server on all interfaces
- `cd apps/web && npm run lint`: ESLint with Next.js config
- `cd apps/web && npm run clean`: Remove .next build artifacts

### Mobile App (apps/app)
- `cd apps/app && npm run start`: Start Expo development server
- `cd apps/app && npm run android`: Run on Android
- `cd apps/app && npm run ios`: Run on iOS
- `cd apps/app && npm run web`: Run Expo web version

### Shared Package (packages/shared)
- `cd packages/shared && npm run build`: Compile TypeScript to dist/
- `cd packages/shared && npm run dev`: Watch mode compilation
- `cd packages/shared && npm run lint`: ESLint for TypeScript
- `cd packages/shared && npm run clean`: Remove dist/ artifacts

## Build Dependencies

The build system has dependencies managed by Turbo:
- Shared package must build before web and app
- Apps depend on shared package being built first
- Run `npm run build:shared` before building individual apps if working on shared code

## TypeScript Project References

The project uses TypeScript project references for efficient builds:
- Root `tsconfig.json` references all workspace packages
- Each workspace has its own TypeScript configuration
- The shared package outputs to `dist/` with declaration files
- Web app uses Next.js TypeScript plugin and path mapping (`@/*` → `./src/*`)

## Key Technologies

- **Web**: Next.js 14.0.4, React 18, TypeScript
- **Mobile**: Expo ~53.0.22, React Native 0.79.5, React 19.0.0, React Navigation 7.x, Firebase 12.2.1
- **Shared**: Pure TypeScript library
- **Build System**: Turbo, npm workspaces
- **Development**: TypeScript 5.x, ESLint

## Project Structure Details

### Mobile App Architecture
- **Entry Point**: `apps/app/index.js` → `apps/app/App.js` → `apps/app/src/App.tsx`
- **Navigation**: Uses React Navigation 7.x with bottom tabs (`@react-navigation/bottom-tabs`)
- **Navigation Components**: Located in `apps/app/src/navigation/` (RootTabs)
- **Firebase Integration**: Firebase 12.2.1 for backend services

### Shared Package Structure
- **Source**: `packages/shared/src/` with `api.ts`, `types.ts`, `utils.ts`, `index.ts`
- **Build Output**: `packages/shared/dist/` with declaration files
- **Usage**: Imported as `@myapp/shared` in web app (see example in `apps/web/src/app/page.tsx`)

### Web App Structure
- **Framework**: Next.js 14.0.4 with App Router
- **Path Mapping**: `@/*` maps to `./src/*`
- **Shared Integration**: Imports utilities like `formatDate`, `isValidEmail` from `@myapp/shared`

## Common Issues

### Mobile App Build Problems
- **Module Resolution**: Ensure `apps/app/App.js` properly exports from `./src/App`
- **Navigation Setup**: Check `RootTabs` component exists in `apps/app/src/navigation/`
- **Firebase Config**: Verify Firebase configuration for mobile platform
- **Entry Point**: Ensure `app.json` specifies `"main": "index.js"`
- **Metro Cache**: Clear cache with `cd apps/app && npx expo start --clear`
- **NODE_ENV**: Set environment variable for builds: `NODE_ENV=production`
- **BuildConfig Import**: If Android build fails with "Unresolved reference 'BuildConfig'", add import:
  - In `MainActivity.kt` and `MainApplication.kt`: `import com.anonymous.app.BuildConfig`
- **C++ Standard Issues**: If build fails with C++ errors like "no member named 'bit_width'" or "unknown type name 'concept'":
  - React Native 0.79.5+ requires C++20 support
  - Add C++20 support in `apps/app/app.json`:
  ```json
  ["expo-build-properties", {
    "android": {
      "cppFlags": ["-std=c++20"],
      "abiFilters": ["arm64-v8a", "armeabi-v7a"]
    }
  }]
  ```
  - Run `npx expo prebuild --clean` after changes
  - Re-add BuildConfig imports after prebuild
- **react-native-maps Compatibility**: If C++ errors persist, temporarily remove react-native-maps:
  - `npm uninstall react-native-maps`
  - Rebuild project
  - Reinstall when React Native updates fix compatibility
- **Android Gradle Paths**: In `apps/app/android/app/build.gradle`, ensure:
  - `entryFile = file("../index.js")` (not `../../index.js`)
  - `root = file("../")` (not `../../`)

### Troubleshooting Commands
- Clear Metro cache: `cd apps/app && npx expo start --clear`
- Reset React Native cache: `cd apps/app && npx react-native start --reset-cache`
- Clean build: `cd apps/app && rm -rf node_modules && npm install`

## ⚠️ Important: Working Directory

**CRITICAL**: All mobile app commands must be run from `apps/app` directory, NOT from the monorepo root.

### Correct Usage:
```bash
# ✅ CORRECT - Run from apps/app directory
cd apps/app
npm start                    # Start Expo dev server
npm run android             # Build and run on Android
npm run ios                 # Build and run on iOS
npx expo start --clear      # Clear Metro cache

# ❌ WRONG - Don't run from monorepo root
# npm run dev:app            # This can cause module resolution issues
```

### Root-level Commands (from monorepo root):
```bash
# These are safe to run from root as they change directory internally
npm run build:app           # Builds the app (cd apps/app && npm run build)
npm run lint:app            # Lints the app (cd apps/app && npm run lint)
```

## Configuration Details

### Turbo Build Pipeline
- **Build Dependencies**: Shared package must build before apps (`"dependsOn": ["^build"]`)
- **Output Directories**: `.next/**`, `dist/**`, `build/**`
- **Development**: `dev` tasks use `"cache": false` and `"persistent": true`

### Metro Configuration (Mobile App)
- **Monorepo Support**: Watches entire workspace root for changes
- **Module Resolution**: Resolves from both app and workspace node_modules
- **Shared Package Alias**: `@myapp/shared` → `packages/shared/src`
- **Hierarchical Lookup**: Disabled for better monorepo support

### Next.js Configuration (Web App)
- **Transpile Packages**: Configured to transpile `@myapp/shared`
- **External Directory**: Enabled for monorepo support
- **CORS Headers**: Configured for all routes with permissive settings

### TypeScript Project References
- **Root Config**: References all workspace packages with Expo base config
- **Shared Package**: Outputs declaration files to `dist/`
- **Web App**: Uses Next.js TypeScript plugin with path mapping

## Testing

No test framework is currently configured. If tests need to be added, they should be set up per workspace as needed.