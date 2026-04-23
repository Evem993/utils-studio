# Utils Studio

A simple framework for testing and demonstrating utility functions, with JSON to CSV conversion integrated into the utils framework.

## Features
- **Utils Testing**: Select and execute utility functions with input/output display
- **JSON to CSV Converter**: Integrated as a selectable function for converting JSON files to CSV

## Structure
- `index.html`: The main HTML page with the utils framework
- `css/style.css`: Basic styling for the page
- `js/script.js`: JavaScript framework that handles function execution, UI, and JSON processing
- `utils/`: Directory containing utility modules
  - `stringUtils.js`: String manipulation utilities
  - `arrayUtils.js`: Array manipulation utilities
  - `mathUtils.js`: Mathematical utilities
- `index.js`: Main entry point exporting all utilities

## How to Use
### Utils Testing
1. Select a utility function from the dropdown
2. Enter the required input (string, number, or JSON array as specified)
3. Click "Execute" to see the result

### JSON to CSV Converter
1. Select "jsonToCsv: Convert JSON file to CSV (upload file)" from the dropdown
2. Click "Choose File" and select a JSON file
3. Click "Load JSON" to parse the file and see common columns
4. Select the columns you want to include in the CSV (common columns are pre-selected)
5. Click "Generate CSV" to download the file

## Adding New Utils
1. Create a new file in `utils/` (e.g., `newUtils.js`)
2. Export your functions from the new file
3. Add the export to `index.js`
4. Update the `functionRegistry` in `js/script.js` to include your new functions
