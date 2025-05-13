import { SealClient, SessionKey, NoAccessError, EncryptedObject } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { approvePtb } from './ptb'
import { getSessionKey } from '../lib/sessionKeyStore';
import { initAndSignSessionKey } from '../lib/sessionKeyInitializer';
import { AGGREGATOR_URL } from '../config/constants';

export const downloadAndDecrypt = async (
  fileList: any[],
  suiClient: SuiClient,
  sealClient: SealClient,
  groupInfo: any,
  address: string,
  signPersonalMessage: any
): Promise<{ file: any; decryptedUrl: string }[] | null> => {

  // 初始化 sessionKey
  let sessionKey = getSessionKey();

  if (!sessionKey) {
    sessionKey = await initAndSignSessionKey(address, signPersonalMessage);
  }

  const { groupId, passId } = groupInfo;

  // 下载所有文件
  const downloadResults = await Promise.all(
    fileList.map(async (file) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const url = `${AGGREGATOR_URL}/v1/blobs/${file?.blobId}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) return null;

        const buffer = await res.arrayBuffer();
        return { file, encryptedData: buffer };
      } catch (err) {
        console.error(`Blob ${file?.blobId} download failed:`, err);
        return null;
      }
    })
  );

  // 过滤成功的
  const validItems = downloadResults.filter((r): r is { file: any; encryptedData: ArrayBuffer } => !!r);
  if (validItems.length === 0) {
    console.error("All downloads failed");
    return null;
  }

  // 拿所有 id
  const ids = validItems.map(({ encryptedData }) => {
    return EncryptedObject.parse(new Uint8Array(encryptedData)).id;
  });

  // 批量获取密钥
  const txBytes = await approvePtb(ids, groupId, passId, suiClient);
  try {
    await sealClient.fetchKeys({ ids, txBytes, sessionKey, threshold: 2 });
  } catch (err) {
    const msg = err instanceof NoAccessError ? 'No access to keys' : 'Key fetch failed';
    console.error(msg, err);
    return null;
  }

  // 解密 + 映射回文件
  const result: { file: any; decryptedUrl: string }[] = [];
  for (const { file, encryptedData } of validItems) {
    const fullId = EncryptedObject.parse(new Uint8Array(encryptedData)).id;
    const txBytes = await approvePtb(fullId, groupId, passId, suiClient);
    try {
      const decrypted = await sealClient.decrypt({
        data: new Uint8Array(encryptedData),
        sessionKey,
        txBytes,
      });
      console.log("decrypted: ", decrypted);

      if (file?.type === 'md') {
        // 用 TextDecoder 解码
        const decoder = new TextDecoder('utf-8');
        const markdownText = decoder.decode(decrypted);

        result.push({ ...file, text: markdownText });
      } else {
        const mimeType = file?.type?.startsWith('video') ? 'video/mp4' : 'image/jpeg'; // 可动态处理类型
        const blob = new Blob([decrypted], { type: mimeType });
        const url = URL.createObjectURL(blob);
        result.push({ ...file, decryptedUrl: url });
      }

    } catch (err) {
      console.error(`Failed to decrypt file ${file?.blobId}:`, err);
      return null;
    }
  }
  return result;
};
