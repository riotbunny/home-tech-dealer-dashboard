/**
 * Google Apps Script Webhook for Automatic Sheet 3 Appending
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any code in the editor and paste the code below.
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set "Execute as": "Me".
 * 7. Set "Who has access": "Anyone" (or anyone with the link).
 * 8. Click "Deploy" and copy the Web App URL.
 * 9. Add this URL as GOOGLE_SHEETS_WEBHOOK_URL in Vercel Environment Variables!
 */

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheetName = contents.sheetName || 'Sheet3';
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    // If Sheet3 doesn't exist, create it with standard headers
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Date', 'Total Spend', 'Total Leads', 'Cost Per Lead (CPL)', 'CTR', 'CPC']);
    }
    
    // Extract row array: [Date, Total Spend, Total Leads, CPL, CTR, CPC]
    var rowData = contents.row;
    if (!rowData && contents.data) {
      rowData = [
        contents.data.date,
        contents.data.totalSpend,
        contents.data.totalLeads,
        contents.data.costPerLead,
        contents.data.ctr,
        contents.data.cpc
      ];
    }
    
    if (rowData && Array.isArray(rowData)) {
      sheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Successfully appended row to ' + sheetName,
        row: rowData
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid or missing row data array'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Home Tech Dealer Leads Sheet Webhook is active.'
  })).setMimeType(ContentService.MimeType.JSON);
}
