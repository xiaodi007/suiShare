import React, { useState } from "react";
import { Upload, Button, message, Spin } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { getAllowlistedKeyServers, SealClient } from "@mysten/seal";
import { fromHex, toHex } from "@mysten/sui/utils";

import { PACKAGE_ID, PUBLISH_URL } from "../../config/constants";
import { generateVideoThumbnail } from "../../utils/mediaThumbnail";

// 文件大小上限（10MB）
const MAX_SIZE_MB = 10;

const NUM_EPOCH = 10;

const FileUploader = ({
  accept = "image/*,video/*",
  mode = "button", // "drop" or "button"
  uploadingText = "uploading...",
  data = {},
  isEncrypt = true,
  isPreview = true,
  onUploadDone = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
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

  // 文件大小和类型限制
  const beforeUpload = (file) => {
    const isAllowedType =
      file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!isAllowedType) {
      message.error("Only image or video files can be uploaded");
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < MAX_SIZE_MB;
    if (!isLt10M) {
      message.error("The file cannot be larger than 10MB");
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // 上传处理逻辑
  const handleCustomRequest = async ({ file, onSuccess, onError }) => {
    console.log("file", file);

    try {
      setLoading(true);
      // 直接转换为 ArrayBuffer，无需使用 FileReader 的事件绑定
      const fileBuffer = await file.arrayBuffer();
      // 生成随机数 nonce（5 字节）
      const nonce = crypto.getRandomValues(new Uint8Array(5));
      // 将 policyObject 转换成字节数组，并与 nonce 拼接得到 id
      const policyObjectBytes = fromHex(String(data?.groupId || '0x00'));
      const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

      // 调用客户端加密方法（假设 encrypt 方法返回 { encryptedObject }）
      const { encryptedObject: encryptedBytes } = await client.encrypt({
        threshold: 2,
        packageId: PACKAGE_ID,
        id,
        data: new Uint8Array(fileBuffer),
      });

      const uploadInfo = {
        fileName: file?.name,
        suffix: file?.name?.split(".").pop(),
      };

      
      // 上传加密后的 blob
      const storageInfo = await storeBlob(
        isEncrypt && data?.group_type === 1 ? encryptedBytes : fileBuffer
      );
      
      const blobId =
      storageInfo?.newlyCreated?.blobObject?.blobId ||
      storageInfo?.alreadyCertified?.blobId;

      
      if (file?.type?.startsWith("video/")) {
        const thumbmailFile = await generateVideoThumbnail(file);
        console.log("thumbmailFile", thumbmailFile);
        
        const buffer = await thumbmailFile.arrayBuffer();
        const storageInfo = await storeBlob(buffer);
        uploadInfo.thumbnailBlobId = storageInfo?.newlyCreated?.blobObject?.blobId || storageInfo?.alreadyCertified?.blobId;
      }
      
      uploadInfo.blobId = blobId;

      // 生成预览地址
      const previewUrl = URL.createObjectURL(file);
      setFileUrl(previewUrl);
      setFileType(file.type);

      onUploadDone(uploadInfo);
    } catch (err) {
      console.error(err);
      message.error("Upload failed");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  // 上传 blob 的请求封装
  const storeBlob = async (encryptedData) => {
    const url = `${PUBLISH_URL}/v1/blobs?epochs=${NUM_EPOCH}`;

    console.log("url :", url);

    const response = await fetch(url, {
      method: "PUT",
      body: encryptedData,
    });
    if (response.status === 200) {
      return response.json();
    } else {
      alert(
        "Error publishing the blob on Walrus, please select a different Walrus service."
      );
      throw new Error("Error storing blob");
    }
  };

  const uploaderProps = {
    accept,
    maxCount: 1,
    showUploadList: false,
    beforeUpload,
    customRequest: handleCustomRequest,
  };

  return (
    <Spin spinning={loading} tip={uploadingText}>
      {mode === "drop" ? (
        <Upload.Dragger {...uploaderProps} style={{ padding: 20 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag image/video to upload</p>
        </Upload.Dragger>
      ) : (
        <Upload {...uploaderProps}>
          <Button type="primary">Upload</Button>
        </Upload>
      )}

      {isPreview && (
        <div style={{ marginTop: 20 }}>
          {fileUrl && fileType?.startsWith("image/") && (
            <img src={fileUrl} alt="preview" style={{ height: 100 }} />
          )}
          {fileUrl && fileType?.startsWith("video/") && (
            <video src={fileUrl} controls style={{ width: 400, height: 100 }} />
          )}
        </div>
      )}
    </Spin>
  );
};

export default FileUploader;
