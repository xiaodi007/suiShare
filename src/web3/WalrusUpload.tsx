// WalrusUpload.tsx
import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
// import { useNetworkVariable } from './networkConfig';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Button, Card, Flex } from 'antd';
import { getAllowlistedKeyServers, SealClient } from '@mysten/seal';
import { useWalrusUpload } from './useWalrusUpload';

type WalrusService = {
  id: string;
  name: string;
  publisherUrl: string;
  aggregatorUrl: string;
};

interface WalrusUploadProps {
  policyObject: string;
  cap_id: string;
  moduleName: string;
}

export function WalrusUpload({ policyObject = '1', cap_id = '2', moduleName = '3'}: WalrusUploadProps) {
  const [selectedService, setSelectedService] = useState<string>('service1');
  const packageId = '0xac2bdf2f977bf930266d619d32de213a0ae036d0301a58209325f90b0098ea25';
  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers('testnet'),
    verifyKeyServers: false,
  });

  const services: WalrusService[] = [
    { id: 'service1', name: 'walrus.space', publisherUrl: '/publisher1', aggregatorUrl: '/aggregator1' },
    { id: 'service2', name: 'staketab.org', publisherUrl: '/publisher2', aggregatorUrl: '/aggregator2' },
    { id: 'service3', name: 'redundex.com', publisherUrl: '/publisher3', aggregatorUrl: '/aggregator3' },
    { id: 'service4', name: 'nodes.guru', publisherUrl: '/publisher4', aggregatorUrl: '/aggregator4' },
    { id: 'service5', name: 'banansen.dev', publisherUrl: '/publisher5', aggregatorUrl: '/aggregator5' },
    { id: 'service6', name: 'everstake.one', publisherUrl: '/publisher6', aggregatorUrl: '/aggregator6' },
  ];

  function getAggregatorUrl(path: string): string {
    const service = services.find((s) => s.id === selectedService);
    const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '');
    return `${service?.aggregatorUrl}/v1/${cleanPath}`;
  }

  function getPublisherUrl(path: string): string {
    const service = services.find((s) => s.id === selectedService);
    const cleanPath = path.replace(/^\/+/, '').replace(/^v1\//, '');
    return `/publisher1/v1/${cleanPath}`;
  }

  // 使用刚刚拆分出来的自定义 Hook
  const { file, uploadData, isUploading, handleFileChange, upload } = useWalrusUpload({
    policyObject,
    packageId,
    client,
    getPublisherUrl,
    getAggregatorUrl,
    numEpoch: 1,
  });

  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  // 处理关联上传文件到 Sui 对象的发布逻辑
  async function handlePublish() {
    if (!uploadData) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${moduleName}::publish`,
      arguments: [tx.object(policyObject), tx.object(cap_id), tx.pure.string(uploadData.blobId)],
    });
    tx.setGasBudget(10000000);
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          console.log('Publish result', result);
          alert('Blob attached successfully, now share the link or upload more.');
        },
      },
    );
  }

  return (
    <Card>
      <Flex direction="column" gap="2" align="start">
        <Flex gap="2" align="center">
        <h2>Walrus Upload</h2>
        <img src='https://aggregator.walrus-testnet.walrus.space/v1/blobs/h4EdmyJVAVDpvnrrh3QkARonFtCz5ptMov8rt3gBYU4.png' />
          <div>Select Walrus service:</div>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            aria-label="Select Walrus service"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </Flex>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          aria-label="Choose image file to upload"
        />
        <p>File size must be less than 10 MiB. Only image files are allowed.</p>
        <Button onClick={upload} disabled={!file}>
          First step: Encrypt and upload to Walrus
        </Button>
        {isUploading && (
          <div role="status">
            <span>
              Uploading to Walrus (may take a few seconds, retrying with different service is possible)
            </span>
          </div>
        )}
        {uploadData && file && (
          <div id="uploaded-blobs" role="region" aria-label="Upload details">
            <dl>
              <dt>Status:</dt>
              <dd>{uploadData.status}</dd>
              <dd>
                <a
                  href={uploadData.blobUrl}
                  style={{ textDecoration: 'underline' }}
                  download
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(uploadData.blobUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  Encrypted blob
                </a>
              </dd>
              <dd>
                <a
                  href={uploadData.suiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  Sui Object
                </a>
              </dd>
            </dl>
          </div>
        )}
        <Button onClick={handlePublish} disabled={!uploadData || !file || policyObject === ''}>
          Second step: Associate file to Sui object
        </Button>
      </Flex>
    </Card>
  );
}

export default WalrusUpload;
