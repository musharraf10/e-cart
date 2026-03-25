import admin from "firebase-admin";

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not configured");
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }

    return parsed;
  } catch {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
  }
}

export function getFirebaseAdminAuth() {
  if (!admin.apps.length) {
    const serviceAccount = parseServiceAccount();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }

  return admin.auth();
}
