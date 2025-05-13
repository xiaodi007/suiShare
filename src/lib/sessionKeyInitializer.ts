// lib/sessionKeyInitializer.ts
import { SessionKey } from "@mysten/seal";
import { PACKAGE_ID, TTL_MIN } from '../config/constants'
import { setSessionKey } from "./sessionKeyStore";

export async function initAndSignSessionKey(
  address: string,
  signPersonalMessage: (params: { message: string }, opts: { onSuccess: (res: { signature: string }) => void; onError: (err: any) => void }) => void
): Promise<SessionKey> {
  const sessionKey = new SessionKey({
    address,
    packageId: PACKAGE_ID,
    ttlMin: TTL_MIN,
  });

  const personalMessage = sessionKey.getPersonalMessage();

  await new Promise((resolve, reject) => {
    signPersonalMessage(
      { message: personalMessage },
      {
        onSuccess: async ({ signature }) => {
          await sessionKey.setPersonalMessageSignature(signature);
          setSessionKey(sessionKey);
          resolve(sessionKey);
        },
        onError: reject,
      }
    );
  });

  return sessionKey;
}
