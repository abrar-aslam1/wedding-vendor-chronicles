import * as fs from 'fs';
import * as path from 'path';
import { ValidationReport } from './testDallasVendors';

interface DetailedReport {
  summary: {
    totalVendors: number;
    validProfiles: number;
    invalidProfiles: number;
    privateAccounts: number;
    redirects: number;
    errors: number;
    validationRate: string;
  };
  byCategory: Record<string, {
    total: number;
    valid: number;
    invalid: number;
    private: number;
    vendors: Array<{
      name: string;
      handle: string;
      status: string;
      issue?: string;
    }>;
  }>;
  actionItems: {
    mustFix: Array<{
      vendor: string;
      category: string;
      handle: string;
      issue: string;
      suggestedAction: string;
    }>;
    shouldReview: Array<{
      vendor: string;
      category: string;
      handle: string;
      issue: string;
    }>;
  };
  exportFormats: {
    csv: string;
    markdown: string;
    html: string;
  };
}

export function generateDetailedReport(validationReport: ValidationReport): DetailedReport {
  const { totalVendors, totalChecked, results, invalidVendors, privateAccounts, redirects } = validationReport;
  
  // Build category breakdown
  const byCategory: DetailedReport['byCategory'] = {};
  
  // Process all results by vendor category
  const vendorCategories = new Map<string, string>();
  
  // Map vendors to categories from invalid vendors
  invalidVendors.forEach(v => vendorCategories.set(v.instagramHandle, v.category));
  privateAccounts.forEach(v => vendorCategories.set(v.instagramHandle, v.category));
  
  // Initialize categories
  const allCategories = new Set([
    ...invalidVendors.map(v => v.category),
    ...privateAccounts.map(v => v.category),
    ...redirects.map(v => v.category)
  ]);
  
  allCategories.forEach(category => {
    byCategory[category] = {
      total: 0,
      valid: 0,
      invalid: 0,
      private: 0,
      vendors: []
    };
  });
  
  // Populate category data
  invalidVendors.forEach(vendor => {
    const cat = byCategory[vendor.category];
    cat.total++;
    cat.invalid++;
    cat.vendors.push({
      name: vendor.businessName,
      handle: vendor.instagramHandle,
      status: 'invalid',
      issue: vendor.error || 'Profile not found'
    });
  });
  
  privateAccounts.forEach(vendor => {
    const cat = byCategory[vendor.category];
    cat.total++;
    cat.private++;
    cat.vendors.push({
      name: vendor.businessName,
      handle: vendor.instagramHandle,
      status: 'private',
      issue: 'Private account'
    });
  });
  
  // Build action items
  const actionItems: DetailedReport['actionItems'] = {
    mustFix: [],
    shouldReview: []
  };
  
  invalidVendors.forEach(vendor => {
    actionItems.mustFix.push({
      vendor: vendor.businessName,
      category: vendor.category,
      handle: vendor.instagramHandle,
      issue: vendor.error || 'Profile not found',
      suggestedAction: vendor.statusCode === 404 
        ? 'Verify handle spelling or find new Instagram account'
        : 'Check if account was deleted or suspended'
    });
  });
  
  privateAccounts.forEach(vendor => {
    actionItems.shouldReview.push({
      vendor: vendor.businessName,
      category: vendor.category,
      handle: vendor.instagramHandle,
      issue: 'Private Instagram account'
    });
  });
  
  // Generate export formats
  const csvContent = generateCSV(validationReport);
  const markdownContent = generateMarkdown(validationReport);
  const htmlContent = generateHTML(validationReport);
  
  return {
    summary: {
      totalVendors,
      validProfiles: results.valid,
      invalidProfiles: results.invalid,
      privateAccounts: privateAccounts.length,
      redirects: results.redirect,
      errors: results.error,
      validationRate: ((results.valid / totalChecked) * 100).toFixed(1) + '%'
    },
    byCategory,
    actionItems,
    exportFormats: {
      csv: csvContent,
      markdown: markdownContent,
      html: htmlContent
    }
  };
}

function generateCSV(report: ValidationReport): string {
  let csv = 'Business Name,Category,Instagram Handle,Status,Issue,Status Code\n';
  
  // Add invalid vendors
  report.invalidVendors.forEach(vendor => {
    csv += `"${vendor.businessName}","${vendor.category}","${vendor.instagramHandle}","Invalid","${vendor.error || 'Profile not found'}","${vendor.statusCode || ''}"\n`;
  });
  
  // Add private accounts
  report.privateAccounts.forEach(vendor => {
    csv += `"${vendor.businessName}","${vendor.category}","${vendor.instagramHandle}","Private","Private account","200"\n`;
  });
  
  // Add redirects
  report.redirects.forEach(vendor => {
    csv += `"${vendor.businessName}","${vendor.category}","${vendor.originalUrl}","Redirect","Redirects to ${vendor.redirectUrl}","301"\n`;
  });
  
  return csv;
}

