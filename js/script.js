// JSON to CSV functionality
let jsonData = null;
let commonColumns = [];

function findCommonColumns(data) {
    const allKeys = Object.values(data).map(row => Object.keys(row));
    if (allKeys.length === 0) return [];
    return allKeys.reduce((common, keys) => common.filter(key => keys.includes(key)));
}

function displayColumnSelection(columns) {
    const checkboxesDiv = document.getElementById('checkboxes');
    checkboxesDiv.innerHTML = '';
    columns.forEach(col => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = col;
        checkbox.checked = true; // Default to checked
        checkbox.id = `col-${col}`;

        const label = document.createElement('label');
        label.htmlFor = `col-${col}`;
        label.textContent = col;

        checkboxItem.appendChild(checkbox);
        checkboxItem.appendChild(label);
        checkboxesDiv.appendChild(checkboxItem);
    });
    document.getElementById('column-selection').style.display = 'block';
}

function generateCSV(data, columns) {
    // Add "股票代码" as the first column
    const csvColumns = ['股票代码', ...columns];
    const header = csvColumns.join(',');

    // Get row keys (一级键名)
    const rowKeys = Object.keys(data);

    const rows = rowKeys.map(rowKey => {
        const row = data[rowKey];
        // First column is the row key (股票代码), then the selected columns
        const rowData = [rowKey, ...columns.map(col => {
            const value = row[col];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        })];
        return rowData.join(',');
    });

    return [header, ...rows].join('\n');
}

function downloadCSV(content, filename) {
    // Add UTF-8 BOM to ensure proper Chinese character display
    const BOM = '\uFEFF';
    const csvContent = BOM + content;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize event listeners
document.getElementById('load-json-btn').addEventListener('click', () => {
    const fileInput = document.getElementById('json-file-input');
    const file = fileInput.files[0];
    if (!file) {
        document.getElementById('json-output').textContent = 'Please select a JSON file.';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            jsonData = JSON.parse(e.target.result);
            commonColumns = findCommonColumns(jsonData);
            displayColumnSelection(commonColumns);
            document.getElementById('json-output').textContent = `JSON loaded successfully. Found ${Object.keys(jsonData).length} rows. Common columns: ${commonColumns.join(', ')}`;
        } catch (error) {
            document.getElementById('json-output').textContent = `Error parsing JSON: ${error.message}`;
        }
    };
    reader.readAsText(file);
});

document.getElementById('generate-csv-btn').addEventListener('click', () => {
    const selectedColumns = Array.from(document.querySelectorAll('#checkboxes input:checked')).map(cb => cb.value);
    if (selectedColumns.length === 0) {
        document.getElementById('json-output').textContent = 'Please select at least one column.';
        return;
    }

    const csvContent = generateCSV(jsonData, selectedColumns);
    downloadCSV(csvContent, 'export.csv');
    document.getElementById('json-output').textContent = 'CSV generated and downloaded.';
});
