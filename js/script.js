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

// Function switching
function switchFunction(functionName) {
    const csvSection = document.getElementById('csv-converter-section');
    const editorSection = document.getElementById('json-editor-section');
    const mergerSection = document.getElementById('json-merger-section');
    const csvBtn = document.getElementById('csv-converter-btn');
    const editorBtn = document.getElementById('json-editor-btn');
    const mergerBtn = document.getElementById('json-merger-btn');

    if (functionName === 'csv') {
        csvSection.style.display = 'block';
        editorSection.style.display = 'none';
        mergerSection.style.display = 'none';
        csvBtn.classList.add('active');
        editorBtn.classList.remove('active');
        mergerBtn.classList.remove('active');
    } else if (functionName === 'editor') {
        csvSection.style.display = 'none';
        editorSection.style.display = 'block';
        mergerSection.style.display = 'none';
        csvBtn.classList.remove('active');
        editorBtn.classList.add('active');
        mergerBtn.classList.remove('active');
    } else if (functionName === 'merger') {
        csvSection.style.display = 'none';
        editorSection.style.display = 'none';
        mergerSection.style.display = 'block';
        csvBtn.classList.remove('active');
        editorBtn.classList.remove('active');
        mergerBtn.classList.add('active');
    }
}

// JSON Editor functionality
let editorData = null;
let currentColumns = [];
let displayRowCount = 5; // Default to show first 5 rows

function loadJsonForEditor(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Validate that all rows have the same structure
            const allKeys = Object.values(data).map(row => Object.keys(row).sort().join(','));
            const firstKeys = allKeys[0];

            if (!allKeys.every(keys => keys === firstKeys)) {
                document.getElementById('json-editor-output').textContent = 'Error: All JSON objects must have identical key structures.';
                return;
            }

            editorData = data;
            currentColumns = Object.keys(data[Object.keys(data)[0]]);
            renderTable();
            document.getElementById('table-editor').style.display = 'block';
            document.getElementById('json-editor-output').textContent = `JSON loaded successfully. Found ${Object.keys(data).length} rows with ${currentColumns.length} columns.`;
        } catch (error) {
            document.getElementById('json-editor-output').textContent = `Error parsing JSON: ${error.message}`;
        }
    };
    reader.readAsText(file);
}

function renderTable() {
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');

    // Render header
    tableHead.innerHTML = '<tr><th>Row ID</th>' +
        currentColumns.map(col => `
            <th>
                <div class="column-header">
                    <input type="text" value="${col}" class="column-name-input" data-column="${col}">
                    <div class="column-actions">
                        <button class="column-action-btn" onclick="deleteColumn('${col}')">×</button>
                    </div>
                </div>
            </th>
        `).join('') + '</tr>';

    // Render body - only show specified number of rows
    const rowKeys = Object.keys(editorData);
    const rowsToShow = displayRowCount === 'all' ? rowKeys : rowKeys.slice(0, displayRowCount);

    tableBody.innerHTML = rowsToShow.map(rowKey => `
        <tr>
            <td>${rowKey}</td>
            ${currentColumns.map(col => `
                <td><input type="text" value="${editorData[rowKey][col] || ''}" data-row="${rowKey}" data-column="${col}" onchange="updateCell(this)"></td>
            `).join('')}
        </tr>
    `).join('');

    // Add a note if not all rows are shown
    if (displayRowCount !== 'all' && rowKeys.length > displayRowCount) {
        tableBody.innerHTML += `
            <tr>
                <td colspan="${currentColumns.length + 1}" style="text-align: center; color: var(--text-secondary); font-style: italic; padding: var(--spacing-md);">
                    Showing first ${displayRowCount} rows of ${rowKeys.length} total rows
                </td>
            </tr>
        `;
    }
}

function updateCell(input) {
    const rowKey = input.dataset.row;
    const column = input.dataset.column;
    const value = input.value;

    // Try to parse as number if possible
    const numValue = parseFloat(value);
    editorData[rowKey][column] = isNaN(numValue) ? value : numValue;
}

