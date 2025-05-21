import React, { useState, useEffect } from "react";
import {
  Modal,
  Steps,
  Button,
  message,
  Form,
  InputNumber,
  DatePicker,
  Input,
  Radio,
} from "antd";
import dayjs from "dayjs";
// import suiIcon from "@/assets/sui.svg";
import suiIcon from "../../../../../public/assets/sui.svg";

const GROUP_TYPE = {
  free: 0,
  paid: 1,
  time: 2,
};

const GROUP_VALUE_TYPE = {
  0: "free",
  1: "paid",
  2: "time",
};

const CreateMyPageModal = ({
  open,
  actionType,
  onClose,
  initialData = {},
  onSubmit,
}) => {
  const [modalGroupType, setmodalGroupType] = useState(1);
  const [form] = Form.useForm();
  const groupType = Form.useWatch("groupType", form);

  useEffect(() => {
    if (open) {
      console.log("initialData: ", initialData);

      const {
        groupName,
        group_type,
        monthly,
        lifeTime,
        open_time,
        close_time,
      } = initialData;
      if (actionType === "edit") {
        console.log("edit: ", initialData);
        setmodalGroupType(GROUP_VALUE_TYPE[group_type]);
        form.setFieldsValue({
          name: groupName,
          groupType: GROUP_VALUE_TYPE[group_type],
          monthly: Number(monthly) / 10 ** 9,
          lifeTime: Number(lifeTime) / 10 ** 9,
          openTime: dayjs(Number(open_time)),
          closeTime: dayjs(Number(close_time)),
        });
      } else {
        form.setFieldsValue({
          name: "",
          groupType: "free",
          monthly: 0,
          lifeTime: 0,
        });
      }
    }
  }, [open]);
  const handleFinalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { name, groupType, monthly, lifeTime, openTime, closeTime } =
        values;

      const now = dayjs().valueOf(); // 当前时间戳 (秒)
      const hundredYearsLater = dayjs().add(100, "year").valueOf(); // 100年后的时间戳

      const result = {
        name,
        groupType,
        typeIndex: GROUP_TYPE[groupType],
        open_time: 0,
        close_time: 0,
        fee_pre_month: 0,
        fee_cut_off: 0,
      };

      if (groupType === "free") {
        result.fee_pre_month = 0;
      } else if (groupType === "paid") {
        result.fee_pre_month = Number(monthly) * 10 ** 9; // SUI → fee/ms
        if (lifeTime) {
          result.fee_cut_off = Number(lifeTime) * 10 ** 9; // SUI → cutoff
        }
      }
      result.open_time = groupType === "time" ? openTime.valueOf() : now;
      result.close_time =
        groupType === "time" ? closeTime.valueOf() : hundredYearsLater;

      onSubmit?.(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={600}
      title={`${actionType} Group`}
      destroyOnClose
      onOk={handleFinalSubmit}
    >
      <div className="pt-4">
        <Form
          form={form}
          initialValues={{ groupType: "free", ...initialData }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Name" />
          </Form.Item>

          {actionType === "create" && (
            <Form.Item label="groupType" name="groupType">
              <Radio.Group>
                <Radio value="free">Free</Radio>
                <Radio value="paid">Paid</Radio>
                <Radio value="time">Time Capsule</Radio>
              </Radio.Group>
            </Form.Item>
          )}

          {(modalGroupType === "paid" || groupType === "paid")   && (
            <>
              <Form.Item name="monthly" label="Monthly">
                <InputNumber
                  min={0}
                  placeholder="0.00"
                  className="flex-1"
                  controls={false}
                  suffix={
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <img
                        src={suiIcon}
                        alt="SUI"
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontWeight: 500 }}>SUI</span>
                    </span>
                  }
                  style={{ width: 160 }}
                />
              </Form.Item>

              <Form.Item name="lifeTime" label="LifeTime">
                <InputNumber
                  min={0}
                  placeholder="0.00"
                  className="flex-1"
                  controls={false}
                  suffix={
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <img
                        src={suiIcon}
                        alt="SUI"
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontWeight: 500 }}>SUI</span>
                    </span>
                  }
                  style={{ width: 160 }}
                />
              </Form.Item>
            </>
          )}

          {(modalGroupType === "time" || groupType === "time") && (
            <>
              <Form.Item name="openTime" label="Open Time">
                <DatePicker />
              </Form.Item>
              <Form.Item name="closeTime" label="Close Time">
                <DatePicker />
              </Form.Item>
            </>
          )}
        </Form>
      </div>
    </Modal>
  );
};

export default CreateMyPageModal;
