# Golf Simulator Sales & Configuration Tool

**A professional 3D golf simulator configuration tool for your sales team.**

Create, customize, and share interactive 3D golf simulator proposals with clients. Auto-save, URL sharing, and real-time pricing make it easy to close deals faster.

---

## 🎯 Perfect For

- **Sales Teams**: Configure and quote simulators in real-time
- **Client Presentations**: Share interactive 3D links
- **Installation Teams**: Export detailed technical specifications
- **Showrooms**: Let clients explore configurations on-site

---

## ⚡ Quick Start

**Never used this before?** → See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for step-by-step instructions

**Already set up?** → Run these commands:

```bash
npm install    # First time only
npm run dev    # Start the app
```

Then open **http://localhost:3000** in your browser.

---

## 💡 Key Sales Features

### 📋 **Share Link** - Send Interactive Proposals
- Click "Share Link" to copy a URL
- Send to clients via email/text
- Client sees YOUR exact configuration in 3D
- They can rotate, zoom, and explore
- **Perfect for remote sales!**

### 💾 **Export/Import** - Save Client Configurations
- Export: Save as `.json` file
- Import: Load previous client's setup
- Share configs across your sales team
- Archive proposals for later

### 💰 **Live Pricing** - Instant Quotes
- Real-time price calculator
- Updates as you change equipment
- Transparent breakdown by item
- Export pricing with snapshot

### 📸 **Technical Snapshot** - For Installers
- Download detailed `.txt` report
- All measurements and specifications
- Electrical layout and conduit paths
- Equipment locations with coordinates

### 🔄 **Auto-Save** - Never Lose Work
- Automatically saves every few seconds
- Saved to your browser
- Refresh page - your work is still there!
- Works offline

---

## 🏢 Sales Workflow

### 1. **Initial Client Call**
- Gather room dimensions
- Discuss budget and preferences
- Note equipment preferences

### 2. **Configure in 3D**
- Open the tool
- Enter room dimensions
- Select equipment (projector, launch monitor, etc.)
- Add furniture and accessories
- Review live pricing

### 3. **Share with Client**
- Click "📋 Share Link"
- Email or text the URL to client:

```
Hi [Client],

I've created a 3D design of your golf simulator.
View it here: [PASTE LINK]

Total: $XX,XXX

Let me know your thoughts!
```

### 4. **Client Explores**
- Client opens link on phone/computer
- Sees exact configuration in 3D
- Can rotate and zoom around the room
- Reviews pricing breakdown

### 5. **Revisions** (if needed)
- Client requests changes
- You adjust configuration
- Send new share link
- Repeat until approved

### 6. **Close the Deal**
- Client approves design
- Export final configuration (JSON)
- Generate snapshot for installation team
- Archive for records

---

## 🛠️ Features Overview

### Room Customization
- Dimensions (width, depth, height)
- Wall and ceiling colors (white, black, charcoal, gray)
- Flooring (green turf, black turf, flush or raised)
- LED lighting strips
- Side wall curtains
- Rough/fringe borders

### Equipment Selection

**Projectors** (4K & 1080P)
- BenQ LK936ST, TK710STi, AK700ST
- Optoma UHZ35ST, ZK608ST, ZW350ST, etc.
- Auto-calculated throw distances
- Zoom lens support

**Launch Monitors** (Ceiling & Floor)
- Uneekor (EYE XO2, XO, XR, MINI, MINI LITE)
- Foresight (Falcon, GC3)
- ProTee VX, TruGolf Apogee, Trackman IO
- Bushnell, Garmin R10/R50, TruGolf LaunchBox

**Screens**
- Built-in wall screen
- Cage enclosure
- Acoustic panels (optional)
- Custom dimensions

**Accessories**
- TV monitors (24"-65")
- Computer workstation
- Ball dispenser
- Putting cups (1-2)
- Furniture (barstools, couches, tables, chairs)
- Golfer avatar (visualization)

### Technical Features
- 3D interactive visualization (Three.js)
- Real-time rendering
- Camera controls (rotate, zoom, pan)
- Electrical planning (outlets, conduit paths)
- Mobile-friendly touch controls
- Accurate measurements and positioning

---

## 📊 Where is Data Saved?