function updateColumnName(input) {
    const oldName = input.dataset.column;
    const newName = input.value.trim();

    if (!newName || newName === oldName) {
        input.value = oldName;
        return;
    }

    if (currentColumns.includes(newName)) {
        alert('Column name already exists!');
        input.value = oldName;
        return;
    }

    // Update column name in data
    Object.keys(editorData).forEach(rowKey => {
        editorData[rowKey][newName] = editorData[rowKey][oldName];
        delete editorData[rowKey][oldName];
    });

    // Update currentColumns array
    const index = currentColumns.indexOf(oldName);
    currentColumns[index] = newName;

    // Re-render table
    renderTable();
}

function deleteColumn(columnName) {
    if (currentColumns.length <= 1) {
        alert('Cannot delete the last column!');
        return;
    }

    if (!confirm(`Are you sure you want to delete column "${columnName}"?`)) {
        return;
    }

    // Remove column from data
    Object.keys(editorData).forEach(rowKey => {
        delete editorData[rowKey][columnName];
    });

    // Remove from currentColumns
    currentColumns = currentColumns.filter(col => col !== columnName);

    // Re-render table
    renderTable();
}

function addColumn() {
    const modal = createModal('Add New Column', `
        <div class="form-group">
            <label for="new-column-name">Column Name:</label>
            <input type="text" id="new-column-name" placeholder="Enter column name">
        </div>
        <div class="form-group">
            <label for="default-value">Default Value:</label>
            <input type="text" id="default-value" placeholder="Enter default value (optional)">
        </div>
    `, () => {
        const columnName = document.getElementById('new-column-name').value.trim();
        const defaultValue = document.getElementById('default-value').value;

        if (!columnName) {
            alert('Column name is required!');
            return;
        }

        if (currentColumns.includes(columnName)) {
            alert('Column name already exists!');
            return;
        }

        // Add column to data
        const numValue = parseFloat(defaultValue);
        const value = isNaN(numValue) ? defaultValue : numValue;

        Object.keys(editorData).forEach(rowKey => {
            editorData[rowKey][columnName] = value;
        });

        // Add to currentColumns
        currentColumns.push(columnName);

        // Re-render table
        renderTable();

        // Close modal
        closeModal();
    });

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function calculateColumn() {
    const modal = createModal('Calculate New Column', `
        <div class="form-group">
            <label for="calc-column-name">New Column Name:</label>
            <input type="text" id="calc-column-name" placeholder="Enter new column name">
        </div>
        <div class="form-group">
            <label for="calc-expression">Calculation Expression:</label>
            <input type="text" id="calc-expression" placeholder="e.g., price * volume or col1 + col2">
            <small>Use column names as variables. Supports +, -, *, /, (, )</small>
        </div>
    `, () => {
        const columnName = document.getElementById('calc-column-name').value.trim();
        const expression = document.getElementById('calc-expression').value.trim();

        if (!columnName || !expression) {
            alert('Both column name and expression are required!');
            return;
        }

        if (currentColumns.includes(columnName)) {
            alert('Column name already exists!');
            return;
        }

        try {
            // Add calculated column to data
            Object.keys(editorData).forEach(rowKey => {
                const row = editorData[rowKey];
                // Create a function with column names as variables
                const func = new Function(...currentColumns, `return ${expression}`);
                const values = currentColumns.map(col => {
                    const val = row[col];
                    return typeof val === 'number' ? val : 0;
                });
                const result = func(...values);
                row[columnName] = Math.round(result * 100) / 100; // Round to 2 decimal places
            });

            // Add to currentColumns
            currentColumns.push(columnName);

            // Re-render table
            renderTable();

            // Close modal
            closeModal();
        } catch (error) {
            alert(`Error in calculation: ${error.message}`);
        }
    });

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function replaceValues() {
    const modal = createModal('Replace Values in Column', `
        <div class="form-group">
            <label for="replace-column-select">Select Column:</label>
            <select id="replace-column-select">
                ${currentColumns.map(col => `<option value="${col}">${col}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label for="regex-pattern">Regex Pattern:</label>
            <input type="text" id="regex-pattern" placeholder="e.g., old|value or ^prefix">
            <small>Use JavaScript regex syntax. Leave empty to match all values.</small>
        </div>
        <div class="form-group">
            <label for="replacement-value">Replacement Value:</label>
            <input type="text" id="replacement-value" placeholder="New value or $1, $2 for capture groups">
            <small>Use $1, $2, etc. to reference regex capture groups</small>
        </div>
        <div class="form-group inline-checkbox-group">
            <input type="checkbox" id="case-insensitive">
            <span class="checkbox-text">Case insensitive</span>
        </div>
        <div class="form-group inline-checkbox-group">
            <input type="checkbox" id="global-replace" checked>
            <span class="checkbox-text">Replace all matches</span>
        </div>
    `, () => {
        const columnName = document.getElementById('replace-column-select').value;
        const pattern = document.getElementById('regex-pattern').value;
        const replacement = document.getElementById('replacement-value').value;
        const caseInsensitive = document.getElementById('case-insensitive').checked;
        const globalReplace = document.getElementById('global-replace').checked;

        if (!columnName) {
            alert('Please select a column!');
            return;
        }

        try {
            // Create regex flags
            let flags = '';
            if (caseInsensitive) flags += 'i';
            if (globalReplace) flags += 'g';

            // Create regex pattern
            const regex = pattern ? new RegExp(pattern, flags) : new RegExp('.+', flags);

            // Apply replacement to all rows in the selected column
            let replacementCount = 0;
            Object.keys(editorData).forEach(rowKey => {
                const currentValue = String(editorData[rowKey][columnName] || '');
                const newValue = currentValue.replace(regex, replacement);

                if (currentValue !== newValue) {
                    // Try to parse as number if possible
                    const numValue = parseFloat(newValue);
                    editorData[rowKey][columnName] = isNaN(numValue) ? newValue : numValue;
                    replacementCount++;
                }
            });

            // Re-render table
            renderTable();

            // Show success message
            document.getElementById('json-editor-output').textContent = `Successfully replaced ${replacementCount} value(s) in column "${columnName}".`;

            // Close modal
            closeModal();
        } catch (error) {
            alert(`Error in regex replacement: ${error.message}`);
        }
    }, 'Replace Values');

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function createModal(title, bodyHtml, onConfirm, buttonText = 'Add Column') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                ${bodyHtml}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="confirmModal()">${buttonText}</button>
            </div>
        </div>
    `;

    // Store the confirm callback
    modal.confirmCallback = onConfirm;

    return modal;
}

function closeModal() {
    const modal = document.querySelector('.modal.show');
    if (modal) {
        modal.remove();
    }
}

function confirmModal() {
    const modal = document.querySelector('.modal.show');
    if (modal && modal.confirmCallback) {
        modal.confirmCallback();
    }
}

function downloadJson() {
    const jsonContent = JSON.stringify(editorData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'edited_data.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// JSON Merger functionality
let mergerFiles = [];

function loadJsonMergerFiles() {
    const fileInput = document.getElementById('json-merger-files');
    const files = Array.from(fileInput.files);

    if (files.length === 0) {
        document.getElementById('json-merger-output').textContent = 'Please select at least one JSON file.';
        return;
    }

    mergerFiles = [];
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    let loadedCount = 0;
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                mergerFiles.push({
                    name: file.name,
                    data: data,
                    keyValuePairs: []
                });

                // Create file config UI
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <div class="file-header">
                        <h4>${file.name}</h4>
                        <span class="file-info">${Object.keys(data).length} objects</span>
                    </div>
                    <div class="key-value-pairs" id="kv-pairs-${index}">
                        <div class="kv-pair">
                            <input type="text" placeholder="Key" class="kv-key">
                            <input type="text" placeholder="Value" class="kv-value">
                            <button class="btn btn-small btn-secondary add-kv-btn">+</button>
                        </div>
                    </div>
                `;
                fileList.appendChild(fileItem);

                loadedCount++;
                if (loadedCount === files.length) {
                    document.getElementById('file-configs').style.display = 'block';
                    document.getElementById('json-merger-output').textContent = `Loaded ${files.length} JSON files successfully.`;
                }
            } catch (error) {
                document.getElementById('json-merger-output').textContent = `Error parsing ${file.name}: ${error.message}`;
            }
        };
        reader.readAsText(file);
    });
}

function mergeJsonFiles() {
    if (mergerFiles.length === 0) {
        document.getElementById('json-merger-output').textContent = 'No files loaded. Please load JSON files first.';
        return;
    }

    // Collect all key-value pairs from UI first
    mergerFiles.forEach((file, index) => {
        const kvContainer = document.getElementById(`kv-pairs-${index}`);
        const kvPairs = [];
        const kvInputs = kvContainer.querySelectorAll('.kv-pair');

        kvInputs.forEach(pair => {
            const key = pair.querySelector('.kv-key').value.trim();
            const value = pair.querySelector('.kv-value').value.trim();
            if (key && value) {
                kvPairs.push({ key, value });
            }
        });
        file.keyValuePairs = kvPairs;
    });

    // Check for conflicts (duplicate top-level keys)
    const allKeys = new Map();
    const conflicts = [];

    mergerFiles.forEach((file, fileIndex) => {
        Object.keys(file.data).forEach(objKey => {
            if (allKeys.has(objKey)) {
                // Conflict found
                const existing = allKeys.get(objKey);
                if (!conflicts.some(c => c.key === objKey)) {
                    conflicts.push({
                        key: objKey,
                        sources: [existing, { fileIndex, data: file.data[objKey] }]
                    });
                } else {
                    conflicts.find(c => c.key === objKey).sources.push({ fileIndex, data: file.data[objKey] });
                }
            } else {
                allKeys.set(objKey, { fileIndex, data: file.data[objKey] });
            }
        });
    });

    if (conflicts.length > 0) {
        // Show conflict resolution interface
        showConflictResolution(conflicts, allKeys);
    } else {
        // No conflicts, proceed with normal merge
        performMerge(allKeys);
    }
}

let currentConflictIndex = 0;
let conflictResolutions = {};
let tempConflictResolutions = {}; // Temporary storage for current page selections

function showConflictResolution(conflicts, allKeys) {
    currentConflictIndex = 0;
    conflictResolutions = {};
    tempConflictResolutions = {}; // Reset temporary storage

    showConflictPage(conflicts, allKeys);
}

function showConflictPage(conflicts, allKeys) {
    const conflict = conflicts[currentConflictIndex];

    // Collect keys that have conflicts or are complementary
    const conflictingKeys = new Map();
    const keySources = {};

    conflict.sources.forEach((source, sourceIndex) => {
        const sourceFile = mergerFiles[source.fileIndex];
        const finalData = { ...source.data };
        sourceFile.keyValuePairs.forEach(kv => {
            finalData[kv.key] = kv.value;
        });

        Object.keys(finalData).forEach(key => {
            if (!keySources[key]) {
                keySources[key] = [];
            }
            keySources[key].push({
                fileIndex: source.fileIndex,
                fileName: sourceFile.name,
                value: finalData[key],
                sourceIndex
            });
        });
    });

    // Only include keys that are either:
    // 1. Present in multiple sources (potentially with different values)
    // 2. Present in only one source (complementary)
    const keysToShow = Object.keys(keySources).filter(key => {
        const sources = keySources[key];
        if (sources.length === 1) {
            // Complementary key - only in one source
            return true;
        }
        if (sources.length > 1) {
            // Check if values are different
            const values = sources.map(s => JSON.stringify(s.value));
            const uniqueValues = [...new Set(values)];
            return uniqueValues.length > 1; // Different values = conflict
        }
        return false;
    });

    const sortedKeys = keysToShow.sort();

    const modal = createModal(`Resolve Conflict for Key: "${conflict.key}" (${currentConflictIndex + 1} of ${conflicts.length})`, `
        <div class="conflict-resolution">
            <div class="conflict-navigation">
                <label for="conflict-selector">Select Conflict:</label>
                <select id="conflict-selector" class="conflict-selector" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: white; font-size: 14px; width: 100%; margin-left: 0;">
                    ${conflicts.map((c, index) => `<option value="${index}" ${index === currentConflictIndex ? 'selected' : ''}>${index + 1}: "${c.key}"</option>`).join('')}
                </select>
            </div>
            <div class="conflict-content">
                <p class="conflict-description">Choose how to merge each key-value pair for this conflicting key:</p>
                <div class="key-merge-grid">
                    ${sortedKeys.map(key => {
                        const sources = keySources[key];
                        // Check both final resolutions and temporary selections for current page
                        const finalValue = conflictResolutions[conflict.key]?.[key];
                        const tempValue = tempConflictResolutions[conflict.key]?.[key];
                        const currentValue = tempValue !== undefined ? tempValue : finalValue;

                        return `
                            <div class="key-merge-row">
                                <div class="key-name">${key}:</div>
                                <div class="key-options">
                                    ${sources.map(source => `
                                        <label class="key-source-option">
                                            <input type="radio" name="key-${conflict.key}-${key}" value="source-${source.fileIndex}-${source.sourceIndex}" ${(!currentValue || currentValue === `source-${source.fileIndex}-${source.sourceIndex}`) && source.sourceIndex === 0 ? 'checked' : currentValue === `source-${source.fileIndex}-${source.sourceIndex}` ? 'checked' : ''}>
                                            <span class="source-tag" style="background: ${getFileColor(source.fileIndex)}">${source.fileName}</span>
                                            <code class="key-value">${typeof source.value === 'string' ? source.value : JSON.stringify(source.value)}</code>
                                        </label>
                                    `).join('')}
                                    <div class="manual-input-option">
                                        <label class="key-source-option">
                                            <input type="radio" name="key-${conflict.key}-${key}" value="manual" ${currentValue && currentValue.startsWith('manual-') ? 'checked' : ''}>
                                            <span class="source-tag manual-tag">Manual</span>
                                            <input type="text" class="manual-value-input" placeholder="Enter custom value..." value="${currentValue && currentValue.startsWith('manual-') ? currentValue.substring(7) : ''}" style="display: ${currentValue && currentValue.startsWith('manual-') ? 'block' : 'none'}">
                                        </label>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `, () => {
        // Save current page selections to final resolutions before finishing
        saveCurrentPageToFinal(conflict, sortedKeys);

        // If this is the last conflict, perform merge
        if (currentConflictIndex === conflicts.length - 1) {
            performGranularMerge(allKeys, conflictResolutions);
            closeModal();
        } else {
            // Move to next conflict
            currentConflictIndex++;
            closeModal();
            showConflictPage(conflicts, allKeys);
        }
    }, currentConflictIndex === conflicts.length - 1 ? 'Finish & Merge' : 'Next Conflict');

    // Add navigation event listeners immediately after modal is appended
    document.body.appendChild(modal);
    modal.classList.add('show');

    // Add conflict selector event listener
    const conflictSelector = document.getElementById('conflict-selector');

    if (conflictSelector) {
        conflictSelector.addEventListener('change', (e) => {
            const selectedIndex = parseInt(e.target.value);
            if (selectedIndex !== currentConflictIndex) {
                // Save current page selections to temp storage
                saveCurrentPageToTemp(conflict, sortedKeys);
                currentConflictIndex = selectedIndex;
                closeModal();
                showConflictPage(conflicts, allKeys);
            }
        });
    }

    // Handle manual input visibility
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const keyRow = e.target.closest('.key-merge-row');
            const manualInput = keyRow.querySelector('.manual-value-input');
            if (e.target.value === 'manual') {
                manualInput.style.display = 'block';
                manualInput.focus();
            } else {
                manualInput.style.display = 'none';
            }
        });
    });

    // Handle manual input changes
    document.querySelectorAll('.manual-value-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const keyRow = e.target.closest('.key-merge-row');
            const radio = keyRow.querySelector('input[value="manual"]');
            if (radio.checked) {
                // Update the temp storage value
                const keyName = keyRow.querySelector('.key-name').textContent.slice(0, -1); // Remove colon
                if (!tempConflictResolutions[conflict.key]) {
                    tempConflictResolutions[conflict.key] = {};
                }
                tempConflictResolutions[conflict.key][keyName] = `manual-${e.target.value}`;
            }
        });
    });
}

