import React, { useState, useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { getAllowlistedKeyServers, SealClient } from "@mysten/seal";
import { fromHex, toHex } from "@mysten/sui/utils";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import dayjs from "dayjs";

import { publishFile } from "../../../../web3/ptb";

import { PACKAGE_ID, PUBLISH_URL } from "../../../../config/constants";

// 初始化 Markdown 渲染器
const mdParser = new MarkdownIt();

// 文件大小上限（10MB）
const MAX_SIZE_MB = 10;

const NUM_EPOCH = 10;

const MarkdownModal = ({ open, onClose, initialData = {}, onSubmit }) => {
  const { group_type } = initialData;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

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

  useEffect(() => {
    if (open) {

    }
  }, [open]);

  // 处理编辑器内容变化
  const handleEditorChange = ({ text }) => {
    setText(text);
  };

  // 处理上传图片（这里是模拟上传，实际需要接后端接口）
  const handleImageUpload = async (file) => {
    // 模拟上传，返回一个 Promise，真实项目应该上传到服务器
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // 使用 base64 模拟图片上传
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  };

  // 上传处理逻辑
  const handleCustomRequest = async () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const file = new File([blob], "document.md", { type: "text/markdown" });

    // 检查文件大小（单位：字节，10MB = 10 * 1024 * 1024）
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error("The file cannot be larger than 10MB！");
      return;
    }

    console.log("file", file);

    try {
      setLoading(true);
      // 直接转换为 ArrayBuffer，无需使用 FileReader 的事件绑定
      const fileBuffer = await file.arrayBuffer();
      // 生成随机数 nonce（5 字节）
      const nonce = crypto.getRandomValues(new Uint8Array(5));
      // 将 policyObject 转换成字节数组，并与 nonce 拼接得到 id
      const policyObjectBytes = fromHex(String(initialData?.groupId || "0x00"));
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
        group_type === 1 ? encryptedBytes : fileBuffer
      );

      const blobId =
        storageInfo?.newlyCreated?.blobObject?.blobId ||
        storageInfo?.alreadyCertified?.blobId;

      

      uploadInfo.blobId = blobId;

      console.log('uploadInfo', uploadInfo);
      return uploadInfo
      
    } catch (err) {
      console.error(err);
      message.error("Upload failed");
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

  const handleFinalSubmit = async () => {
    await form.validateFields();
    const { title } = form.getFieldsValue();
    console.log("submiting: ", text);
    const uploadInfo = await handleCustomRequest()
    const { blobId, ...reset } = uploadInfo || {};
    const { groupId, capId } = initialData;

    const createDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    if(!blobId) {
      message.error('Please upload file first!')
      return
    }
    const tx = await publishFile({
      groupObjectId: groupId,
      capId,
      uploadBlobId: blobId,
      fileInfo: JSON.stringify({ title, description: '', createDate, ...reset }),
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          // 组件上传成功
          message.success('File upload is success!')
          onSubmit?.();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      confirmLoading={loading}
      width={800}
      title={"Post message"}
      destroyOnClose
      onOk={handleFinalSubmit}
    >
      <div className="pt-6">
        <Form form={form} labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Title" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="File">
            <MdEditor
              value={text}
              style={{ height: "600px" }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={handleEditorChange}
              onImageUpload={handleImageUpload}
              config={{
                view: {
                  menu: true,
                  md: true,
                  html: true,
                },
                canView: {
                  menu: true,
                  md: true,
                  html: true,
                },
              }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default MarkdownModal;
