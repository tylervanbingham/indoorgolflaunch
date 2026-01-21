# Golf Simulator Rendering Tool

An interactive 3D golf simulator configuration and rendering tool built with React and Three.js.

## 🎯 Where Is Your Data Saved?

**IMPORTANT: Your configuration data is currently stored IN YOUR BROWSER's memory only (React state).**

This means:
- ✅ **While the app is running**: All your configuration settings (room dimensions, equipment choices, pricing, etc.) are stored in the component's state
- ❌ **When you refresh the page**: All settings are lost and reset to defaults
- ❌ **No automatic saving**: The app does NOT currently save your configurations to a file or database

### What Gets Saved?

Currently, the ONLY way to save your configuration is:
1. **Snapshot Button**: Click the "Snapshot" button in the control panel to download a `.txt` file with all measurements and equipment specifications
2. **Manual Screenshot**: Take screenshots of your 3D render for visual reference

### Where Data SHOULD Be Saved (Future Improvements)

See the "RECOMMENDED IMPROVEMENTS.md" file for detailed suggestions on data storage, including:
- Browser localStorage for automatic saving
- Export/Import JSON configurations
- Save configuration presets
- URL sharing with encoded configurations

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### First-Time Setup

After running `npm run dev`, the app will open in your browser at `http://localhost:3000`

## 📋 Features

- **3D Interactive Visualization**: Real-time 3D rendering of your golf simulator room
- **Equipment Configuration**: Choose projectors, launch monitors, screens, and accessories
- **Room Customization**: Adjust dimensions, colors, flooring, and lighting
- **Electrical Planning**: Visualize outlet placements and conduit runs
- **Live Pricing**: Real-time cost estimation based on selected equipment
- **Snapshot Export**: Download detailed measurement and configuration reports

## 🎮 Controls

- **Mouse/Trackpad**:
  - Click and drag to rotate the view
  - Scroll to zoom in/out
- **Touch (Mobile)**:
  - Swipe to rotate
  - Pinch to zoom
- **Control Panels**: Drag panels by their title bars to reposition

## 📁 Project Structure

```
indoorgolflaunch/
├── src/
│   ├── components/
│   │   └── GolfSimulatorViewer.jsx  # Main 3D rendering component
│   ├── App.jsx                       # Root application component
│   ├── main.jsx                      # Application entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML template
├── package.json                      # Dependencies and scripts
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
└── README.md                         # This file
```

## 🔧 Configuration Options

### Room Tab
- Room dimensions (width, depth, height)
- Wall and ceiling colors
- Mat distance from screen
- Turf depth and type
- Flush/raised turf setting
- Rough/fringe borders
- LED strip lighting
- Curtains

### Screen Tab
- Screen width and aspect ratio
- Built-in screen or cage enclosure
- Acoustic panels
- Projector model (with automatic throw distance calculation)

### Equipment Tab
- Launch monitors (ceiling or floor mounted)
- TV monitors
- Computer and desk
- Ball dispenser
- Putting cups
- Golfer avatar

### Furniture Tab
- Barstools, couches, tables, chairs
- Position and rotation controls

## ⚠️ Important Notes

1. **Data Persistence**: Your configurations are NOT saved automatically. Use the Snapshot button to export your settings.

2. **Browser Compatibility**: This app works best in modern browsers (Chrome, Firefox, Safari, Edge)

3. **Performance**: The 3D rendering is resource-intensive. For best performance, close other tabs and applications.

## 🐛 Known Limitations

- No automatic save feature (configurations lost on page refresh)
- No undo/redo functionality
- No preset templates
- No configuration import/export (except manual snapshots)
- Limited to one configuration at a time

## 📝 License

This project is for personal use.

## 🤝 Contributing

This is a personal project. For questions or suggestions, please contact the repository owner.
