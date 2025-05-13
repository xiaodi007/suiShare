import React, { useState, useEffect } from "react";
import { Modal, Steps, Button, message } from "antd";
import ProfileForm from "../ProfileForm";
import { use } from "i18next";

const EditProfileModal = ({ open, actionType, submiting, onClose, initialData = {}, onSubmit }) => {
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if(!open) return
    console.log("edit modal", formData);
    setFormData(initialData);
  }, [open]);

  
  const handleDataChange = (stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const handleFinalSubmit = () => {
    const { name } = formData || {};
    if(!name) {
      message.error("Please enter a name");
      return
    }
    onSubmit?.(formData);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      confirmLoading={submiting}
      width={800}
      title={actionType === 'create' ? "Create My Page" : "Edit Profile"}
      destroyOnClose
      onOk={handleFinalSubmit}
    >
      <div className="pt-6">
        <ProfileForm data={formData} onChange={handleDataChange} />
      </div>
    </Modal>
  );
};

export default EditProfileModal;