function generateMarkdown(report: ValidationReport): string {
  let md = `# Dallas Wedding Vendor Instagram Validation Report\n\n`;
  md += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- **Total Vendors**: ${report.totalVendors}\n`;
  md += `- **Valid Profiles**: ${report.results.valid} (${((report.results.valid / report.totalChecked) * 100).toFixed(1)}%)\n`;
  md += `- **Invalid Profiles**: ${report.results.invalid}\n`;
  md += `- **Private Accounts**: ${report.privateAccounts.length}\n`;
  md += `- **Redirects**: ${report.results.redirect}\n`;
  md += `- **Errors**: ${report.results.error}\n\n`;
  
  if (report.invalidVendors.length > 0) {
    md += `## Invalid Profiles (Action Required)\n\n`;
    md += `| Business Name | Category | Instagram Handle | Issue |\n`;
    md += `|---------------|----------|------------------|-------|\n`;
    
    report.invalidVendors.forEach(vendor => {
      md += `| ${vendor.businessName} | ${vendor.category} | @${vendor.instagramHandle} | ${vendor.error || 'Profile not found'} |\n`;
    });
    md += `\n`;
  }
  
  if (report.privateAccounts.length > 0) {
    md += `## Private Accounts\n\n`;
    md += `| Business Name | Category | Instagram Handle |\n`;
    md += `|---------------|----------|------------------|\n`;
    
    report.privateAccounts.forEach(vendor => {
      md += `| ${vendor.businessName} | ${vendor.category} | @${vendor.instagramHandle} |\n`;
    });
    md += `\n`;
  }
  
  return md;
}

function generateHTML(report: ValidationReport): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Dallas Vendor Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .stats { display: flex; gap: 20px; margin-top: 10px; }
    .stat { background: white; padding: 10px; border-radius: 3px; }
    .invalid { color: #d32f2f; }
    .valid { color: #388e3c; }
    .warning { color: #f57c00; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
    .category-header { background: #e0e0e0; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Dallas Wedding Vendor Instagram Validation Report</h1>
  <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="stats">
      <div class="stat">Total Vendors: <strong>${report.totalVendors}</strong></div>
      <div class="stat valid">Valid: <strong>${report.results.valid}</strong> (${((report.results.valid / report.totalChecked) * 100).toFixed(1)}%)</div>
      <div class="stat invalid">Invalid: <strong>${report.results.invalid}</strong></div>
      <div class="stat warning">Private: <strong>${report.privateAccounts.length}</strong></div>
    </div>
  </div>
  
  ${report.invalidVendors.length > 0 ? `
  <h2 class="invalid">Invalid Profiles - Action Required</h2>
  <table>
    <thead>
      <tr>
        <th>Business Name</th>
        <th>Category</th>
        <th>Instagram Handle</th>
        <th>Issue</th>
        <th>Suggested Action</th>
      </tr>
    </thead>
    <tbody>
      ${report.invalidVendors.map(vendor => `
      <tr>
        <td>${vendor.businessName}</td>
        <td>${vendor.category}</td>
        <td>@${vendor.instagramHandle}</td>
        <td>${vendor.error || 'Profile not found'}</td>
        <td>${vendor.statusCode === 404 ? 'Verify handle or find new account' : 'Check account status'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
  
  ${report.privateAccounts.length > 0 ? `
  <h2 class="warning">Private Accounts</h2>
  <table>
    <thead>
      <tr>
        <th>Business Name</th>
        <th>Category</th>
        <th>Instagram Handle</th>
      </tr>
    </thead>
    <tbody>
      ${report.privateAccounts.map(vendor => `
      <tr>
        <td>${vendor.businessName}</td>
        <td>${vendor.category}</td>
        <td>@${vendor.instagramHandle}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
</body>
</html>`;
  
  return html;
}

export function saveReports(report: ValidationReport, outputDir: string = './reports'): void {
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const detailedReport = generateDetailedReport(report);
  
  // Save JSON report
  const jsonPath = path.join(outputDir, `dallas_validation_${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`JSON report saved: ${jsonPath}`);
  
  // Save CSV
  const csvPath = path.join(outputDir, `dallas_validation_${timestamp}.csv`);
  fs.writeFileSync(csvPath, detailedReport.exportFormats.csv);
  console.log(`CSV report saved: ${csvPath}`);
  
  // Save Markdown
  const mdPath = path.join(outputDir, `dallas_validation_${timestamp}.md`);
  fs.writeFileSync(mdPath, detailedReport.exportFormats.markdown);
  console.log(`Markdown report saved: ${mdPath}`);
  
  // Save HTML
  const htmlPath = path.join(outputDir, `dallas_validation_${timestamp}.html`);
  fs.writeFileSync(htmlPath, detailedReport.exportFormats.html);
  console.log(`HTML report saved: ${htmlPath}`);
  
  // Save detailed analysis
  const analysisPath = path.join(outputDir, `dallas_validation_analysis_${timestamp}.json`);
  fs.writeFileSync(analysisPath, JSON.stringify(detailedReport, null, 2));
  console.log(`Detailed analysis saved: ${analysisPath}`);
}