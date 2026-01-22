/**
 * Windows Setup Script for Golf Simulator App
 * Run this with: node setup-windows.js
 */

const fs = require('fs');
const path = require('path');

console.log('🏌️  Golf Simulator Setup Script');
console.log('='.repeat(50));

// Get the current directory (where the script is run from)
const projectDir = process.cwd();
console.log('\nProject directory:', projectDir);

// Config files content
const files = {
  'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,

  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`,

  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,

  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Golf Simulator Configurator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,

  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,

  'src/App.jsx': `import React from 'react';
import GolfSimulatorViewer from './components/GolfSimulatorViewer';

function App() {
  return (
    <div className="App">
      <GolfSimulatorViewer />
    </div>
  );
}

export default App;
`,

  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
`
};

// Create all files
console.log('\n📁 Creating files...\n');

let successCount = 0;
let errorCount = 0;

for (const [filepath, content] of Object.entries(files)) {
  try {
    const fullPath = path.join(projectDir, filepath);
    const dir = path.dirname(fullPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Delete file if it exists (to remove any corrupted versions)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Write the new file
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('  ✅', filepath);
    successCount++;
  } catch (err) {
    console.error('  ❌', filepath, ':', err.message);
    errorCount++;
  }
}

// Copy the large component file if it exists in the repo
const componentSource = path.join(__dirname, 'src', 'components', 'GolfSimulatorViewer.jsx');
const componentDest = path.join(projectDir, 'src', 'components', 'GolfSimulatorViewer.jsx');

if (fs.existsSync(componentSource)) {
  try {
    const dir = path.dirname(componentDest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(componentSource, componentDest);
    console.log('  ✅ src/components/GolfSimulatorViewer.jsx (copied from repo)');
    successCount++;
  } catch (err) {
    console.error('  ❌ Failed to copy GolfSimulatorViewer.jsx:', err.message);
    errorCount++;
  }
}

// Copy utils file
const utilsSource = path.join(__dirname, 'src', 'utils', 'configPersistence.js');
const utilsDest = path.join(projectDir, 'src', 'utils', 'configPersistence.js');

if (fs.existsSync(utilsSource)) {
  try {
    const dir = path.dirname(utilsDest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(utilsSource, utilsDest);
    console.log('  ✅ src/utils/configPersistence.js (copied from repo)');
    successCount++;
  } catch (err) {
    console.error('  ❌ Failed to copy configPersistence.js:', err.message);
    errorCount++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log('  ✅ Success:', successCount);
console.log('  ❌ Errors:', errorCount);

if (errorCount === 0) {
  console.log('\n🎉 Setup complete! You can now run:');
  console.log('   npm run dev');
} else {
  console.log('\n⚠️  Some files failed to create. Please check the errors above.');
}

console.log('='.repeat(50));