function saveCurrentConflictResolution(conflict, sortedKeys) {
    if (!conflictResolutions[conflict.key]) {
        conflictResolutions[conflict.key] = {};
    }

    sortedKeys.forEach(key => {
        const radios = document.querySelectorAll(`input[name="key-${conflict.key}-${key}"]`);
        radios.forEach(radio => {
            if (radio.checked) {
                if (radio.value === 'manual') {
                    const manualInput = radio.closest('.key-merge-row').querySelector('.manual-value-input');
                    try {
                        conflictResolutions[conflict.key][key] = JSON.parse(manualInput.value);
                    } catch {
                        conflictResolutions[conflict.key][key] = manualInput.value;
                    }
                } else {
                    const [type, fileIndex, sourceIndex] = radio.value.split('-');
                    const source = conflict.sources[parseInt(sourceIndex)];
                    const sourceFile = mergerFiles[source.fileIndex];
                    const finalData = { ...source.data };
                    sourceFile.keyValuePairs.forEach(kv => {
                        finalData[kv.key] = kv.value;
                    });
                    conflictResolutions[conflict.key][key] = finalData[key];
                }
            }
        });
    });
}

function saveCurrentPageToTemp(conflict, sortedKeys) {
    if (!tempConflictResolutions[conflict.key]) {
        tempConflictResolutions[conflict.key] = {};
    }

    sortedKeys.forEach(key => {
        const radios = document.querySelectorAll(`input[name="key-${conflict.key}-${key}"]`);
        radios.forEach(radio => {
            if (radio.checked) {
                if (radio.value === 'manual') {
                    const manualInput = radio.closest('.key-merge-row').querySelector('.manual-value-input');
                    tempConflictResolutions[conflict.key][key] = `manual-${manualInput.value}`;
                } else {
                    const [type, fileIndex, sourceIndex] = radio.value.split('-');
                    tempConflictResolutions[conflict.key][key] = `source-${fileIndex}-${sourceIndex}`;
                }
            }
        });
    });
}

