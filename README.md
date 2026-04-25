# Utils Studio - JSON Data Tools

A modern, responsive web application for JSON data manipulation with elegant user interfaces.

## ✨ Features

- **JSON to CSV Converter**: Convert JSON files to CSV format with column selection
- **JSON Table Editor**: Edit JSON data as a table with advanced column operations
- **JSON Merger**: Merge multiple JSON files with optional key-value pair additions
- **Modern UI**: Clean, responsive design with dark theme and smooth animations
- **File Upload**: Drag-and-drop style file upload with visual feedback
- **Smart Column Detection**: Automatically identifies common columns across all JSON rows
- **Column Selection**: Interactive checkbox grid for selecting desired columns
- **CSV Generation**: Proper CSV formatting with comma and quote escaping
- **Chinese Character Support**: UTF-8 BOM encoding ensures Chinese characters display correctly in Excel and other applications
- **Table Editing**: In-place editing of JSON data with real-time updates
- **Column Operations**: Add, calculate, rename, and delete columns
- **Data Validation**: Ensures consistent JSON structure across all rows
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## 🚀 Usage

### JSON to CSV Converter
1. Click "JSON to CSV" button
2. Click the file upload area or drag and drop a JSON file
3. Click "Load JSON" to parse and analyze the file
4. Review the detected common columns and select which ones to include
5. Click "Generate CSV" to download your formatted CSV file

### JSON Table Editor
1. Click "JSON Editor" button
2. Upload a JSON file with consistent structure (all objects must have identical keys)
3. **Choose display rows**: Select how many rows to show (First 5, 10, 25, or All rows)
4. Edit data directly in the table:
   - **Modify values**: Click any cell and edit the content
   - **Rename columns**: Click column headers and change names
   - **Add columns**: Use "Add Column" button to create new columns
   - **Calculate columns**: Use "Calculate Column" to create computed columns
   - **Replace values**: Use "Replace Values" to perform regex-based find and replace in columns
   - **Delete columns**: Click the × button on column headers
5. Click "Download JSON" to save your edited data

### JSON Merger
1. Click "JSON Merger" button
2. Click the file upload area to select multiple JSON files (hold Ctrl/Cmd to select multiple)
3. Click "Load Files" to parse and display all selected files
4. For each file, optionally add key-value pairs that will be added to all elements in that file:
   - Enter a key name and value
   - Click "Add" to add the key-value pair
   - Remove pairs using the × button if needed
   - Remove entire files using the × button in the file header
5. Click "Merge JSON Files" to combine all files
6. **If conflicts are detected** (same top-level keys in multiple files), a step-by-step conflict resolution wizard will appear:
   - **One conflict at a time**: Each conflicting top-level key is resolved individually with clear navigation
   - **Granular key-by-key control**: For each secondary key, choose from multiple options:
     - Select values from different source files (color-coded file tags)
     - Enter custom values manually
   - **Navigation controls**: Use Previous/Next buttons to move between conflicts
   - **Progress tracking**: See current conflict number and total count
   - **Complete visibility**: View final merged data preview for each source file
7. After resolving all conflicts, the merged JSON will be downloaded automatically

## 📋 JSON Format Requirements

### For CSV Converter
The JSON file should have the following structure where top-level keys are row identifiers:

```json
{
  "000001": {"name": "平安银行", "price": 10.50, "volume": 1000000},
  "000002": {"name": "万科A", "price": 15.20, "volume": 800000},
  "000003": {"name": "中国石化", "price": 5.80, "volume": 1200000}
}
```

### For Table Editor
All JSON objects must have identical key structures:

```json
{
  "row1": {"name": "John", "age": 30, "salary": 50000},
  "row2": {"name": "Jane", "age": 25, "salary": 45000},
  "row3": {"name": "Bob", "age": 35, "salary": 55000}
}
```

### For JSON Merger
Supports both array and object formats. Arrays will be concatenated, objects will be merged:

**Array format** (recommended for data rows):
```json
[
  {"name": "John", "age": 30, "department": "Engineering"},
  {"name": "Jane", "age": 25, "department": "Marketing"},
  {"name": "Bob", "age": 35, "department": "Sales"}
]
```

**Object format** (properties will be merged):
```json
{
  "config": {"version": "1.0", "debug": true},
  "settings": {"theme": "dark", "language": "en"}
}
```
