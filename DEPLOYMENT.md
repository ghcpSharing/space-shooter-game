# Azure Deployment Guide

This document explains how to deploy the Space Shooter Game to Azure Web App in Japan East region.

## Prerequisites

1. Azure account with active subscription
2. GitHub repository with Azure environment secrets configured
3. Azure CLI (for manual setup)

## Environment Secrets Setup

You need to configure the following secrets in your GitHub repository under Environment "Azure":

### AZURE_CREDENTIALS

Create a service principal and configure the JSON secret:

```bash
# Create a service principal
az ad sp create-for-rbac --name "space-shooter-game-sp" --role contributor --scopes /subscriptions/{subscription-id} --sdk-auth
```

Add the JSON output as `AZURE_CREDENTIALS` secret in GitHub Environment "Azure".

## Deployment Architecture

- **Region**: Japan East (japaneast)
- **Resource Group**: rg-space-shooter-game
- **App Service Plan**: asp-space-shooter-game (F1 Free tier)
- **Web App**: space-shooter-game
- **Runtime**: Node.js 20 LTS

## Deployment Process

### 1. Infrastructure Setup (One-time)

Run the Azure Infrastructure Setup workflow manually:

1. Go to Actions → Azure Infrastructure Setup
2. Click "Run workflow"
3. Select environment (production/staging)
4. Click "Run workflow"

This creates:
- Resource Group in Japan East
- App Service Plan (F1 tier)
- Web App with Node.js 20
- Security configurations (HTTPS only, TLS 1.2)

### 2. Continuous Deployment

The CI/CD pipeline automatically:

1. **Security Scan**: CodeQL analysis, dependency audit, secret detection
2. **Build & Test**: ESLint, TypeScript compilation, Vite build
3. **Deploy**: Automatic deployment to Azure on main branch pushes

## Security Features

### Build-time Security
- CodeQL static analysis
- Dependency vulnerability scanning
- Secret detection with TruffleHog
- ESLint security rules

### Runtime Security
- HTTPS only enforcement
- Security headers (CSP, XSS protection, etc.)
- Minimum TLS 1.2
- Content compression
- Proper MIME type handling

## Manual Deployment

If needed, you can deploy manually:

```bash
# Build locally
npm ci
npm run build

# Deploy with Azure CLI
az webapp deployment source config-zip \
  --resource-group rg-space-shooter-game \
  --name space-shooter-game \
  --src ./dist.zip
```

## Monitoring

- Application Insights is recommended for production monitoring
- Use Azure Monitor for infrastructure metrics
- GitHub Actions provide deployment status and security scan results

## Scaling

The current setup uses F1 (Free) tier. For production:

1. Upgrade to Standard or Premium tier
2. Enable auto-scaling
3. Configure staging slots
4. Add CDN for static assets

## Troubleshooting

### Build Issues
- Check Node.js version compatibility
- Verify all dependencies are properly installed
- Review ESLint errors (they're set to continue-on-error)

### Deployment Issues
- Verify Azure credentials are properly configured
- Check resource group and web app exist
- Review Azure Activity Log for detailed error messages

### Runtime Issues
- Check Application Insights for client-side errors
- Review web.config for routing issues
- Verify security headers aren't blocking necessary resources