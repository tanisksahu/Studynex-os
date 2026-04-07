# Studynex OS - Developer API Documentation

## AppContext API Reference

The `AppContext` provides centralized state management and business logic for the entire application.

### Context Value

```javascript
{
  // Authentication
  user,                           // Current Firebase user object or null
  loading,                        // Loading state during auth check
  loginWithGoogle,                // Function: async () => void
  logout,                         // Function: async () => void
  
  // UI State
  isMobileMenuOpen,               // Boolean
  setIsMobileMenuOpen,            // Function: (boolean) => void
  
  // Data - Subjects
  subjects,                       // Array<Subject>
  addSubject,                     // Function: async (name: string) => void
  
  // Data - Materials
  addMaterial,                    // Function: async (subjectId, material, file) => void
  fetchMaterials,                 // Function: (subjectId, callback) => unsubscribe
  
  // Profile & User Data
  profile,                        // Object with user info
  setProfile,                     // Function: (profile | updater) => void
  
  // Notifications
  notifications,                  // Array<Notification>
  markNotificationRead,           // Function: (notificationId) => void
  markAllNotificationsRead,       // Function: () => void
  clearNotifications,             // Function: () => void
  addNotification,                // Function: (message, type) => void
  
  // Settings
  settings,                       // Object with user settings
  updateSettings,                 // Function: (newSettings) => void
  
  // Analytics
  activityData                    // Array of activity entries
}
```

## Type Definitions

### Subject

```javascript
{
  id: string,              // Firebase doc ID
  name: string,            // Subject name
  createdAt: ISO8601,      // Creation timestamp
  progress: number         // Progress percentage (0-100)
}
```

### Material

```javascript
{
  id: string,              // Firebase doc ID
  title: string,           // Material title
  type: string,            // File type (pdf, doc, etc)
  content: string,         // File URL or content
  createdAt: ISO8601       // Creation timestamp
}
```

### Notification

```javascript
{
  id: number,              // Unique timestamp ID
  message: string,         // Notification message
  type: 'info' | 'alert',  // Notification type
  timestamp: ISO8601,      // When it occurred
  read: boolean            // Read status
}
```

### Profile

```javascript
{
  firstName: string,       // First name
  lastName: string,        // Last name (optional)
  email: string,           // Email address
  xp: number,              // Experience points
  level: number,           // Current level
  institution: string,     // School/University name
  studyTimeMinutes: number,// Total study time
  avatarUrl: string        // Profile picture URL
}
```

### Settings

```javascript
{
  theme: 'dark' | 'light', // UI theme
  notifications: boolean,  // App notifications enabled
  emailNotifications: boolean, // Email notifications
  studyReminders: boolean, // Daily study reminders
  dailyGoal: number        // Daily study goal in minutes
}
```

## Authentication

### Login with Google

```javascript
const { loginWithGoogle } = useAppContext();

// Call the function
await loginWithGoogle();
// Automatically updates user state
```

### Logout

```javascript
const { logout } = useAppContext();

// Call the function
await logout();
// Clears user and resets state
```

### Usage in Components

```javascript
import { useAppContext } from '@/context/AppContext';

function MyComponent() {
  const { user, loading, loginWithGoogle } = useAppContext();
  
  if (loading) return <Loader />;
  if (!user) return <Login />;
  
  return <Dashboard />;
}
```

## Subject Management

### Add Subject

```javascript
const { addSubject } = useAppContext();

// Parameters
await addSubject('Quantum Mechanics');
// - name (string): Subject name

// Result
// - Subject added to Firestore
// - Toast notification shown
// - Re-renders subjects list
```

### Get Subjects

```javascript
const { subjects } = useAppContext();

// Real-time array of subjects
subjects.forEach(subject => {
  console.log(subject.name);
});
```

### Firestore Path

```
users/{userId}/subjects/{subjectId}
```

## Material Management

### Add Material

```javascript
const { addMaterial } = useAppContext();

// Upload file
const file = fileInput.files[0]; // PDF, DOC, etc

await addMaterial(subjectId, {
  title: 'Lecture Notes',
  type: file.type
}, file);

// Or without file
await addMaterial(subjectId, {
  title: 'Study Link',
  type: 'link',
  content: 'https://...'
});
```

### Fetch Materials

```javascript
const { fetchMaterials } = useAppContext();

// Listen to materials for a subject
useEffect(() => {
  const unsubscribe = fetchMaterials(subjectId, (materials) => {
    console.log('Materials updated:', materials);
    // Use materials in component
  });
  
  // Cleanup listener
  return () => unsubscribe && unsubscribe();
}, [subjectId]);
```

### Firestore Path

```
users/{userId}/subjects/{subjectId}/materials/{materialId}
```

## File Upload

### Upload Handler

The file upload process:
1. Get file from input: `file = e.target.files[0]`
2. Call `addMaterial(subjectId, metadata, file)`
3. File uploaded to Storage
4. URL stored in Firestore
5. Material metadata saved

### Storage Path

```
users/{userId}/materials/{timestamp}_{filename}
```

### Supported Files

- PDF (.pdf)
- Documents (.doc, .docx)
- Text files (.txt)
- Images (.jpg, .png)
- Any file type supported by browser

## Notifications

### Add Notification

