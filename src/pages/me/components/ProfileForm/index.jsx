import React, { useEffect, useState } from "react";
import { Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import FileUploader from "../../../../components/FileUploader";
import WalrusMedia from "../../../../components/WalrusMedia";

const DEFAULT_AVATAR = "/assets/images/person.svg";
const DEFAULT_BANNER = "/assets/images/banner.svg";

const ProfileForm = ({ data, onChange }) => {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNER);

  useEffect(() => {
    console.log("profile form", data);

    form.setFieldsValue(data);
    if (data?.avatarUrl) setAvatarUrl(data.avatarUrl);
    if (data?.bannerUrl) setBannerUrl(data.bannerUrl);
  }, [data]);

  const handleFormChange = (_, allValues) => {
    onChange({ ...allValues, avatarUrl, bannerUrl });
  };

  const beforeUpload = (file) => {
    const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(
      file.type
    );
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isValidType) message.error("Only JPEG/PNG/WEBP files allowed!");
    if (!isLt10M) message.error("Image must be smaller than 10MB!");
    return isValidType && isLt10M;
  };

  const handleAvatarChange = (info) => {
    setAvatarUrl(info?.blobId);
    onChange({ ...form.getFieldsValue(), avatarUrl: info?.blobId });
  };

  const handleBannerChange = (info) => {
    setBannerUrl(info?.blobId);
    onChange({ ...form.getFieldsValue(), bannerUrl: info?.blobId });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={data}
      onValuesChange={handleFormChange}
    >
      {/* Avatar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-[120px] h-[120px] flex justify-center items-center flex-shrink-0 bg-gray-100 rounded-full">
            <WalrusMedia blobId={avatarUrl} width={80} height={80} isRound/>
          </div>
          <div>
            <div className="font-medium">Avatar</div>
            <div className="text-xs text-gray-400">
              (JPEG, PNG, WEBP Files, Size&lt;10M)
            </div>
          </div>
        </div>
        <FileUploader
          data={{ groupId: "" }}
          onUploadDone={handleAvatarChange}
          isPreview={false}
          isEncrypt={false}
        />
      </div>

      {/* Banner */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <WalrusMedia blobId={bannerUrl} />
          <div>
            <div className="font-medium">Banner</div>
            <div className="text-xs text-gray-400">
              (JPEG, PNG, WEBP Files, Size&lt;10M)
            </div>
          </div>
        </div>
        <FileUploader
          data={{ groupId: "" }}
          onUploadDone={handleBannerChange}
          isPreview={false}
          isEncrypt={false}
        />
      </div>

      {/* Other fields */}
      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input placeholder="Name" />
      </Form.Item>

      <Form.Item label="Describe Yourself (Optional)" name="describeYourself">
        <Input.TextArea rows={4} placeholder="Project description" />
      </Form.Item>

      <Form.Item label="Website (Optional)" name="website">
        <Input placeholder="https://xxx.org" />
      </Form.Item>

      <Form.Item label="Twitter (Optional)" name="twitter">
        <Input placeholder="https://twitter.com/xxx" />
      </Form.Item>

      <Form.Item label="Telegram (Optional)" name="telegram">
        <Input placeholder="https://t.me/xxx" />
      </Form.Item>

      <Form.Item label="Facebook (Optional)" name="facebook">
        <Input placeholder="https://facebook.com/xxx" />
      </Form.Item>
    </Form>
  );
};

export default ProfileForm;