### Automatic (LocalStorage)
- **Auto-saved** to your browser every few seconds
- Survives page refreshes
- Browser-specific (doesn't sync across devices)
- ~5-10MB limit
- **Great for:** Day-to-day work

### Manual (JSON Export)
- **Export** button saves `.json` file to your computer
- Can be imported later
- Can be shared with team members
- **Great for:** Client archives, backups, team sharing

### URL Sharing
- **Share Link** encodes config in URL
- Shareable via email/text
- Anyone with link sees the exact configuration
- **Great for:** Client proposals, remote sales

### Snapshot (Text Report)
- **Snapshot** button downloads `.txt` file
- Technical specifications for installers
- Equipment locations, measurements, electrical
- **Great for:** Installation teams, contractors

---

## 💰 Pricing (Built-In)

Current pricing includes:
- Projectors: $909 - $6,735
- Launch Monitors: $599 - $23,495
- Screens: $1,885 - $2,500
- Turf: $11.90/sq ft
- Hitting Mat: $774.50
- TV Monitors: $229 each
- Computer: $2,699
- Installation: $3,650

**Note:** Update pricing in `GolfSimulatorViewer.jsx` → `PRICING` object

---

## 🚀 Deployment Options

### Option 1: Vercel (Free, Easy)
```bash
npm install -g vercel
vercel
```
Get a live URL like: `https://your-golf-sim.vercel.app`

### Option 2: Your Own Website
```bash
npm run build
```
Upload `dist` folder to your web hosting.

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.**

---

## 📱 Mobile Support

- ✅ Touch controls (swipe to rotate, pinch to zoom)
- ✅ Responsive panels
- ✅ Works on phones and tablets
- ✅ Share links work on any device
- ✅ Perfect for on-site client meetings

---

## 🎓 Training Your Team

### 5-Minute Training

1. **Open the app:** `http://localhost:3000` (or your deployed URL)
2. **Configure a room:**
   - Room tab: Enter dimensions
   - Screen tab: Choose projector
   - Equipment tab: Select launch monitor
3. **Share with client:**
   - Click "Share Link"
   - Paste in email/text
4. **Save your work:**
   - Click "Export" to save as file
   - Click "Import" to load later

### Tips for Sales Team

- Start with room dimensions (get this from client first)
- Use presets if available (see RECOMMENDED_IMPROVEMENTS.md)
- Always send share link, not just pricing
- Export final config for your records
- Use snapshot for installation quotes

---

## 🔧 Customization

### Add Your Company Logo

Replace logo in:
```
public/logo.png
```

### Update Site Title

Edit `index.html`:
```html
<title>Your Company - Golf Simulator Tool</title>
```

### Change Pricing

Edit `src/components/GolfSimulatorViewer.jsx`:
```javascript
const PRICING = {
  projectors: {
    'BenQ LK936ST': 4849,  // ← Update here
  },
  // ... etc
};
```

### Add Equipment

Add new models to equipment arrays in `GolfSimulatorViewer.jsx`.

**See [RECOMMENDED_IMPROVEMENTS.md](./RECOMMENDED_IMPROVEMENTS.md) for more ideas.**

---

## 📋 Files Structure

```
indoorgolflaunch/
├── src/
│   ├── components/
│   │   └── GolfSimulatorViewer.jsx  # Main app (1500+ lines)
│   ├── utils/
│   │   └── configPersistence.js     # Save/load/share logic
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   └── logo.png                      # Company logo
├── index.html                        # HTML template
├── package.json                      # Dependencies
├── vite.config.js                    # Build config
├── SETUP_GUIDE.md                    # Setup instructions
├── RECOMMENDED_IMPROVEMENTS.md       # Future enhancements
└── README.md                         # This file
```

---

## 🐛 Troubleshooting

**App won't start?**
- Make sure Node.js is installed: `node --version`
- Run `npm install` first
- Check for errors in terminal

**Share link not working?**
- Make sure URL is copied completely
- Test link in incognito/private browsing
- Check browser console (F12) for errors

**Configuration not saving?**
- Browser localStorage might be full
- Try clearing browser cache
- Use Export/Import as backup

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting.**

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Run the app locally (`npm run dev`)
2. ✅ Create a test configuration
3. ✅ Test "Share Link" feature
4. ✅ Export and import a config

### This Week
1. ✅ Train your sales team
2. ✅ Update pricing to match your rates
3. ✅ Add your company logo
4. ✅ Deploy to a public URL

### Future Enhancements
See [RECOMMENDED_IMPROVEMENTS.md](./RECOMMENDED_IMPROVEMENTS.md) for 30+ feature ideas including:
- Configuration presets
- Undo/redo
- Screenshot capture
- Client database integration
- Email templates
- PDF quote generation

---

## 📞 Support

### Quick Commands
```bash
npm install      # Install dependencies (first time)
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Common Issues
- **Port 3000 busy?** → Close other apps or change port
- **Dependencies errors?** → Delete `node_modules`, run `npm install`
- **White screen?** → Check browser console (F12)

---

## 📄 License

This project is for internal use by your sales team.

---

## 🏌️ Built With

- **React 18** - UI framework
- **Three.js** - 3D rendering engine
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework

---

**Ready to sell more golf simulators?** 🚀

👉 Start with [SETUP_GUIDE.md](./SETUP_GUIDE.md) if this is your first time!
