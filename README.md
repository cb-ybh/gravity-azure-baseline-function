# Gravity Forms Azure Function Integration

Azure Function for integrating Gravity Forms baseline screening submissions with Microsoft Lists.

## Overview

**Integration Flow:** Gravity Forms → Azure Function Webhook → Microsoft Lists

This function processes webhook calls from Gravity Forms and automatically creates entries in Microsoft Lists for lead management.

## Function Details

### gravityFormsWebhook
- **Trigger:** HTTP GET/POST
- **URL:** `/api/webhook`
- **Auth Level:** Function (requires function key)  
- **Purpose:** Processes Gravity Forms webhook and creates SharePoint list items
- **GET:** Health check endpoint
- **POST:** Webhook processing

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Settings
Update `local.settings.json` with your values:
- `SHAREPOINT_SITE_URL`: Your SharePoint site URL (default: https://ybhuk.sharepoint.com/sites/YourBrainHealth)
- `LIST_NAME`: Name of your SharePoint list (default: "Baseline Screening Contacts")

### 3. Run Locally
```bash
npm start
```

### 4. Test Webhook
```bash
# Health check
curl "http://localhost:7071/api/webhook"

# Test form submission  
curl -X POST "http://localhost:7071/api/webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "6.3=John&6.6=Smith&3=john@example.com&7=Example+Primary+School&16=1"
```

## Deployment

### Using Azure CLI
```bash
# Login to Azure
az login

# Deploy function app
func azure functionapp publish func-ybh-baseline-screening-prod
```

### Using VS Code
1. Install Azure Functions extension
2. Right-click project folder
3. Select "Deploy to Function App"
4. Choose `func-ybh-baseline-screening-prod`

## Authentication

The function uses **Managed Identity** to authenticate with Microsoft Graph API:

1. Function App has system-assigned managed identity enabled
2. Managed identity has permissions to the SharePoint site
3. No secrets required in configuration

## Environment Variables

### Production Settings (Azure Portal)
- `TENANT_ID`: Azure AD tenant ID
- `SHAREPOINT_SITE_URL`: https://ybhuk.sharepoint.com/sites/YourBrainHealth
- `LIST_NAME`: Baseline Screening Contacts

## Gravity Forms Configuration

### Webhook URL
`https://func-ybh-baseline-screening-prod-f4c0d8c2erd5ayc0.australiaeast-01.azurewebsites.net/api/webhook?code=[FUNCTION_KEY]`

### Form Field Mappings
The function uses constants for field mappings:
- `6.3`: First Name → `FORM_FIELDS.FIRST_NAME`
- `6.6`: Last Name → `FORM_FIELDS.LAST_NAME`
- `3`: Email Address → `FORM_FIELDS.EMAIL`
- `7`: School Name → `FORM_FIELDS.SCHOOL_NAME`
- `16`: Number of Children → `FORM_FIELDS.NUMBER_OF_CHILDREN`

## Monitoring

- **Application Insights:** Enabled for logging and monitoring
- **Logs:** View in Azure portal under Function App → Monitor
- **Alerts:** Configure in Application Insights for error notifications

## Troubleshooting

### Common Issues
1. **Authentication errors**: Check managed identity permissions
2. **List not found**: Verify `LIST_NAME` matches exactly
3. **Field mapping errors**: Check Gravity Forms field IDs
4. **CORS errors**: Ensure CORS is configured for webhook domain

### Debug Locally
```bash
# Enable detailed logging
export AZURE_LOG_LEVEL=verbose
npm start
```

## Field Mapping

| Gravity Forms Field | Constant | SharePoint Column | Description |
|-------------------|----------|------------------|-------------|
| `6.3` + `6.6` | `FIRST_NAME` + `LAST_NAME` | ParentName | Contact's full name |
| `3` | `EMAIL` | Email | Email address |
| `7` | `SCHOOL_NAME` | SchoolName | School name |
| `16` | `NUMBER_OF_CHILDREN` | NumberofChildren | Number of children |
| Auto-generated | - | Status | Default: "New" |
| Auto-generated | - | Source | Default: "School Partnership" |