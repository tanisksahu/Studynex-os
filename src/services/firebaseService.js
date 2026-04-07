/**
 * Firebase Service Layer
 * Centralized Firebase operations with error handling and logging
 * Separates Firebase logic from React components
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

// ============================================
// FIRESTORE QUERIES
// ============================================

/**
 * Get all subjects for a user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getSubjectsStatic(userId) {
  try {
    const q = query(collection(db, "users", userId, "subjects"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Error fetching subjects:", error);
    throw new Error(`Failed to fetch subjects: ${error.message}`);
  }
}

/**
 * Real-time listener for user subjects
 * @param {string} userId
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function subscribeToSubjects(userId, callback) {
  try {
    const q = query(collection(db, "users", userId, "subjects"));
    return onSnapshot(
      q,
      (snapshot) => {
        const subjects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(subjects);
      },
      (error) => {
        console.error("❌ Error subscribing to subjects:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("❌ Error setting up subjects listener:", error);
    throw error;
  }
}

/**
 * Get materials for a subject
 * @param {string} userId
 * @param {string} subjectId
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function subscribeToMaterials(userId, subjectId, callback) {
  try {
    const q = query(
      collection(db, "users", userId, "subjects", subjectId, "materials"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const materials = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(materials);
      },
      (error) => {
        console.error("❌ Error subscribing to materials:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("❌ Error setting up materials listener:", error);
    throw error;
  }
}

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Add a new subject
 * @param {string} userId
 * @param {string} name
 * @returns {Promise<string>} docId
 */
export async function addSubject(userId, name) {
  try {
    if (!name?.trim()) {
      throw new Error("Subject name cannot be empty");
    }

    const docRef = await addDoc(
      collection(db, "users", userId, "subjects"),
      {
        name: name.trim(),
        createdAt: new Date().toISOString(),
        progress: 0,
        color: getRandomColor(),
      }
    );
    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding subject:", error);
    throw new Error(`Failed to create subject: ${error.message}`);
  }
}

/**
 * Add material with optional file upload
 * @param {string} userId
 * @param {string} subjectId
 * @param {Object} material - {title, type, description}
 * @param {File} file - Optional file to upload
 * @returns {Promise<string>} docId
 */
export async function addMaterial(userId, subjectId, material, file = null) {
  try {
    if (!material?.title?.trim()) {
      throw new Error("Material title cannot be empty");
    }

    let fileUrl = material.content || "";

    // Upload file if provided
    if (file) {
      // Validate file
      validateFile(file);

      const storageRef = ref(
        storage,
        `users/${userId}/materials/${Date.now()}_${sanitizeFileName(file.name)}`
      );

      const snapshot = await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(snapshot.ref);
    }

    const docRef = await addDoc(
      collection(db, "users", userId, "subjects", subjectId, "materials"),
      {
        title: material.title.trim(),
        type: material.type || file?.type || "unknown",
        description: material.description || "",
        content: fileUrl,
        fileSize: file?.size || 0,
        createdAt: new Date().toISOString(),
      }
    );

    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding material:", error);
    throw new Error(`Failed to upload material: ${error.message}`);
  }
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update subject
 * @param {string} userId
 * @param {string} subjectId
 * @param {Object} updates
 */
export async function updateSubject(userId, subjectId, updates) {
  try {
    await updateDoc(
      doc(db, "users", userId, "subjects", subjectId),
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("❌ Error updating subject:", error);
    throw new Error(`Failed to update subject: ${error.message}`);
  }
}

/**
 * Update material
 * @param {string} userId
 * @param {string} subjectId
 * @param {string} materialId
 * @param {Object} updates
 */
export async function updateMaterial(
  userId,
  subjectId,
  materialId,
  updates
) {
  try {
    await updateDoc(
      doc(
        db,
        "users",
        userId,
        "subjects",
        subjectId,
        "materials",
        materialId
      ),
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("❌ Error updating material:", error);
    throw new Error(`Failed to update material: ${error.message}`);
  }
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete subject and all its materials
 * @param {string} userId
 * @param {string} subjectId
 */
export async function deleteSubject(userId, subjectId) {
  try {
    // Delete all materials in subject first
    const materialsRef = collection(
      db,
      "users",
      userId,
      "subjects",
      subjectId,
      "materials"
    );
    const snapshot = await getDocs(materialsRef);

    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Delete subject
    await deleteDoc(doc(db, "users", userId, "subjects", subjectId));
  } catch (error) {
    console.error("❌ Error deleting subject:", error);
    throw new Error(`Failed to delete subject: ${error.message}`);
  }
}

/**
 * Delete material and its file
 * @param {string} userId
 * @param {string} subjectId
 * @param {string} materialId
 * @param {string} fileUrl - Optional, for cleaning up storage
 */
export async function deleteMaterial(
  userId,
  subjectId,
  materialId,
  fileUrl = null
) {
  try {
    // Delete file from storage if URL provided
    if (fileUrl) {
      try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
      } catch (error) {
        console.warn("⚠️ Could not delete file from storage:", error);
        // Don't throw - file might already be deleted
      }
    }

    // Delete material document
    await deleteDoc(
      doc(
        db,
        "users",
        userId,
        "subjects",
        subjectId,
        "materials",
        materialId
      )
    );
  } catch (error) {
    console.error("❌ Error deleting material:", error);
    throw new Error(`Failed to delete material: ${error.message}`);
  }
}

// ============================================
// FILE OPERATIONS
// ============================================

/**
 * Upload file to Firebase Storage
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<string>} download URL
 */
export async function uploadFile(userId, file) {
  try {
    validateFile(file);

    const storageRef = ref(
      storage,
      `users/${userId}/uploads/${Date.now()}_${sanitizeFileName(file.name)}`
    );

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete file from Firebase Storage
 * @param {string} fileUrl
 */
export async function deleteFile(fileUrl) {
  try {
    if (!fileUrl) return;

    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn("⚠️ Could not delete file:", error);
    // Don't throw - file might not exist
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate file before upload
 * @param {File} file
 */
function validateFile(file) {
  const MAX_SIZE_MB = import.meta.env.VITE_MAX_FILE_SIZE_MB || 50;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // Check file size
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(
      `File size exceeds ${MAX_SIZE_MB}MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    );
  }

  // Check file type (allow common document types)
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `File type not allowed. Supported: PDF, Word, Excel, Text, Images`
    );
  }
}

/**
 * Sanitize filename for storage
 * @param {string} filename
 */
function sanitizeFileName(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .slice(-50); // Limit to 50 chars
}

/**
 * Get random color for subject
 */
function getRandomColor() {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
