# Studynex OS - Academic Command Center

A modern, full-stack educational platform built with React (Vite) and Firebase. Manage subjects, materials, and track academic progress with an intuitive, feature-rich dashboard.

## 🚀 Features

### Core Functionality
- **Google Authentication**: Secure login with Google Sign-In
- **Subject Management**: Create and organize study subjects
- **Material Repository**: Upload and manage PDF documents and study materials
- **Real-time Sync**: Firebase Firestore integration for instant data synchronization
- **File Storage**: Secure file uploads to Firebase Storage
- **User Profiles**: Customizable scholar identity with avatar, level, and XP tracking

### UI/UX
- **Responsive Design**: Mobile-first approach with responsive Tailwind CSS
- **Dark Theme**: Neon dark glassmorphism aesthetic
- **Smooth Animations**: Framer Motion for beautiful transitions
- **Toast Notifications**: Real-time user feedback with react-hot-toast
- **Modern Components**: Material Symbols icons and custom component library

### Pages
- **Login**: Google Sign-In authentication
- **Dashboard**: Overview of subjects and quick actions
- **Subject Detail**: View and manage materials for each subject
- **Profile**: View and edit scholar identity
- **Settings**: Configure preferences and system settings

## 📋 Project Structure

```
studynex-os/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ErrorBoundary.jsx
│   │   ├── PageLoader.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopAppBar.jsx
│   ├── context/             # React Context for state management
│   │   └── AppContext.jsx   # Global app state
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   └── SubjectDetail.jsx
│   ├── services/            # External service integrations
│   │   └── firebase.js      # Firebase configuration
│   ├── utils/               # Utility functions
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/                  # Static assets
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── firebase.json
```

## 🔧 Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore, Authentication, and Storage enabled
- Google OAuth credentials for Sign-In

## 📦 Installation

1. **Clone and navigate to project:**
```bash
cd studynex-os
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment (Optional if using credentials in firebase.js):**
```bash
cp .env.example .env.local
# Update .env.local with your Firebase credentials
```

4. **Update Firebase configuration (src/services/firebase.js):**
If needed, replace the Firebase config with your project details.

## 🏃 Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Building

Build for production:

```bash
npm run build
```

This creates optimized files in the `/dist` directory.

## 📊 Firebase Database Structure

```
users/
├── {userId}/
│   ├── subjects/
│   │   ├── {subjectId}/
│   │   │   ├── name: string
│   │   │   ├── createdAt: timestamp
│   │   │   ├── progress: number
│   │   │   └── materials/
│   │   │       ├── {materialId}/
│   │   │       │   ├── title: string
│   │   │       │   ├── type: string
│   │   │       │   ├── content: string (URL)
│   │   │       │   └── createdAt: timestamp
```

## 🔐 Firebase Rules

### Firestore Rules
- Users can only access their own data
- Materials belong to subjects, which belong to users
- Real-time listeners for instant updates

### Storage Rules
- Users can upload to their own directory
- Files are private to the user who uploaded them

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Firebase Hosting

## 🎨 Customization

### Theme Colors
Edit colors in `tailwind.config.js` and `src/index.css`

### Layout
Modify components in `src/components/` directory

### Pages
Add new pages in `src/pages/` and register in `src/App.jsx`

## 📚 Key Libraries

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 6 | Build tool |
| Firebase 11 | Backend services |
| React Router 7 | Navigation |
| Tailwind CSS 3 | Styling |
| Framer Motion 12 | Animations |
| React Hot Toast 2 | Notifications |
| Lucide React 1.7 | Icons |
| Recharts 3 | Charts (future use) |

## 🚀 Deployment

### Firebase Hosting

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase:**
```bash
firebase login
```

3. **Initialize Firebase (if not done):**
```bash
firebase init hosting
```

4. **Build and deploy:**
```bash
npm run build
firebase deploy
```

## 🐛 Troubleshooting

### Firebase Authentication Issues
- Verify OAuth credentials in Firebase Console
- Check allowed domains in Firebase Settings
- Ensure Google Sign-In is enabled in Authentication Methods

### File Upload Failures
- Check Firebase Storage rules
- Verify file size limits
- Ensure storage bucket exists

### Real-time Sync Issues
- Check browser console for Firestore errors
- Verify Firestore rules allow read/write
- Ensure user is authenticated

## 💡 Future Enhancements

- [ ] AI-powered study recommendations
- [ ] Progress analytics dashboard
- [ ] Collaboration features (share materials)
- [ ] Spaced repetition system
- [ ] Video lecture support
- [ ] Study schedule management
- [ ] Mobile app (React Native)

## 📝 License

This project is provided as-is for educational purposes.

## 👥 Support

For issues or questions, please check the Firebase documentation or create an issue in the project repository.

---

**Built with ❤️ for scholars everywhere**
