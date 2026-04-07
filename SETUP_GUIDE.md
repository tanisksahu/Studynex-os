# Production Setup & Integration Guide

## Quick Start

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**⚠️ Important**: 
- Never commit `.env.local` to git
- Already in `.gitignore`
- Get credentials from Firebase Console > Project Settings

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Verify Setup

Check the browser console for any errors. You should see:
- ✅ FirebaseApp initialized
- ✅ Auth module ready
- ✅ Firestore module ready
- ✅ Storage module ready

---

## Feature Verification Checklist

### Dashboard (Create Subjects)
- [ ] Type subject name → validation feedback appears
- [ ] Try invalid name → see error message
- [ ] Submit valid name → subject appears in list
- [ ] Submit shows loading state during creation
- [ ] Subjects sync in real-time from Firestore

### SubjectDetail (Upload Materials)
- [ ] Click a subject → shows upload form
- [ ] Try uploading wrong file type → error message
- [ ] Try oversized file → size validation error
- [ ] Valid upload → show progress, then add to list
- [ ] Click delete → confirmation dialog
- [ ] Click download → file downloads

### Profile (Edit & Avatar)
- [ ] Avatar preview shows in circle
- [ ] Hover avatar → camera icon appears
- [ ] Upload image → shows upload progress
- [ ] Click edit → form appears with current data
- [ ] Edit fields with validation feedback
- [ ] Save changes → persists to Firebase
- [ ] Data persists on page reload

### Settings (Toggles & Preferences)
- [ ] Study tab shows current stats
- [ ] AI toggle works → save notification appears
- [ ] Notification toggles → settings persist
- [ ] Failed toggle shows error toast
- [ ] Wipe data button shows confirmation
- [ ] Settings persist on reload

### Error Handling
- [ ] Force error → error boundary shows recovery screen
- [ ] Click "Try Again" → returns to normal
- [ ] Invalid form → inline error messages appear
- [ ] Network failure → error toast shows
- [ ] Wrong file type → file-specific error message

---

## Critical Components Integration

### AppContext (Global State)
```javascript
// Usage in any component:
import { useAppContext } from '../context/AppContext';

function MyComponent() {
  const { subjects, addSubject, user, loading } = useAppContext();
  
  // Use context values and methods
}
```

**Available Methods**:
- `loadUserSubjects(userId)` - Fetch subjects
- `addSubject(name)` - Create new subject
- `updateSubject(id, updates)` - Update subject
- `deleteSubject(id)` - Delete subject
- `getMaterials(subjectId)` - Get materials for subject
- `addMaterial(subjectId, data, file)` - Upload material
- `deleteMaterial(subjectId, id, fileUrl)` - Delete material
- `updateProfile(data)` - Update user profile
- `updateSettings(data)` - Update settings

### Validation (Input Validation)
```javascript
import { 
  validateSubjectName, 
  validateFile, 
  validateEmail 
} from '../utils/validation';

// Usage:
const validation = validateSubjectName("Physics");
if (!validation.valid) {
  setError(validation.error);
}
```

### Firebase Service (Data Layer)
```javascript
import { 
  subscribeToSubjects, 
  addMaterial, 
  uploadFile 
} from '../services/firebaseService';

// Already used by AppContext, but can be used directly
```

---

## Deployment to Production

### Pre-Deployment Checklist

1. **Security**
   - [ ] `.env.local` created (NOT in git)
   - [ ] Production Firebase credentials in `.env.local`
   - [ ] No hardcoded API keys anywhere
   - [ ] Firestore security rules are strict
   - [ ] Storage rules limit user access

2. **Testing**
   - [ ] All form validations work
   - [ ] File uploads work with real files
   - [ ] Avatar persistence works
   - [ ] Settings persist on reload
   - [ ] Error scenarios handled gracefully
   - [ ] Mobile/tablet responsive layouts

3. **Infrastructure**
   - [ ] Firestore database created
   - [ ] Storage bucket enabled
   - [ ] Authentication methods enabled
   - [ ] Firestore backups configured
   - [ ] Firebase Analytics enabled (optional)

