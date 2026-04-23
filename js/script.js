// Utils Studio Framework

// Inline utils to avoid module issues
const utils = {};

// String utility functions
utils.capitalize = function(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

utils.reverse = function(str) {
    return str.split('').reverse().join('');
};

utils.isPalindrome = function(str) {
    const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return cleaned === cleaned.split('').reverse().join('');
};

// Array utility functions
utils.removeDuplicates = function(arr) {
    return [...new Set(arr)];
};

utils.shuffle = function(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

utils.max = function(arr) {
    return Math.max(...arr);
};

// Math utility functions
utils.factorial = function(n) {
    if (n < 0) return undefined;
    if (n === 0 || n === 1) return 1;
    return n * utils.factorial(n - 1);
};

utils.isPrime = function(n) {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
};

utils.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function registry with descriptions
const functionRegistry = {
    capitalize: { func: utils.capitalize, desc: 'Capitalize first letter' },
    reverse: { func: utils.reverse, desc: 'Reverse string' },
    isPalindrome: { func: utils.isPalindrome, desc: 'Check if palindrome' },
    removeDuplicates: { func: utils.removeDuplicates, desc: 'Remove duplicates from array (input as JSON)' },
    shuffle: { func: utils.shuffle, desc: 'Shuffle array (input as JSON)' },
    max: { func: utils.max, desc: 'Max value in array (input as JSON)' },
    factorial: { func: utils.factorial, desc: 'Factorial of number' },
    isPrime: { func: utils.isPrime, desc: 'Check if prime' },
    randomInt: { func: () => utils.randomInt(1, 100), desc: 'Random int 1-100 (no input needed)' },
    jsonToCsv: { func: null, desc: 'Convert JSON file to CSV (upload file)' }
};

// Populate select options
const select = document.getElementById('function-select');
Object.keys(functionRegistry).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${key}: ${functionRegistry[key].desc}`;
    select.appendChild(option);
});

// Handle function selection to change input UI
select.addEventListener('change', () => {
    const selectedFunc = select.value;
    const inputSection = document.getElementById('input-section');
    const executeBtn = document.getElementById('execute-btn');

    if (selectedFunc === 'jsonToCsv') {
        inputSection.innerHTML = `
            <input type="file" id="json-file-input" accept=".json">
            <button id="load-json-btn">Load JSON</button>
            <div id="column-selection" style="display: none;">
                <h3>Select Columns:</h3>
                <div id="checkboxes"></div>
                <button id="generate-csv-btn">Generate CSV</button>
            </div>
            <div id="json-output"></div>
        `;
        executeBtn.style.display = 'none'; // Hide execute button for this function
        // Re-attach event listeners
        attachJsonToCsvListeners();
    } else {
        inputSection.innerHTML = '<input type="text" id="input-value" placeholder="Enter input value">';
        executeBtn.style.display = 'inline-block';
    }
});

// Execute function
document.getElementById('execute-btn').addEventListener('click', () => {
    const selectedFunc = select.value;
    const inputValue = document.getElementById('input-value').value;
    const outputDiv = document.getElementById('output');

    if (!selectedFunc) {
        outputDiv.textContent = 'Please select a function.';
        return;
    }

    try {
        let result;
        if (selectedFunc === 'randomInt') {
            result = functionRegistry[selectedFunc].func();
        } else if (['removeDuplicates', 'shuffle', 'max'].includes(selectedFunc)) {
            const arr = JSON.parse(inputValue);
            result = functionRegistry[selectedFunc].func(arr);
        } else if (['factorial', 'isPrime'].includes(selectedFunc)) {
            const num = parseInt(inputValue);
            result = functionRegistry[selectedFunc].func(num);
        } else {
            result = functionRegistry[selectedFunc].func(inputValue);
        }
        outputDiv.textContent = `Result: ${JSON.stringify(result)}`;
    } catch (error) {
        outputDiv.textContent = `Error: ${error.message}`;
    }
});

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
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = col;
        checkbox.checked = true; // Default to checked
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(col));
        checkboxesDiv.appendChild(label);
    });
    document.getElementById('column-selection').style.display = 'block';
}

function generateCSV(data, columns) {
    const header = columns.join(',');
    const rows = Object.values(data).map(row =>
        columns.map(col => {
            const value = row[col];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        }).join(',')
    );
    return [header, ...rows].join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function attachJsonToCsvListeners() {
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
}