function saveCurrentPageToFinal(conflict, sortedKeys) {
    if (!conflictResolutions[conflict.key]) {
        conflictResolutions[conflict.key] = {};
    }

    // Collect all possible keys from all sources
    const allKeys = new Set();
    conflict.sources.forEach(source => {
        const sourceFile = mergerFiles[source.fileIndex];
        const finalData = { ...source.data };
        sourceFile.keyValuePairs.forEach(kv => {
            finalData[kv.key] = kv.value;
        });
        Object.keys(finalData).forEach(key => allKeys.add(key));
    });

    // For keys that were shown to user, use their selections
    sortedKeys.forEach(key => {
        const radios = document.querySelectorAll(`input[name="key-${conflict.key}-${key}"]`);
        radios.forEach(radio => {
            if (radio.checked) {
                if (radio.value === 'manual') {
                    const manualInput = radio.closest('.key-merge-row').querySelector('.manual-value-input');
                    try {
                        conflictResolutions[conflict.key][key] = JSON.parse(manualInput.value);
                    } catch {
                        conflictResolutions[conflict.key][key] = manualInput.value;
                    }
                } else {
                    const [type, fileIndex, sourceIndex] = radio.value.split('-');
                    const source = conflict.sources[parseInt(sourceIndex)];
                    const sourceFile = mergerFiles[source.fileIndex];
                    const finalData = { ...source.data };
                    sourceFile.keyValuePairs.forEach(kv => {
                        finalData[kv.key] = kv.value;
                    });
                    conflictResolutions[conflict.key][key] = finalData[key];
                }
            }
        });
    });

    // For keys that were not shown (no conflicts), use the value from the first source
    allKeys.forEach(key => {
        if (!conflictResolutions[conflict.key][key]) {
            const firstSource = conflict.sources[0];
            const sourceFile = mergerFiles[firstSource.fileIndex];
            const finalData = { ...firstSource.data };
            sourceFile.keyValuePairs.forEach(kv => {
                finalData[kv.key] = kv.value;
            });
            conflictResolutions[conflict.key][key] = finalData[key];
        }
    });
}

