# Utils Studio - JSON to CSV Converter

A modern, responsive web application that converts JSON files to CSV format with an elegant user interface.

## ✨ Features

- **Modern UI**: Clean, responsive design with dark theme and smooth animations
- **File Upload**: Drag-and-drop style file upload with visual feedback
- **Smart Column Detection**: Automatically identifies common columns across all JSON rows
- **Column Selection**: Interactive checkbox grid for selecting desired columns
- **CSV Generation**: Proper CSV formatting with comma and quote escaping
- **Chinese Character Support**: UTF-8 BOM encoding ensures Chinese characters display correctly in Excel and other applications
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## 🚀 Usage

1. Open `index.html` in a modern web browser
2. Click the file upload area or drag and drop a JSON file
3. Click "Load JSON" to parse and analyze the file
4. Review the detected common columns and select which ones to include
5. Click "Generate CSV" to download your formatted CSV file

## 📋 JSON Format

The JSON file should have the following structure where top-level keys are row identifiers (these will become the "股票代码" column in CSV):

```json
{
  "000001": {"name": "平安银行", "price": 10.50, "volume": 1000000},
  "000002": {"name": "万科A", "price": 15.20, "volume": 800000},
  "000003": {"name": "中国石化", "price": 5.80, "volume": 1200000}
}
```

## 📊 Generated CSV Format

The generated CSV will include a "股票代码" column as the first column, containing the JSON top-level keys:

```csv
股票代码,name,price,volume
000001,平安银行,10.50,1000000
000002,万科A,15.20,800000
000003,中国石化,5.80,1200000
```

## 🎨 Design Features

- **Modern Typography**: Uses Inter font family for optimal readability
- **Gradient Backgrounds**: Beautiful gradient backgrounds and text effects
- **Card-based Layout**: Clean card components with subtle shadows
- **Interactive Elements**: Hover effects and smooth transitions
- **Mobile-First**: Responsive design that works on all screen sizes
- **Color System**: Consistent color palette with CSS custom properties

## 🛠️ Technical Stack

- **HTML5**: Semantic markup with modern elements
- **CSS3**: Custom properties, Flexbox, Grid, and modern selectors
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript
- **Responsive Images**: SVG icons for crisp display on all devices

## 📁 Project Structure

```
utils_studio/
├── index.html          # Main HTML with modern semantic structure
├── css/style.css       # Modern CSS with variables and responsive design
├── js/script.js        # Vanilla JavaScript functionality
├── README.md           # This documentation
└── images/             # Directory for future assets
```

## 🌐 Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- CSS Custom Properties
- Flexbox and Grid
- FileReader API

## 📱 Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 480px - 768px
- **Mobile**: < 480px
