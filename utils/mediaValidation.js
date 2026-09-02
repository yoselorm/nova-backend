// Shared helpers for validating base64-encoded media payloads (resumes, images, etc.)

const MAX_MEDIA_SIZE = 5 * 1024 * 1024; // 5MB hard ceiling for any stored base64 asset

const getBase64SizeInBytes = (base64String) => {
  if (!base64String) return 0;
  const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
  if (!base64Data) return 0;
  const padding = (base64Data.match(/=+$/) || [''])[0].length;
  return Math.floor((base64Data.length * 3) / 4) - padding;
};

const exceedsMaxMediaSize = (base64String) => getBase64SizeInBytes(base64String) > MAX_MEDIA_SIZE;

module.exports = { MAX_MEDIA_SIZE, getBase64SizeInBytes, exceedsMaxMediaSize };
