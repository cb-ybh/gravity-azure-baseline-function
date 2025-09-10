# Gravity Forms to Azure Function Integration

Azure Function for integrating Gravity Forms baseline screening submissions with Microsoft Lists.

## Project Overview

**Integration Flow:** Gravity Forms → Azure Function Webhook → Microsoft Lists

This Azure Function receives webhook calls from Gravity Forms when users submit the baseline screening registration form, then automatically creates entries in the Microsoft Lists for lead management.

## Function Details

### gravityFormsWebhook
- **Route:** `/api/webhook`  
- **Methods:** GET (health check), POST (webhook)
- **Authentication:** Function-level key required
- **Purpose:** Process Gravity Forms submissions and create SharePoint list items

## Form Field Mappings

The function uses constants to map Gravity Forms field IDs to readable names:

```javascript
const FORM_FIELDS = Object.freeze({
  FIRST_NAME: "6.3",
  LAST_NAME: "6.6", 
  EMAIL: "3",
  SCHOOL_NAME: "7",
  NUMBER_OF_CHILDREN: "16"
});
```

### Expected Data Structure
Gravity Forms sends data in this format:
```javascript
{
  "6.3": "John",                    // First Name
  "6.6": "Smith",                   // Last Name  
  "3": "john@example.com",          // Email
  "7": "Example Primary School",    // School Name
  "16": "1"                         // Number of Children
}
```

## Azure Resources

### Function App
- **Name:** `func-ybh-baseline-screening-prod`
- **Resource Group:** `rg-ybh-prod-australiaeast`
- **Runtime:** Node.js 22
- **Plan:** Consumption (Serverless)
- **Authentication:** Managed Identity enabled

### Microsoft Lists Integration
- **Site:** https://ybhuk.sharepoint.com/sites/YourBrainHealth
- **List:** "Baseline Screening Contacts"
- **Authentication:** Managed Identity with Sites.ReadWrite.All permissions

## Development Setup

### Prerequisites
- Node.js 18+ 
- Azure Functions Core Tools
- VS Code with Azure Functions extension

### Local Development
```bash
# Install dependencies
npm install

# Start function locally
npm start
```

### Environment Variables
```bash
# local.settings.json
SHAREPOINT_SITE_URL=https://ybhuk.sharepoint.com/sites/YourBrainHealth
LIST_NAME=Baseline Screening Contacts
```

## Deployment

### VS Code Deployment (Current Method)
1. Open project in VS Code
2. Command Palette → "Azure Functions: Deploy to Function App"
3. Select: `func-ybh-baseline-screening-prod`

### GitHub Actions (Future)
Repository: `gravity-azure-baseline-function`
- Automatic deployment on push to main branch
- Runs tests before deployment
- Uses Azure publish profile for authentication

## Webhook Configuration

### Production URL
```
https://func-ybh-baseline-screening-prod-f4c0d8c2erd5ayc0.australiaeast-01.azurewebsites.net/api/webhook?code=[FUNCTION_KEY]
```

### Gravity Forms Setup
1. WordPress Admin → Forms → Baseline Screening Form → Settings → Webhooks
2. Add webhook with production URL above
3. Method: POST, Format: Form
4. Triggers on: Form submission

## Testing

### Health Check (GET)
```bash
curl "https://func-ybh-baseline-screening-prod-f4c0d8c2erd5ayc0.australiaeast-01.azurewebsites.net/api/webhook?code=[KEY]"
```

Expected response:
```json
{
  "message": "YBH Baseline Screening Webhook is running!",
  "timestamp": "2025-09-10T04:22:56.142Z", 
  "version": "1.0.0"
}
```

### Test Form Submission (POST)
```bash
curl -X POST "https://[URL]?code=[KEY]" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "6.3=John&6.6=Smith&3=john@test.com&7=Test School&16=1"
```

## Monitoring

### Application Insights
- **Name:** `appi-ybh-baseline-screening-prod`
- **Logs:** Available in Azure portal under Function App → Monitor
- **Alerts:** Can be configured for error notifications

### Common Log Messages
- `🚀 Gravity Forms webhook received` - Function triggered
- `✅ Contact data extracted successfully` - Form data parsed
- `✅ Successfully added contact to SharePoint list` - List item created
- `❌ Validation failed - missing email` - Missing required field

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check function key in webhook URL
2. **Missing form data**: Verify field ID mappings match actual form
3. **SharePoint errors**: Check managed identity permissions
4. **Validation failures**: Ensure required fields (email) are provided

### Debug Steps
1. Check Function App logs in Azure Portal
2. Verify webhook is active in Gravity Forms
3. Test with manual curl request
4. Check Microsoft Lists for new entries

## Security

### Authentication
- **Function Key:** Required for all webhook calls
- **Managed Identity:** Used for Microsoft Graph API access
- **HTTPS Only:** All communication encrypted

### Data Handling
- **PII Processing:** Email addresses and names are processed
- **Data Storage:** Information stored in Microsoft Lists only
- **Retention:** Follow company data retention policies

## Performance

### Metrics
- **Cold Start:** ~2-3 seconds (first request after idle)
- **Warm Execution:** ~200-500ms typical response time
- **Throughput:** 100+ requests/minute supported
- **Cost:** ~$5-10/month on Consumption plan

### Optimization
- Managed Identity reduces authentication overhead
- Minimal dependencies keep package size small
- Connection pooling for HTTP requests to Microsoft Graph