# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a TypeScript monorepo using npm workspaces and Turbo for build orchestration. The architecture consists of:

- **apps/web**: Next.js 14 web application (`@myapp/web`)
- **packages/shared**: Shared TypeScript library (`@myapp/shared`)
- **apps/appdata**: Android build artifacts and configuration (React Native/Expo-based)

The shared package is consumed by the web application and provides common utilities and types across the platform.

**Important**: `apps/appdata` contains Android build artifacts, Gradle configuration, and compiled outputs but lacks a complete React Native/Expo source structure (no `package.json`, `app.json`, or source files like `App.tsx`). It appears to be a build output directory rather than a source directory.

## Development Commands

### Root Level Commands (npm workspaces)
- `npm run dev:web`: Start Next.js web app in development mode
- `npm run build`: Build all packages and apps (shared → web → app)
- `npm run build:shared`: Build only the shared package
- `npm run build:web`: Build only the web application
- `npm run build:app`: Build the mobile app (requires `apps/app` with `package.json`)
- `npm run lint`: Run linting across all packages and apps
- `npm run lint:shared`: Lint only the shared package
- `npm run lint:web`: Lint only the web application
- `npm run lint:app`: Lint the mobile app

**Note**: Mobile app commands reference `apps/app`, which does not currently exist. Only `apps/appdata` (Android build artifacts) is present.

### Web App (apps/web)
- `cd apps/web && npm run dev`: Start Next.js dev server on all interfaces (0.0.0.0)
- `cd apps/web && npm run dev:https`: Start Next.js dev server with HTTPS (experimental)
- `cd apps/web && npm run build`: Production build
- `cd apps/web && npm run start`: Start production server on all interfaces
- `cd apps/web && npm run lint`: ESLint with Next.js config
- `cd apps/web && npm run clean`: Remove .next build artifacts

### Shared Package (packages/shared)
- `cd packages/shared && npm run build`: Compile TypeScript to dist/
- `cd packages/shared && npm run dev`: Watch mode compilation
- `cd packages/shared && npm run lint`: ESLint for TypeScript
- `cd packages/shared && npm run clean`: Remove dist/ artifacts

## Build Dependencies

The build system has dependencies managed by Turbo:
- Shared package must build before web app
- Web app depends on shared package being built first
- Run `npm run build:shared` before building the web app if working on shared code

## TypeScript Project References

The project uses TypeScript project references for efficient builds:
- Root `tsconfig.json` references all workspace packages
- Each workspace has its own TypeScript configuration
- The shared package outputs to `dist/` with declaration files
- Web app uses Next.js TypeScript plugin and path mapping (`@/*` → `./src/*`)

## Key Technologies

- **Web**: Next.js 14.0.4, React 18, TypeScript
- **Shared**: Pure TypeScript library
- **Build System**: Turbo, npm workspaces
- **Development**: TypeScript 5.x, ESLint
- **Other**: Mermaid CLI for diagram generation

## Project Structure Details

### Mobile App Architecture
- **Entry Point**: `apps/app/index.js` → `apps/app/App.js` → `apps/app/src/App.tsx`
- **Navigation**: Uses React Navigation 7.x with bottom tabs (`@react-navigation/bottom-tabs`)
- **Navigation Components**: Located in `apps/app/src/navigation/` (RootTabs)
- **Firebase Integration**: Firebase 12.2.1 for backend services

### Shared Package (`packages/shared`)
- **Source**: `packages/shared/src/` with `api.ts`, `types.ts`, `utils.ts`, `index.ts`
- **Build Output**: `packages/shared/dist/` with compiled JavaScript and TypeScript declaration files
- **Build Command**: `npm run build` (runs `tsc`)
- **Dev Command**: `npm run dev` (runs `tsc --watch`)
- **Usage**: Imported as `@myapp/shared` in web app

### Web App Structure
- **Framework**: Next.js 14.0.4 with App Router
- **Path Mapping**: `@/*` maps to `./src/*`
- **Shared Integration**: Imports utilities like `formatDate`, `isValidEmail` from `@myapp/shared`

## Jenkins CI/CD

A `Jenkinsfile` is provided for Android builds with the following configuration:

- **APP_DIR**: Set to `apps/appdata` (Android build artifacts directory)
- **Node.js**: Uses Node 20.x
- **Java/JDK**: Requires Java 17 (OpenJDK 17.0.16)
- **Android SDK**: Configurable via `ANDROID_HOME` environment variable
- **Build Types**: Supports APK and AAB builds for release/debug variants
- **Signing**: Requires keystore configuration via Jenkins credentials

### Jenkins Build Stages:
1. **Environment Check**: Verifies Node.js, npm, Java, Gradle versions
2. **Checkout**: Clones repository and shows git info
3. **Install Dependencies**: Installs npm dependencies with `--no-optional --force` to skip platform-specific optional packages (e.g., `lightningcss-win32-x64-msvc` on Linux)
4. **Lint**: Runs linting (conditional, only for release builds)
5. **Set Version**: Updates versionCode/versionName in build.gradle (optional)
6. **Clean**: Runs Gradle clean
7. **Build APK/AAB**: Builds Android artifacts using Gradle
8. **Archive Artifacts**: Archives APKs, AABs, and ProGuard mapping files
9. **Test**: Runs Gradle tests (conditional)

### Jenkins Issues:
- **Missing gradlew**: `apps/appdata/android` lacks a `gradlew` wrapper script. Builds will fail at the "Environment Check" stage.
- **Platform-specific dependencies**: Use `npm install --no-optional --force` to avoid errors installing Windows-specific packages like `lightningcss-win32-x64-msvc` on Linux Jenkins agents.
- **Missing app source**: `apps/appdata` contains only build artifacts, not a complete React Native/Expo app source.

## Common Issues

### Android Build Issues in Jenkins
- **Missing gradlew wrapper**: The `apps/appdata/android` directory lacks `gradlew` and `gradlew.bat` scripts
  - Solution: Copy Gradle wrapper from a React Native/Expo project or run `gradle wrapper` in the android directory
  - Ensure gradlew has execute permissions: `chmod +x apps/appdata/android/gradlew`
- **Platform-specific optional dependencies**: Installing `lightningcss-win32-x64-msvc` on Linux causes `EBADPLATFORM` errors
  - Solution: Use `npm install --no-optional --force` in Jenkinsfile
  - This skips platform-specific optional packages that aren't compatible with the Linux Jenkins agent
- **Missing app source structure**: `apps/appdata` contains only Android build artifacts
  - No `package.json`, `app.json`, or React Native source files
  - Mobile app commands in root `package.json` reference non-existent `apps/app` directory
  - This appears to be a build output directory, not a source directory

### Web App Build Issues
- **Shared package dependency**: Web app requires the shared package to be built first
  - Always run `npm run build:shared` before `npm run build:web`
  - Or use `npm run build` to build in correct order (Turbo handles dependencies)
- **Monorepo package resolution**: Next.js requires `transpilePackages: ["@myapp/shared"]` in `next.config.js`

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