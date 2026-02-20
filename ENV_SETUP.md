# Environment Variables Setup

This project uses Angular environment files to manage different configurations for development and production.

## Environment Files

- **`src/environments/environment.ts`** - Development environment
- **`src/environments/environment.prod.ts`** - Production environment
- **`.env`** - Development environment variables (reference only)
- **`.env.production`** - Production environment variables (reference only)

## Configuration

### Development Environment

The development environment uses:
- **API Base URL**: `http://localhost:8081`
- **Frontend Base URL**: `http://localhost:3000`

These are configured in `src/environments/environment.ts`.

### Production Environment

To configure production environment:

1. Edit `src/environments/environment.prod.ts` and update:
   ```typescript
   export const environment = {
     production: true,
     apiBaseUrl: 'https://api.yourdomain.com',
     frontendBaseUrl: 'https://yourdomain.com',
   };
   ```

2. Or use `.env.production` file as a reference (update the values in `environment.prod.ts` manually).

## Building

### Development Build
```bash
ng build --configuration development
```

### Production Build
```bash
ng build --configuration production
```

The production build automatically uses `environment.prod.ts` instead of `environment.ts` (configured in `angular.json`).

## Services Using Environment Variables

All services now use environment variables:
- `ImageUploadsService` - Uses `apiBaseUrl` and `frontendBaseUrl`
- `AuthService` - Uses `apiBaseUrl`
- `ShortenerService` - Uses `frontendBaseUrl`
- `QrCodesService` - Uses `apiBaseUrl` and `frontendBaseUrl`
- `ItemsService` - Uses `apiBaseUrl`
- `CategoriesService` - Uses `apiBaseUrl`
- `CartService` - Uses `apiBaseUrl`

## Updating URLs

To change URLs for production:

1. **Edit `src/environments/environment.prod.ts`**
2. Update the `apiBaseUrl` and `frontendBaseUrl` values
3. Rebuild the application

## Note

Angular doesn't support runtime `.env` file reading in the browser. Environment variables are replaced at build time. The `.env` files are provided as reference documentation only.
