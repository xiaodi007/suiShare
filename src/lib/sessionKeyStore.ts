// lib/sessionKeyStore.ts
import { SessionKey } from '@mysten/seal';

let sessionKeyInstance: SessionKey | null = null;

export function setSessionKey(key: SessionKey) {
  sessionKeyInstance = key;
}

export function getSessionKey(): any {
  if (!sessionKeyInstance) {
    console.log("SessionKey has not been initialized yet.");
  }
  return sessionKeyInstance;
}

export function clearSessionKey() {
  sessionKeyInstance = null;
}
