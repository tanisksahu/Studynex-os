
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

function parseFirebaseServiceAccount() {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
  }

  if (serviceAccount && serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return serviceAccount;
}

let firebaseReady = false;
try {
  if (!admin.apps.length) {
    const serviceAccount = parseFirebaseServiceAccount();
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp();
    }
  }
  firebaseReady = true;
} catch (error) {
  if (!isProduction) {
    console.error('Firebase Admin initialization failed:', error.message);
  }
}

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const authenticate = asyncHandler(async (req, res, next) => {
  if (!firebaseReady) {
    return res.status(503).json({
      error: 'Authentication service unavailable',
      message: 'Firebase Admin is not configured correctly on the server',
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

app.get('/api/health', (req, res) => {
  return res.json({ ok: true, firebaseReady });
});

app.get('/api/session', authenticate, (req, res) => {
  return res.json({ uid: req.user.uid, email: req.user.email || null });
});

app.use((req, res) => {
  return res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (!isProduction) {
    console.error('Unhandled API error:', error);
  }
  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: 'Internal server error',
    message: isProduction ? 'An unexpected error occurred' : error.message,
  });
});

app.listen(PORT, () => {
  if (!isProduction) {
    console.log(`Backend server running on http://localhost:${PORT}`);
  }
});