### Firestore Security Rules (Recommended Setup)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /subjects/{subjectId} {
        allow read, write: if request.auth.uid == userId;
        
        match /materials/{materialId} {
          allow read, write: if request.auth.uid == userId;
        }
      }
    }
  }
}
```

### Storage Rules (Recommended Setup)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access files in their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Deploy to Production

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy to Firebase Hosting (if configured)
firebase deploy
```

---

## Monitoring & Maintenance

### Weekly Tasks
- [ ] Check Firebase error logs
- [ ] Review user feedback
- [ ] Monitor Storage usage
- [ ] Verify authentication working

### Monthly Tasks
- [ ] Update npm dependencies
- [ ] Review security rules
- [ ] Check Firestore quotas
- [ ] Analyze error patterns

### Quarterly Tasks
- [ ] Firestore database cleanup
- [ ] Storage cleanup (unused files)
- [ ] Performance optimization review
- [ ] New feature planning

---

## Troubleshooting

### "Firebase credentials not configured"
**Solution**: 
```
1. Check .env.local exists in project root
2. Verify all VITE_FIREBASE_* variables are set
3. Restart development server (npm run dev)
4. Check browser console for which variables are missing
```

### "Authentication failed"
**Solution**:
```
1. Verify Firebase Auth is enabled
2. Check email/password auth method is enabled
3. Verify user credentials are correct
4. Check Firebase Console > Authentication > Users
```

### "File upload not working"
**Solution**:
```
1. Check Storage bucket is enabled
2. Verify Storage security rules allow user's UID
3. Check file size is under 100MB limit
4. Verify browser allows file uploads
5. Check browser console for specific error
```

### "Profile not persisting"
**Solution**:
```
1. Check Firestore database exists
2. Verify user document structure in Firestore
3. Check Firestore security rules allow writes
4. Verify network connectivity
5. Check browser console for errors
```

### "Validation not working"
**Solution**:
```
1. Import validation from utils/validation.js
2. Check validation function exists
3. Verify input type matches validator
4. Check error message is displayed
5. Test with console.log to debug
```

---

## Performance Tips

### Optimize Image Uploads
```javascript
// Consider adding image compression before upload
// Use a library like compressorjs or imagemin
import Compressor from 'compressorjs';

new Compressor(file, {
  quality: 0.8,
  maxWidth: 500,
  maxHeight: 500
});
```

### Pagination for Large Lists
```javascript
// Implement pagination in SubjectDetail for many materials
const [pageSize, setPageSize] = useState(10);
const [currentPage, setCurrentPage] = useState(0);

const paginatedMaterials = materials.slice(
  currentPage * pageSize,
  (currentPage + 1) * pageSize
);
```

### Lazy Load Components
```javascript
// Already done in App.jsx - components load on demand
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
```

---

## API Reference

### Context Methods Signature

```typescript
// Subject Management
loadUserSubjects(userId: string): Promise<void>
addSubject(name: string): Promise<void>
updateSubject(id: string, updates: object): Promise<void>
deleteSubject(id: string): Promise<void>

// Material Management  
getNaterials(subjectId: string): Material[]
addMaterial(subjectId: string, data: object, file?: File): Promise<void>
deleteMaterial(subjectId: string, materialId: string, fileUrl?: string): Promise<void>

// Notifications
addNotification(message: string, type: 'success'|'error'|'info'): void
clearNotifications(): void

// Profile & Settings
updateProfile(data: ProfileData): Promise<void>
updateSettings(data: SettingsData): Promise<void>

// Loading States
dataLoading: boolean
uploadProgress: number (0-100)
```

### Validation Functions Signature

```typescript
validateSubjectName(name: string): { valid: boolean, error: string }
validateMaterialTitle(title: string): { valid: boolean, error: string }
validateEmail(email: string): { valid: boolean, error: string }
validateFile(file: File, options?: { maxSize?: number, allowedTypes?: string[] }): { valid: boolean, error: string }
validateRequired(value: string): { valid: boolean, error: string }
validateNumberRange(num: number, min: number, max: number): { valid: boolean, error: string }
validateTextLength(text: string, max: number): { valid: boolean, error: string }
validateUrl(url: string): { valid: boolean, error: string }
```

---

## Support Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite Docs**: https://vitejs.dev
- **GitHub Copilot**: Ask for code explanations and implementation help

---

**Version**: 2.0.0  
**Last Updated**: [Current Date]  
**Status**: Ready for Production ✅
