# 🚀 Complete Setup Guide - Golf Simulator Tool

## 📋 Prerequisites

Before you start, you need:

1. **Node.js** (version 16 or higher)
   - Check if installed: Open Terminal/Command Prompt and type: `node --version`
   - If not installed: Download from https://nodejs.org/ (choose LTS version)

2. **A code editor** (optional but recommended)
   - VS Code: https://code.visualstudio.com/
   - Or any text editor

---

## 🎯 Step-by-Step Setup (First Time Only)

### Step 1: Open Terminal/Command Prompt

**On Mac:**
- Press `Cmd + Space`, type "Terminal", press Enter

**On Windows:**
- Press `Windows + R`, type "cmd", press Enter

**On Linux:**
- Press `Ctrl + Alt + T`

### Step 2: Navigate to Your Project Folder

```bash
cd /home/user/indoorgolflaunch
```

### Step 3: Install Dependencies

This downloads all the required packages (React, Three.js, etc.):

```bash
npm install
```

⏱️ This will take 2-5 minutes. You'll see a progress bar.

✅ When done, you'll see: "added XXX packages"

---

## ▶️ Running the App (Every Time)

### Start the Development Server

```bash
npm run dev
```

✅ You should see:

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Open in Browser

The app should automatically open in your browser at:
**http://localhost:3000/**

If it doesn't open automatically:
1. Open your web browser (Chrome, Firefox, Safari, Edge)
2. Go to: `http://localhost:3000`

🎉 **You should now see your Golf Simulator Tool!**

---

## 🛑 Stopping the App

To stop the development server:
- Press `Ctrl + C` in the terminal
- Type `y` if asked to confirm

---

## 💡 New Sales Features

### 1. **📋 Share Link** (Copy Shareable URL)
- Click the "Share Link" button
- Link is copied to clipboard automatically
- Send this link to clients - they'll see YOUR exact configuration!
- Perfect for:
  - Emailing quotes to clients
  - Sharing configurations with your sales team
  - Sending to installers

### 2. **💾 Export** (Save as JSON File)
- Click "Export" to download a `.json` file
- Saves your entire configuration
- Use this to:
  - Archive client proposals
  - Share configs between team members
  - Keep backups of your work

### 3. **📂 Import** (Load from JSON File)
- Click "Import" and select a `.json` file
- Instantly loads that configuration
- Perfect for:
  - Loading a previous client's setup
  - Starting from a template
  - Restoring saved work

### 4. **📸 Snapshot** (Technical Report)
- Downloads a `.txt` file with all measurements
- Includes electrical specs, equipment locations
- Use for installation teams

### 5. **Auto-Save** (Automatic!)
- Your work is automatically saved every few seconds
- Saved to your browser (localStorage)
- Even if you refresh, your work is there!

---

## 📧 Sharing with Clients - Best Practices

### Method 1: Share Link (Recommended)
1. Configure the room exactly as needed
2. Click "📋 Share Link"
3. Link is copied to clipboard
4. Paste into email:

```
Hi [Client Name],

I've created a 3D rendering of your golf simulator space.
You can view it here and explore the room in 3D:

[PASTE LINK HERE]

The total estimated cost is $XX,XXX.

Let me know if you'd like any changes!
```

### Method 2: Export + Email
1. Click "💾 Export"
2. Attach the `.json` file to your email
3. Client can import it (if they have access to the tool)

### Method 3: Screenshot
1. Position the 3D view how you want
2. Take a screenshot (Windows: `Win + Shift + S`, Mac: `Cmd + Shift + 4`)
3. Attach screenshot to email

---

## 🏢 Deploying to Your Website

### Option 1: Quick Deploy with Vercel (Free - Recommended)

1. **Create a Vercel account:**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Deploy:**
   ```bash
   cd /home/user/indoorgolflaunch
   vercel
   ```

4. **Follow prompts:**
   - Link to existing project? No
   - What's your project name? `golf-simulator-tool`
   - Which directory? `.` (current)
   - Want to override settings? No

✅ You'll get a live URL like: `https://golf-simulator-tool.vercel.app`

### Option 2: Build for Production

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Preview the build:**
   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder:**
   - Upload the entire `dist` folder to your web hosting
   - Point your domain to it

---

## 🐛 Troubleshooting

### Problem: "command not found: npm"
**Solution:** Node.js is not installed
- Download from https://nodejs.org
- Install the LTS version
- Restart your terminal

### Problem: "EADDRINUSE: address already in use ::

:3000"
**Solution:** Port 3000 is already in use
- Close other development servers
- Or change the port in `vite.config.js`

### Problem: App is blank/white screen
**Solution:** Check browser console
- Press F12 to open developer tools
- Look for error messages
- Common fix: Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Problem: Changes not showing up
**Solution:** Hard refresh
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Problem: Can't find the project folder
**Solution:** Navigate to the correct directory
```bash
# Show current directory
pwd

# List files
ls

# Change to project directory
cd /home/user/indoorgolflaunch
```

---

## 🎨 Customization for Your Company

### Add Your Logo

1. Replace the logo in `public/logo.png`
2. Update the site title in `index.html`:
   ```html
   <title>Your Company Name - Golf Simulator Tool</title>
   ```

### Update Pricing

Edit `/home/user/indoorgolflaunch/src/components/GolfSimulatorViewer.jsx`

Find the `PRICING` object (around line 200) and update values:

```javascript
const PRICING = {
  projectors: {
    'BenQ LK936ST': 4849,  // ← Update this
    // ... etc
  },
  // ... etc
};
```

### Add More Equipment

Add new models to the arrays in `GolfSimulatorViewer.jsx`:

```javascript
const projModels = {
  '4K': ['BenQ LK936ST', 'YOUR NEW MODEL HERE'],
  // ... etc
};
```

---

## 📞 Need Help?

### Quick Commands Reference

```bash
# Install packages (first time only)
npm install

# Start development server
npm run dev

# Stop server
Ctrl + C

# Build for production
npm run build

# Preview production build
npm run preview
```

### File Structure
```
indoorgolflaunch/
├── src/                    # Source code
│   ├── components/         # React components
│   │   └── GolfSimulatorViewer.jsx  # Main app
│   ├── utils/              # Helper functions
│   │   └── configPersistence.js     # Save/load logic
│   └── main.jsx            # Entry point
├── package.json            # Dependencies
├── index.html              # HTML template
└── README.md               # Documentation
```

---

## ✅ Success Checklist

- [ ] Node.js installed (`node --version` works)
- [ ] Dependencies installed (`npm install` completed)
- [ ] Dev server starts (`npm run dev` works)
- [ ] App opens in browser (http://localhost:3000)
- [ ] Can configure a room
- [ ] Can click "Share Link" and link is copied
- [ ] Can export configuration as JSON
- [ ] Can import configuration from JSON
- [ ] Auto-save works (refresh page and config is restored)

🎉 **You're all set!**

---

## 🚀 Next Steps

1. **Try it out:** Create a sample configuration
2. **Share it:** Click "Share Link" and test the URL
3. **Train your team:** Show them how to use the tool
4. **Customize:** Add your company branding
5. **Deploy:** Put it on your website (see deployment section)

---

## 💬 Support

If you run into issues:
1. Check the **Troubleshooting** section above
2. Check the browser console (F12) for errors
3. Make sure you're on the latest Node.js version
4. Try deleting `node_modules` and running `npm install` again

Good luck! 🏌️‍♂️
