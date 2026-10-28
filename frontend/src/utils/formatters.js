/**
 * Formatting utilities for CarbonTrack AI
 */

export function formatCO2(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0.0 kg CO2e';
  const val = Number(value);
  if (val >= 1000) {
    return `${(val / 1000).toFixed(2)} t CO2e`;
  }
  return `${val.toFixed(decimals)} kg CO2e`;
}

export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Downloads data as a CSV file in browser
 */
export function exportToCSV(data, filename = 'carbontrack_emissions_report.csv') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(obj =>
    headers
      .map(header => {
        let val = obj[header] ?? '';
        if (typeof val === 'string' && val.includes(',')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
