/**
 * Validation Utilities
 * Centralized validation functions for forms and inputs
 */

/**
 * Validate subject name
 * @param {string} name
 * @returns {Object} {valid, error}
 */
export function validateSubjectName(name) {
  if (!name) {
    return { valid: false, error: "Subject name is required" };
  }

  const trimmed = name.trim();

  if (trimmed.length < 1) {
    return { valid: false, error: "Subject name cannot be empty" };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "Subject name must be less than 100 characters" };
  }

  if (!/^[a-zA-Z0-9\s\-&\(\)]+$/.test(trimmed)) {
    return { 
      valid: false, 
      error: "Subject name can only contain letters, numbers, spaces, hyphens, and parentheses" 
    };
  }

  return { valid: true };
}

/**
 * Validate material title
 * @param {string} title
 * @returns {Object} {valid, error}
 */
export function validateMaterialTitle(title) {
  if (!title) {
    return { valid: false, error: "Material title is required" };
  }

  const trimmed = title.trim();

  if (trimmed.length < 1) {
    return { valid: false, error: "Material title cannot be empty" };
  }

  if (trimmed.length > 150) {
    return { 
      valid: false, 
      error: "Material title must be less than 150 characters" 
    };
  }

  return { valid: true };
}

/**
 * Validate email
 * @param {string} email
 * @returns {Object} {valid, error}
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { valid: false, error: "Email is required" };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true };
}

/**
 * Validate file
 * @param {File} file
 * @returns {Object} {valid, error}
 */
export function validateFile(file) {
  const MAX_SIZE_MB = import.meta.env.VITE_MAX_FILE_SIZE_MB || 50;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (!file) {
    return { valid: false, error: "Please select a file" };
  }

  // Check file size
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_SIZE_MB}MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
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
    return {
      valid: false,
      error: "File type not allowed. Supported: PDF, Word, Excel, Text, Images",
    };
  }

  return { valid: true };
}

/**
 * Validate URL
 * @param {string} url
 * @returns {Object} {valid, error}
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: "Please enter a valid URL" };
  }
}

/**
 * Validate empty string
 * @param {string} value
 * @param {string} fieldName
 * @returns {Object} {valid, error}
 */
export function validateRequired(value, fieldName = "This field") {
  if (!value || (typeof value === "string" && !value.trim())) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

/**
 * Validate number range
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @param {string} fieldName
 * @returns {Object} {valid, error}
 */
export function validateNumberRange(value, min, max, fieldName = "Value") {
  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (num < min || num > max) {
    return { 
      valid: false, 
      error: `${fieldName} must be between ${min} and ${max}` 
    };
  }

  return { valid: true };
}

/**
 * Validate text length
 * @param {string} value
 * @param {number} minLength
 * @param {number} maxLength
 * @param {string} fieldName
 * @returns {Object} {valid, error}
 */
export function validateTextLength(value, minLength, maxLength, fieldName = "Text") {
  const length = value?.length || 0;

  if (length < minLength) {
    return { 
      valid: false, 
      error: `${fieldName} must be at least ${minLength} characters` 
    };
  }

  if (length > maxLength) {
    return { 
      valid: false, 
      error: `${fieldName} must be less than ${maxLength} characters` 
    };
  }

  return { valid: true };
}

export default {
  validateSubjectName,
  validateMaterialTitle,
  validateEmail,
  validateFile,
  validateUrl,
  validateRequired,
  validateNumberRange,
  validateTextLength,
};
