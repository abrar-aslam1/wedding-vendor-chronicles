# Wedding Vendor Link Validator

A comprehensive tool for validating Instagram and website links for wedding vendors, with a focus on identifying and fixing broken links in the Dallas vendor directory.

## Features

- **Instagram Profile Validation**: Verifies Instagram handles and detects private accounts
- **Website URL Validation**: Checks website accessibility and response codes
- **Comprehensive Reporting**: Generates detailed reports in JSON, CSV, Markdown, and HTML formats
- **Automated Fix Suggestions**: Suggests alternative Instagram handles for broken links
- **Database Integration**: Updates vendor records in Supabase with validation results
- **Rate Limiting**: Respects platform limits to avoid blocking

## Quick Start

1. **Install Dependencies**
```bash
cd scripts/link-validator
npm install
```

2. **Set Environment Variables**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. **Run Dallas Vendor Validation**
```bash
npm run test:dallas
```

## Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key  # For updates
```

## Usage

### 1. Validate Dallas Vendors

```bash
# Run validation and generate reports
tsx testDallasVendors.ts

# Or use npm script
npm run test:dallas
```

This will:
- Load all Dallas vendors from the JSON file or database
- Validate each Instagram profile
- Generate comprehensive reports
- Save results to multiple formats

### 2. Generate Update Plan

```bash
# Generate plan to fix broken links
tsx updateBrokenLinks.ts plan ./reports/dallas_validation_2025-07-10.json
```

### 3. Execute Updates

```bash
# Execute the generated update plan
tsx updateBrokenLinks.ts execute ./update_plan_2025-07-10.json
```

## API Reference

### LinkValidator Class

```typescript
import { LinkValidator } from './linkValidator';

const validator = new LinkValidator(supabaseUrl, supabaseKey);

// Validate Instagram profile
const result = await validator.validateInstagramProfile('businessname');

// Validate website URL
const result = await validator.validateWebsite('https://example.com');

// Batch validate multiple links
const results = await validator.validateLinks([...urls]);
```

### BrokenLinkUpdater Class

```typescript
import { BrokenLinkUpdater } from './updateBrokenLinks';

const updater = new BrokenLinkUpdater();

// Generate update plan from validation report
const actions = await updater.generateUpdatePlan(validationReport);

// Execute updates
const results = await updater.batchExecute(actions);
```

## Report Formats

### JSON Report
Complete validation data including:
- Individual vendor results
- Validation timestamps
- Response times
- Error details

### CSV Report
Spreadsheet-friendly format with:
- Business name
- Category
- Instagram handle
- Status
- Issues

### Markdown Report
Human-readable format with:
- Summary statistics
- Invalid profiles by category
- Private accounts list
- Action items

### HTML Report
Interactive web report with:
- Visual statistics
- Sortable tables
- Color-coded status indicators

## Validation Logic

### Instagram Profiles
1. **URL Construction**: Converts handle to Instagram URL
2. **Profile Existence**: Checks if profile exists (not 404)
3. **Privacy Status**: Detects private accounts
4. **Follower Count**: Extracts follower statistics when available
5. **Profile Data**: Captures bio, profile image, etc.

### Website URLs
1. **Protocol Handling**: Adds HTTPS if missing
2. **Response Codes**: Validates HTTP status
3. **Redirects**: Follows and reports redirects
4. **Error Handling**: Captures network errors

## Update Strategies

### Invalid Instagram Handles
1. **Variation Testing**: Tries common handle variations
2. **Business Name Mapping**: Converts business names to potential handles
3. **Suffix/Prefix Testing**: Tests with common business suffixes
4. **Manual Review**: Flags for manual verification when no matches found

### Update Actions
- **Update**: Replace with verified alternative handle
- **Remove**: Mark as invalid when no alternatives found
- **Mark Private**: Keep but note privacy status
- **Verify**: Re-check questionable results

## Error Handling

### Rate Limiting
- Automatic delays between requests
- Concurrent request limiting
- Exponential backoff for failures

### Network Errors
- Timeout handling (10-15 seconds)
- Retry logic for transient failures
- Graceful degradation for blocked requests

### Data Integrity
- Validation before database updates
- Rollback capability for failed batch updates
- Audit trail for all changes

## Best Practices

1. **Run Regularly**: Schedule monthly validations
2. **Review Results**: Manually verify suggested fixes
3. **Test in Batches**: Process vendors in small groups
4. **Monitor Rate Limits**: Avoid overwhelming social platforms
5. **Backup Data**: Save validation reports for historical tracking

## Troubleshooting

### Common Issues

**Instagram Blocking**: 
- Reduce concurrency limit
- Increase delays between requests
- Use different User-Agent strings

**Database Connection Errors**:
- Verify Supabase credentials
- Check network connectivity
- Ensure proper permissions

**High False Positives**:
- Adjust validation criteria
- Update handle variation logic
- Review business name parsing

### Performance Optimization

- Use `p-limit` for controlled concurrency
- Implement caching for repeated checks
- Batch database operations
- Use streaming for large datasets

## Extensions

### Adding New Cities
1. Create city-specific test script
2. Update vendor loading logic
3. Add city filters to database queries
4. Extend reporting for multi-city analysis

### Additional Platforms
1. Extend `LinkValidator` class
2. Add platform-specific validation logic
3. Update report generation
4. Add new update strategies

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

## License

This project is part of the Wedding Vendor Chronicles application.