// useWalrusUpload.ts
import { useState } from 'react';
import { fromHex, toHex } from '@mysten/sui/utils';
import type { SealClient } from '@mysten/seal';

export type UploadData = {
  status: string;
  blobId: string;
  endEpoch: string;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  suiUrl: string;
  isImage: boolean;
};

interface UseWalrusUploadProps {
  file: File;
  policyObject: string;
  packageId: string;
  client: SealClient;
  numEpoch?: number;
}

const PUBLISH_URL = 'https://publisher.walrus-testnet.walrus.space'
const AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space'

export function useWalrusUpload({
  file,
  policyObject,
  packageId,
  client,
  numEpoch = 1,
}: UseWalrusUploadProps) {
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // 处理文件选取与校验（最大 10 MiB，仅限图片）
  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedFile = event.target.files?.[0];
  //   if (!selectedFile) return;
  //   if (selectedFile.size > 10 * 1024 * 1024) {
  //     alert('File size must be less than 10 MiB');
  //     return;
  //   }
  //   if (!selectedFile.type?.startsWith('image/')) {
  //     alert('Only image files are allowed');
  //     return;
  //   }
  //   setFile(selectedFile);
  //   setUploadData(null);
  // };

  // 上传 blob 的请求封装
  const storeBlob = async (encryptedData: any): Promise<any> => {
    const url = `${PUBLISH_URL}/v1/blobs?epochs=${numEpoch}`;

    console.log('url :', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      body: encryptedData,
    });
    if (response.status === 200) {
      return response.json();
    } else {
      alert('Error publishing the blob on Walrus, please select a different Walrus service.');
      throw new Error('Error storing blob');
    }
  };

  // 封装加密、上传文件的完整逻辑
  const upload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      // 直接转换为 ArrayBuffer，无需使用 FileReader 的事件绑定
      const fileBuffer = await file.arrayBuffer();
      // 生成随机数 nonce（5 字节）
      const nonce = crypto.getRandomValues(new Uint8Array(5));
      // 将 policyObject 转换成字节数组，并与 nonce 拼接得到 id
      const policyObjectBytes = fromHex(policyObject);
      const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

      // 调用客户端加密方法（假设 encrypt 方法返回 { encryptedObject }）
      const { encryptedObject: encryptedBytes } = await client.encrypt({
        threshold: 2,
        packageId,
        id,
        data: new Uint8Array(fileBuffer),
      });

      // 上传加密后的 blob
      const storageInfo = await storeBlob(fileBuffer);
      displayUpload(storageInfo.info, file.type);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // 根据上传返回的 storage_info 构造上传详情（UploadData）
  const displayUpload = (storage_info: any, media_type: string) => {
    let info;
    const isImage = media_type?.startsWith('image');
    const SUI_VIEW_TX_URL = `https://suiscan.xyz/testnet/tx`;
    const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/testnet/object`;

    if ('alreadyCertified' in storage_info) {
      info = {
        status: 'Already certified',
        blobId: storage_info.alreadyCertified.blobId,
        endEpoch: storage_info.alreadyCertified.endEpoch,
        suiRefType: 'Previous Sui Certified Event',
        suiRef: storage_info.alreadyCertified.event.txDigest,
        suiBaseUrl: SUI_VIEW_TX_URL,
        blobUrl: `${AGGREGATOR_URL}/v1/blobs/${storage_info.alreadyCertified.blobId}`,
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storage_info.alreadyCertified.event.txDigest}`,
        isImage,
      };
    } else if ('newlyCreated' in storage_info) {
      info = {
        status: 'Newly created',
        blobId: storage_info.newlyCreated.blobObject.blobId,
        endEpoch: storage_info.newlyCreated.blobObject.storage.endEpoch,
        suiRefType: 'Associated Sui Object',
        suiRef: storage_info.newlyCreated.blobObject.id,
        suiBaseUrl: SUI_VIEW_OBJECT_URL,
        blobUrl: `${AGGREGATOR_URL}/v1/blobs/${storage_info.newlyCreated.blobObject.blobId}`,
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storage_info.newlyCreated.blobObject.id}`,
        isImage,
      };
    } else {
      throw new Error('Unhandled successful response!');
    }
    setUploadData(info);
  };

  return {
    uploadData,
    isUploading,
    upload,
    setUploadData,
  };
}