```javascript
const { addNotification } = useAppContext();

addNotification('File uploaded successfully!', 'info');
addNotification('Error occurred', 'alert');
```

### Mark as Read

```javascript
const { markNotificationRead } = useAppContext();

markNotificationRead(notificationId);
```

### Mark All as Read

```javascript
const { markAllNotificationsRead } = useAppContext();

markAllNotificationsRead();
```

### Clear All

```javascript
const { clearNotifications } = useAppContext();

clearNotifications();
```

## Settings Management

### Update Settings

```javascript
const { settings, updateSettings } = useAppContext();

updateSettings({
  theme: 'dark',
  notifications: false,
  dailyGoal: 120
});
```

### Access Settings

```javascript
const { settings } = useAppContext();

if (settings.notifications) {
  // Show notifications
}
```

## Profile Management

### Update Profile

```javascript
const { profile, setProfile } = useAppContext();

setProfile(prev => ({
  ...prev,
  firstName: 'John',
  avatarUrl: 'https://...'
}));
```

### Access Profile

```javascript
const { profile } = useAppContext();

console.log(profile.firstName);
console.log(profile.xp);
```

## Error Handling

The app includes comprehensive error handling:

- **ErrorBoundary**: Catches React component errors
- **Toast Notifications**: Shows user-friendly error messages
- **Firebase Error Codes**: Firebase exceptions logged to console
- **Try-Catch**: Storage and Firestore operations wrapped

### Example Error Handling

```javascript
try {
  await addMaterial(subjectId, material, file);
} catch (error) {
  console.error('Upload failed:', error.message);
  toast.error('Failed to upload material');
}
```

## Real-time Listeners

The app uses Firestore real-time listeners:

```javascript
// Subjects are automatically synced
// when user logs in

// Materials are synced per subject
const unsubscribe = fetchMaterials(subjectId, (materials) => {
  // Called whenever materials change
});

// Cleanup when component unmounts
return () => unsubscribe?.();
```

## Firebase Services

### Authentication

```javascript
import { auth, googleProvider } from '@/services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Current user
onAuthStateChanged(auth, (user) => {
  // User logged in or out
});
```

### Firestore Database

```javascript
import { db } from '@/services/firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

// Add document
await addDoc(collection(db, 'path'), data);

// Listen to updates
onSnapshot(query, (snapshot) => {
  const data = snapshot.docs.map(doc => doc.data());
});
```

### Storage

```javascript
import { storage } from '@/services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload file
const ref = ref(storage, path);
const result = await uploadBytes(ref, file);

// Get download URL
const url = await getDownloadURL(result.ref);
```

## Component Examples

### Using Authentication

```javascript
import { useAppContext } from '@/context/AppContext';

export function LoginButton() {
  const { user, loginWithGoogle, logout } = useAppContext();
  
  return user ? (
    <button onClick={logout}>Logout</button>
  ) : (
    <button onClick={loginWithGoogle}>Login</button>
  );
}
```

### Using Subjects

```javascript
import { useAppContext } from '@/context/AppContext';

export function SubjectList() {
  const { subjects, addSubject } = useAppContext();
  
  return (
    <div>
      {subjects.map(subject => (
        <div key={subject.id}>{subject.name}</div>
      ))}
      <button onClick={() => addSubject('New Subject')}>
        Add Subject
      </button>
    </div>
  );
}
```

### Using Notifications

```javascript
import { useAppContext } from '@/context/AppContext';

export function NotificationBell() {
  const { 
    notifications, 
    markNotificationRead,
    clearNotifications 
  } = useAppContext();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div>
      <span>{unreadCount} unread</span>
      {notifications.map(notif => (
        <div 
          key={notif.id}
          onClick={() => markNotificationRead(notif.id)}
        >
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

### ✅ Do

- Wrap async operations in try-catch
- Use useEffect for real-time listeners
- Clean up listeners on unmount
- Use git commits for meaningful changes
- Test on mobile devices
- Check Firebase Console for issues

### ❌ Don't

- Commit API keys or secrets
- Bypass security rules for convenience
- Store sensitive data in localStorage
- Make synchronous Firebase calls
- Leave console.logs in production code

## Performance Tips

1. **Code Splitting**: Pages are lazy loaded with React.lazy()
2. **Real-time Listeners**: Only subscribe when needed
3. **Query Optimization**: Use where() clauses in Firestore
4. **Image Optimization**: Use compressed images for avatars
5. **Bundle Analysis**: Run `npm run build` and check sizes

## Debugging

### Enable Debug Logging

```javascript
// In firebase.js
import { enableLogging } from 'firebase/firestore';
enableLogging(true);
```

### Check Firestore Rules

```javascript
// Common error: Permission denied
// Solution: Check security rules in Firebase Console
```

### Monitor Network Activity

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR requests
4. Check for failed requests

## Testing Checklist

- [ ] Login/logout works
- [ ] Create subject successfully
- [ ] Upload file successfully
- [ ] Download file works
- [ ] Notifications appear
- [ ] Settings save
- [ ] Profile updates
- [ ] Mobile responsive
- [ ] Error messages show
- [ ] Real-time sync works

---

**Last Updated**: 2024
**Firebase SDK**: v11.4.0
**React**: v19.2.4