function getFileColor(fileIndex) {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    return colors[fileIndex % colors.length];
}

// Handle adding key-value pairs dynamically
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-kv-btn')) {
        const kvPair = e.target.parentElement;
        const newKvPair = document.createElement('div');
        newKvPair.className = 'kv-pair';
        newKvPair.innerHTML = `
            <input type="text" placeholder="Key" class="kv-key">
            <input type="text" placeholder="Value" class="kv-value">
            <button class="btn btn-small btn-danger remove-kv-btn">-</button>
        `;
        kvPair.parentElement.appendChild(newKvPair);
    }

    if (e.target.classList.contains('remove-kv-btn')) {
        e.target.parentElement.remove();
    }
});

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('csv-converter-btn').addEventListener('click', () => switchFunction('csv'));
    document.getElementById('json-editor-btn').addEventListener('click', () => switchFunction('editor'));
    document.getElementById('json-merger-btn').addEventListener('click', () => switchFunction('merger'));

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

    document.getElementById('load-json-editor-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('json-editor-file-input');
        const file = fileInput.files[0];
        if (!file) {
            document.getElementById('json-editor-output').textContent = 'Please select a JSON file.';
            return;
        }
        loadJsonForEditor(file);
    });

    document.getElementById('add-column-btn').addEventListener('click', addColumn);
    document.getElementById('calculate-column-btn').addEventListener('click', calculateColumn);
    document.getElementById('download-json-btn').addEventListener('click', downloadJson);
    document.getElementById('replace-values-btn').addEventListener('click', replaceValues);

    // JSON Merger event listeners
    document.getElementById('load-json-merger-btn').addEventListener('click', loadJsonMergerFiles);
    document.getElementById('merge-json-btn').addEventListener('click', mergeJsonFiles);

    // Handle row display selection
    document.getElementById('row-display-select').addEventListener('change', (e) => {
        const value = e.target.value;
        displayRowCount = value === 'all' ? 'all' : parseInt(value);
        if (editorData) {
            renderTable();
        }
    });

    // Handle column name changes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('column-name-input')) {
            updateColumnName(e.target);
        }
    });
});

