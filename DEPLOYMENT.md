# Deployment Checklist - Studynex OS

## Pre-Deployment Checklist

### Code Quality
- [ ] Run `npm run lint` and fix any issues
- [ ] Test all authentication flows
- [ ] Test subject creation and deletion
- [ ] Test file uploads (PDF, docs)
- [ ] Test responsive design on mobile
- [ ] Verify all error boundaries are working
- [ ] Check console for any warnings or errors

### Firebase Configuration
- [ ] Verify Firebase project exists (studynex-app)
- [ ] Firestore Database is created and configured
- [ ] Authentication: Google Sign-In is enabled
- [ ] Storage bucket is created
- [ ] Security rules are properly configured:
  ```
  // Firestore Rules
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
  
  // Storage Rules
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /users/{userId}/{allPaths=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
  ```

### Build Verification
- [ ] Run `npm run build` successfully
- [ ] dist/ folder created with no errors
- [ ] Run `npm run preview` and test production build
- [ ] Verify all routes work in production
- [ ] Check bundle size isn't excessive

### Environment Variables
- [ ] Firebase credentials are in firebase.js (no .env needed for this project)
- [ ] No sensitive data in committed files
- [ ] .gitignore includes node_modules and build artifacts

## Deployment Steps

### Option 1: Firebase Hosting (Recommended)

1. **Install Firebase CLI (if not installed):**
```bash
npm install -g firebase-tools
```

2. **Authentication:**
```bash
firebase login
```

3. **Initialize Firebase (if needed):**
```bash
firebase init hosting
```
- Select the studynex-app project
- Use "dist" as your public directory
- Don't overwrite dist/index.html

4. **Build the application:**
```bash
npm run build
```

5. **Deploy:**
```bash
firebase deploy
```

6. **Verify deployment:**
```bash
firebase open hosting:site
```

Your app is now live at: `https://studynex-app.web.app`

### Option 2: Manual Firebase Hosting Deployment

1. Build: `npm run build`
2. Go to [Firebase Console](https://console.firebase.google.com)
3. Select studynex-app project
4. Go to Hosting
5. Click "Upload files"
6. Select all files from `dist/` folder

### Option 3: GitHub Pages (Alternative)

1. Update vite.config.js:
```javascript
export default defineConfig({
  base: '/studynex-os/', // Match your repo name
  plugins: [react()],
})
```

2. Build: `npm run build`
3. Commit and push to repository
4. Enable GitHub Pages in Settings → Pages

### Option 4: Vercel Deployment

1. Login to [Vercel](https://vercel.com)
2. Import project from GitHub
3. Select root directory: `./`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click Deploy

## Post-Deployment Steps

### Verify Live Application
- [ ] Check if login page loads
- [ ] Test Google Sign-In
- [ ] Create a new subject
- [ ] Upload a material file
- [ ] Verify file downloads work
- [ ] Test on mobile device
- [ ] Check all navigation works

### Monitor Performance
1. Check Firebase Console:
   - Monitor real-time database usage
   - Check for any errors
   - Review authentication issues

2. Check Web Performance:
   - Open DevTools Network tab
   - Verify page load time
   - Check bundle sizes
   - Monitor for console errors

### Setup Custom Domain (Optional)

1. Go to Firebase Hosting settings
2. Add custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (usually 24 hours)

## Troubleshooting Deployment

### Build Fails
```bash
# Clear cache
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### Firebase Deploy Fails
```bash
# Clear Firebase cache
firebase login --reauth
firebase init
firebase deploy --force
```

### App Shows Blank Page
1. Check browser console (F12) for errors
2. Verify Firebase credentials in firebase.js
3. Check if dist/index.html exists
4. Clear browser cache (Ctrl+Shift+Del)

### Authentication Not Working
1. Add your domain to Firebase Console → Settings → Authorized domains
2. Verify Google OAuth credentials
3. Check Firebase Authentication → Google sign-in is enabled

### File Upload Not Working
1. Verify Firebase Storage rules allow uploads
2. Check file size limits (default: 5GB)
3. Verify storage bucket exists in Firebase

## Performance Optimization Post-Deploy

### Enable Caching
Update firebase.json:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "/**.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Monitor Analytics
1. Set up Google Analytics in Firebase
2. Monitor user behavior and conversion
3. Track errors and exceptions

## Continuous Deployment (Optional)

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: 'studynex-app'
```

## Support and Monitoring

### Firebase Console Monitoring
- Firestore: Real-time database usage
- Storage: File upload/download metrics
- Analytics: User engagement data
- Errors: Reported exceptions from app

### Error Tracking
- Setup Sentry or Firebase Crash Reporting
- Monitor browser console errors
- Track user-reported issues

## Rollback Plan

If deployment has issues:

1. **Immediate Rollback:**
```bash
firebase hosting:disable  # Disables hosting
```

2. **Deploy Previous Version:**
```bash
git revert <commit-hash>
npm run build
firebase deploy
```

3. **Check Deployment History:**
```bash
firebase hosting:versions:list
firebase hosting:versions:promote <version-id>
```

## Update Schedule

- **Security patches**: As soon as available
- **Dependencies**: Monthly (npm update)
- **Features**: As needed
- **Documentation**: With each release

---

**Deployment completed successfully!** 🎉

For issues, check the [Firebase Documentation](https://firebase.google.com/docs/hosting) or your framework documentation.
