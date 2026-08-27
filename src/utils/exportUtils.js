import Papa from 'papaparse';

/**
 * Exports current lead array to CSV download file
 */
export function exportLeadsToCSV(leads, filename = 'home-tech-dealer-leads') {
  if (!leads || leads.length === 0) {
    alert('No lead records to export.');
    return;
  }

  // Format leads for export (Columns A-I)
  const dataToExport = leads.map(lead => ({
    'Full Name': lead.fullName,
    'Phone': lead.phone,
    'Address': lead.address,
    'Usage': lead.usage,
    'Timestamp': lead.timestamp,
    'Status': lead.status,
    'Drip Day': lead.dripDay,
    'City': lead.City,
    'State': lead.State
  }));

  const csv = Papa.unparse(dataToExport);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
