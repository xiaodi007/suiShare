import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import FileUploader from "../../../../components/FileUploader";
import { publishFile } from "../../../../web3/ptb";
import dayjs from "dayjs";

const EditUploadModal = ({ open, onClose, data = {}, onSubmit }) => {
  const [uploadInfo, setUploadInfo] = useState({});
  const [form] = Form.useForm();

  const suiClient = useSuiClient();
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

  const handleUploadDone = (data) => {
    console.log("data: ", data);

    setUploadInfo(data);
  };

  const handleFinalSubmit = async () => {
    await form.validateFields();
    const { title, description } = form.getFieldsValue();
    const { blobId, ...reset } = uploadInfo;
    const createDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    if(!blobId) {
      message.error('Please upload file first!')
      return
    }
    console.log('sub: ', data);
    
    const { groupId, capId } = data;
    //   {
    //     "title": "hahah",
    //     "description": "asdfasdfasdf",
    //     "fileName": "0c332306-3054-11eb-832d-0433c2d3678c.jpg",
    //     "suffix": "jpg"
    // }
    console.log({ title, description, createDate, ...reset });
    
    const tx = await publishFile({
      groupObjectId: groupId,
      capId,
      uploadBlobId: blobId,
      fileInfo: JSON.stringify({ title, description, createDate, ...reset }),
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
      width={600}
      title="File Upload"
      destroyOnClose
      onOk={handleFinalSubmit}
    >
      <div className="pt-6">
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Title" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Description" />
          </Form.Item>

          <Form.Item label="File" name="file">
            <FileUploader
              mode="drop"
              data={data}
              onUploadDone={handleUploadDone}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EditUploadModal;
