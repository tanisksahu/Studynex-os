# Getting Started Guide - Studynex OS

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Access the app at `http://localhost:5173`

### 3. Login with Google
Click "Sign in with Google" and enter your credentials.

## Full Setup Instructions

### Step 1: Environment Setup

Ensure you have Node.js 18+ installed:
```bash
node --version
npm --version
```

### Step 2: Project Configuration

The Firebase configuration is already included in `src/services/firebase.js`:
- **Project ID**: studynex-app
- **Auth Domain**: studynex-app.firebaseapp.com
- **Storage Bucket**: studynex-app.firebasestorage.app

### Step 3: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the **studynex-app** project
3. Verify these services are enabled:
   - **Authentication**: Google Sign-In method
   - **Firestore Database**: Active and configured
   - **Storage**: Active with upload rules

### Step 4: Development Workflow

#### Start the dev server:
```bash
npm run dev
```

#### In another terminal, view the app:
- Open `http://localhost:5173`
- Use the page reload feature in VS Code for live updates

#### ESLint checking (optional):
```bash
npm run lint
```

## Testing the Application

### Test Authentication
1. Click "Sign in with Google"
2. Sign in with your Google account
3. Verify you're redirected to Dashboard

### Test Subject Management
1. On Dashboard, enter a subject name
2. Click "Initialize"
3. Subject appears in Sidebar under "Active Subjects"

### Test Material Upload
1. Click on a subject from Dashboard
2. Enter material title and upload a PDF file
3. Click "Upload Asset"
4. Material appears in the Materials section

### Test Navigation
- Click Dashboard in Sidebar → renders Dashboard
- Click Subject → renders SubjectDetail
- Click Scholar Identity → renders Profile
- Click System Settings → renders Settings

### Test Notifications
- Notifications appear in TopAppBar bell icon
- Click to view system logs

## Building for Production

### Build the project:
```bash
npm run build
```

This creates an optimized `dist/` directory with:
- Minified JavaScript
- Optimized CSS
- Bundled assets

### Preview the production build:
```bash
npm run preview
```

## Deploy to Firebase Hosting

### Prerequisites
```bash
npm install -g firebase-tools
firebase login
```

### Deploy process:

1. **Build the application:**
```bash
npm run build
```

2. **Deploy to Firebase:**
```bash
npm run deploy
```

or manually:
```bash
firebase deploy --only hosting
```

3. **View your live site:**
```bash
firebase open hosting:site
```

Your app is now live at: `https://studynex-app.web.app`

## Project Architecture

### Components
- `Sidebar.jsx`: Navigation sidebar with subjects and menu
- `TopAppBar.jsx`: Header with notifications and profile
- `PageLoader.jsx`: Loading spinner component
- `ErrorBoundary.jsx`: Error handling wrapper

### State Management
- **AppContext.jsx**: Centralized state with:
  - User authentication
  - Subject CRUD operations
  - Material management
  - Notifications system
  - Settings and preferences

### Services
- **firebase.js**: Firebase initialization and config
  - Authentication setup
  - Firestore reference
  - Storage reference
  - Google Auth provider

### Pages
- **Login.jsx**: Authentication page
- **Dashboard.jsx**: Main overview and subject creation
- **SubjectDetail.jsx**: Material management for subjects
- **Profile.jsx**: User profile and scholar identity
- **Settings.jsx**: System configuration

## Development Tips

### Hot Module Replacement (HMR)
- Vite enables automatic page reload on file changes
- Edit any file and see changes instantly

### Browser DevTools
1. Open Firefox/Chrome DevTools (F12)
2. React DevTools extension (optional) for component inspection
3. Check Console for Firebase logs

### Firebase Console
- Monitor Firestore reads/writes
- View authentication events
- Check storage uploads

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- Firebase explorer

## Troubleshooting

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Firebase Authentication failing
1. Check Firebase Console > Authentication
2. Verify OAuth domain is added
3. Check browser console for error messages

### Build failures
```bash
# Check for TypeScript errors
npm run lint

# Clear cache and rebuild
rm -rf dist
npm run build
```

### Port 5173 already in use
```bash
# Vite will use the next available port automatically
npm run dev
```

## Performance Optimization

### Current optimizations:
- Code splitting with React.lazy()
- Image optimization
- Tailwind CSS purging unused styles
- Firebase real-time listeners for efficiency

### Future improvements:
- Implement Service Worker for offline support
- Add image compression
- Implement pagination for large data sets
- Add caching strategies

## Security Best Practices

✅ Already implemented:
- Firebase Auth for secure login
- Firestore security rules
- User data isolation (users can only see their data)
- HTTPS for all communications

⚠️ Additional considerations:
- Never commit .env files with secrets
- Use Firebase rules for data validation
- Implement rate limiting for file uploads
- Regular security audits

## Monitoring and Debugging

### Check real-time database activity:
1. Open Firebase Console
2. Navigate to Firestore Database
3. Watch real-time updates as you use the app

### View error logs:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages or warnings

### Profile performance:
1. DevTools > Performance tab
2. Record user interactions
3. Analyze frame rate and load times

## Next Steps

1. ✅ Run the development server
2. ✅ Test all features
3. ✅ Customize colors/branding
4. ✅ Build production version
5. ✅ Deploy to Firebase Hosting

## Support Resources

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [React Router](https://reactrouter.com)

---

**Happy coding! 🚀**