// JSON Merger merge functions
function performMerge(allKeys) {
    const mergedData = {};

    // For each unique key, take the first occurrence (no conflicts)
    allKeys.forEach((value, key) => {
        const sourceFile = mergerFiles[value.fileIndex];
        const finalData = { ...value.data };
        sourceFile.keyValuePairs.forEach(kv => {
            finalData[kv.key] = kv.value;
        });
        mergedData[key] = finalData;
    });

    // Download the merged JSON
    const jsonContent = JSON.stringify(mergedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'merged_data.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    document.getElementById('json-merger-output').textContent = 'JSON files merged successfully and downloaded.';
}

function performGranularMerge(allKeys, conflictResolutions) {
    const mergedData = {};

    // Process each key (both conflicting and non-conflicting)
    allKeys.forEach((value, key) => {
        if (conflictResolutions[key]) {
            // This key had conflicts and was resolved
            mergedData[key] = conflictResolutions[key];
        } else {
            // This key had no conflicts, use the first occurrence
            const sourceFile = mergerFiles[value.fileIndex];
            const finalData = { ...value.data };
            sourceFile.keyValuePairs.forEach(kv => {
                finalData[kv.key] = kv.value;
            });
            mergedData[key] = finalData;
        }
    });

    // Download the merged JSON
    const jsonContent = JSON.stringify(mergedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'merged_data.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    document.getElementById('json-merger-output').textContent = 'JSON files merged successfully with granular conflict resolution and downloaded.';
}
