import { message, Spin, Tabs, Button, Empty } from "antd";
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { SealClient, SessionKey, getAllowlistedKeyServers } from "@mysten/seal";

import UserProfile from "./components/UserProfile";
import MediaList from "./components/MediaList";
import RevenueSummary from "./components/RevenueSummary";
import GroupFormModal from "./components/GroupFormModal";
import EditProfileModal from "./components/EditProfileModal";
import EditUploadModal from "./components/EditUploadModal";
import CountDownOverlay from "../detail/components/CountDownOverlay";
import MarkdownModal from "./components/MarkdownModal";

import {
  createGroupPtb,
  createProfilePtb,
  deleteFile,
  updateGroupPtb,
  updateProfilePtb,
} from "../../web3/ptb";
import {
  getGroups,
  getUserProfile,
  fetchFilesInGroup,
  getOwnerGroups,
  getUserPass,
} from "../../web3/query";
import { getMediaType } from "../../utils/utils";
import { useWalrusBlob } from "../../hooks/useWalrusBlob";
import { PlusOutlined } from "@ant-design/icons";
import { downloadAndDecrypt } from "../../web3/downloadAndDecrypt";
import LockedOverlay from "../detail/components/LockedOverlay";

const GROUP_TYPE = {
  0: "free",
  1: "paid",
  2: "time",
};

let originGroupData = [];
export default function Me() {
  const [userProfile, setUserProfile] = useState(null);
  const [tabsGroup, setTabsGroup] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [actionType, setActionType] = useState("create");
  const [groupActionType, setGroupActionType] = useState("create");
  const [isExpired, setIsExpired] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({});
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showGroupFormModal, setShowGroupFormModal] = useState(false);
  const [showEditUploadModal, setShowEditUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMarkdownModal, setShowMarkdownModal] = useState(false);

  const { blobUrl: bannerUrl } = useWalrusBlob(userProfile?.bannerUrl);

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });
  const account = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (account?.address) {
      handleQueryUserProfile();

      handleQueryGroups();
    }
  }, [account?.address]);

  // 切换组后加载对应文件
  useEffect(() => {
    if (activeKey) {
      setIsExpired(true);
      // 情况列表
      setFileList([]);

      const group =
        originGroupData?.find((item) => item?.objectId === activeKey) || {};
      const info = saveGroupInfo(group);
      handleQueryFilesByGroup(activeKey, info?.group_type);
    }
  }, [activeKey]);

  // 保存分组信息
  const saveGroupInfo = (data) => {
    const { objectId: groupId, capId, fields } = data || {};
    const { name, fee_pre_month, open_time, close_time, group_type } = fields || {};

    console.log("fields", fields);

    const isExpired = dayjs(Number(open_time)).isBefore(dayjs());

    const info = {
      groupName: name,
      groupId,
      capId,
      monthly: fee_pre_month,
      lifeTime: fields?.fee_cut_off,
      open_time,
      close_time,
      group_type,
    };
    setCurrentGroup(info);
    // 时间胶囊
    if (group_type === 2) {
      console.log("isExpired", isExpired);

      setIsExpired(isExpired);
    }
    return info;
  };

  const handleQueryUserProfile = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile(account.address, suiClient);
      console.log("userProfile", data);

      setUserProfile({ ...data });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (formData) => {
    if (submiting) return;
    setSubmiting(true);
    message.loading("Saving...", 0);
    console.log(formData);
    const {
      avatarUrl,
      bannerUrl,
      name,
      describeYourself,
      website,
      twitter,
      telegram,
      facebook,
    } = formData;
    const data = [
      avatarUrl,
      bannerUrl,
      name,
      describeYourself,
      website,
      twitter,
      telegram,
      facebook,
    ];
    console.log("data: ", data, account.address);

    let tx;
    if (actionType === "create") {
      tx = await createProfilePtb(data, account.address);
    } else {
      if (!userProfile?.objectId) {
        message.error("User profile is not found!");
        return;
      }
      tx = await updateProfilePtb(data, userProfile?.objectId);
    }

    signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: async (txRes) => {
          console.log(txRes);
          message.destroy();
          setSubmiting(false);
          setShowEditProfileModal(false);

          // 刷新
          handleQueryUserProfile();
          // setUserProfile(formData)
        },
      },
      {
        onError: (error) => {
          message.destroy();
          message.error("Save profile error");
          setSubmiting(false);
          console.log(error);
        },
      }
    );
  };

  const handleEditProfile = () => {
    setActionType("edit");
    setShowEditProfileModal(true);
  };

  // 创建Group
  const handleSaveGroup = async (formData) => {
    if (submiting) return;
    setSubmiting(true);
    message.loading("Saving...", 20);
    console.log(formData);
    // return
    const {
      name,
      typeIndex,
      fee_cut_off,
      fee_pre_month,
      open_time,
      close_time,
    } = formData;
    // 新建
    let tx;
    if (groupActionType === "create") {
      tx = await createGroupPtb(
        name,
        typeIndex,
        fee_pre_month,
        fee_cut_off,
        open_time,
        close_time,
        account.address
      );
    } else {
      tx = await updateGroupPtb(
        currentGroup?.groupId,
        currentGroup?.capId,
        name,
        typeIndex,
        fee_pre_month,
        fee_cut_off,
        open_time,
        close_time,
        account.address
      );
    }

    signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: async (txRes) => {
          console.log(txRes);
          message.destroy();
          setSubmiting(false);
          setShowGroupFormModal(false);

          // 刷新
          handleQueryGroups();
        },
      },
      {
        onError: (error) => {
          message.destroy();
          message.error("Save profile error");
          setSubmiting(false);
          console.log(error);
        },
      }
    );
  };

  // 第一步：加载分组
  const handleQueryGroups = async () => {
    try {
      const data = await getGroups(account.address, suiClient); // 获取组列表
      const capData = await getOwnerGroups(account.address, suiClient); // 获取组列表
      console.log(data, capData);

      data?.forEach((item) => {
        const cap = capData?.find((g) => g?.group_id === item?.objectId);
        if (cap) {
          item.capId = cap?.id;
        }
      });
      data?.sort(
        (a, b) =>
          Number(a?.fields.fee_pre_month) - Number(b?.fields.fee_pre_month)
      );

      const items = data?.map((g, index) => ({
        key: g?.objectId || String(index + 1),
        label: g?.fields?.name || `Group ${index + 1}`,
      }));
      setTabsGroup(items);
      // 将group数据缓存
      originGroupData = data;
      console.log("originGroupData: ", originGroupData);

      if (items.length > 0) {
        setActiveKey(items[0].key); // 默认选中第一个
        // 保存信息
        saveGroupInfo(data[0]);
      }
    } catch (err) {
      message.error("获取分组失败");
    }
  };

  // 第二步：加载当前组的文件数据
  const handleQueryFilesByGroup = async (groupId, group_type) => {
    setTableLoading(true);
    const restriction = GROUP_TYPE[group_type];

    let userPass;
    if (group_type) {
      userPass = await getUserPass(groupId, account?.address, suiClient);
      console.log("getUserPass: ", userPass);

      // if (!userPass) {
      //   setNoPass(true);
      //   return;
      // }
    }

    try {
      const res = await fetchFilesInGroup(groupId, suiClient); // 获取对应组的文件
      console.log("FilesByGroup res: ", res);

      let data = res
        ?.map((item) => {
          try {
            const { objectId, fields } = item;
            let { name, value } = fields;
            const values = JSON.parse(value);
            return {
              ...values,
              objectId,
              restriction,
              blobId: name,
              type: getMediaType(values?.suffix),
            };
          } catch (err) {
            console.warn("解析失败，跳过该项：", item, err);
            return null; // 标记无效项
          }
        })
        .filter(Boolean); // 移除为 null 的项
      console.log("fileList: ", data);

      if (group_type === 1 && isExpired) {
        data = await handleDecryptFileList(data, userPass?.id);
        console.log("decrypt: ", data);
        setFileList(data || []);
        return;
      }
      setFileList(data || []);
    } catch (err) {
      console.log(err);

      message.error("Loaded file fail");
    } finally {
      setTableLoading(false);
    }
  };

  // 解密group下的文件
  const handleDecryptFileList = async (list, passId) => {
    const res = await downloadAndDecrypt(list, suiClient, client, {
      groupId: currentGroup?.groupId,
      passId,
    }, account?.address, signPersonalMessage);
    return res;
  };

  // 上传文件成功后回调
  const handleSaveUpload = () => {
    const { groupId, group_type } = currentGroup;
    // 刷新
    handleQueryFilesByGroup(groupId, group_type);
    setShowEditUploadModal(false);
    setShowMarkdownModal(false);
  };

  // 删除文件
  const handleDeleteFile = async (row) => {
    const { groupId, capId, group_type } = currentGroup;
    console.log("handleDeleteFile: ", groupId, capId, row.blobId);
    const tx = await deleteFile({
      groupObjectId: groupId,
      capId,
      blobId: row.blobId,
    });

    signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: async (txRes) => {
          message.success("delete file is success!");
          // 刷新
          handleQueryFilesByGroup(groupId, group_type);
        },
      },
      {
        onError: (error) => {
          message.destroy();
          message.error("Save profile error");
          setSubmiting(false);
          console.log(error);
        },
      }
    );
  };

  // 视频预览
  const handleView = (row) => {
    const filterList = fileList.filter((file) => file?.type !== 'image');
    localStorage.setItem(
      "viewFile",
      JSON.stringify({ videoInfo: row, currentGroup, userProfile, fileList: filterList })
    );
    if (row.type === "video") {
      window.open(`/preview/video?objectId=${row.blobId}&type=${row.type}`, "_blank");
    } else {
      window.open(`/preview/md?objectId=${row.blobId}&type=${row.type}`, "_blank");
    }
  };

  const EmtpyContent = () => (
    <>
      <div className="w-full flex flex-col items-center justify-center py-24">
        <Empty description="" />
        {userProfile?.objectId ? (
          <button
            onClick={() => setShowGroupFormModal(true)}
            className="mt-4 px-6 py-2 text-white bg-primary hover:bg-blue-700 rounded-full w-fit"
          >
            Add Group
          </button>
        ) : (
          <div className=" text-gray-500">Please create a profile first</div>
        )}
      </div>
    </>
  );
  return (
    <div className="">
      {/* 个人信息 */}
      <Spin spinning={loading}>
        <div className="w-full h-[320px] flex">
          <div
            className={
              "absolute w-full h-[320px] blur-md bg-cover bg-center bg-no-repeat"
            }
            style={{
              backgroundImage: `url(${
                bannerUrl || "/assets/images/bg_me.jpg"
              })`,
            }}
          ></div>
          <UserProfile
            user={userProfile}
            onCreate={() => {
              setActionType("create");
              setShowEditProfileModal(true);
            }}
            onEdit={handleEditProfile}
          />
        </div>
      </Spin>
      {/* 主页面内容 */}
      <div className="w-[80%] h-full m-auto mt-[-100px] mb-20 px-10 pb-10 relative bg-white rounded-lg">
        {/* 汇总信息 */}
        {userProfile && (
          <RevenueSummary data={userProfile} onClaim={() => {}} />
        )}
        {/* 图片、视频 */}
        {tabsGroup?.length ? (
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            style={{ minHeight: 400, position: "relative" }}
            items={tabsGroup?.map((g) => ({
              key: g.key,
              label: g.label,
              children: (
                <>
                  {!isExpired && <CountDownOverlay groupInfo={currentGroup} />}
                  <MediaList
                    groupInfo={currentGroup}
                    data={fileList}
                    loading={tableLoading}
                    onUpload={() => {
                      setShowEditUploadModal(true); // 上传后刷新
                    }}
                    onPostMessage={() => {
                      setShowMarkdownModal(true);
                    }}
                    onEditGroup={() => {
                      setGroupActionType("edit");
                      setShowGroupFormModal(true);
                    }}
                    onDeleteFile={handleDeleteFile}
                    onView={handleView}
                  />
                </>
              ),
            }))}
            tabBarExtraContent={{
              right: (
                <Button
                  // type="primary"
                  onClick={() => {
                    setGroupActionType("create");
                    setShowGroupFormModal(true);
                  }}
                >
                  <PlusOutlined />
                </Button>
              ),
            }}
          />
        ) : (
          <EmtpyContent />
        )}
      </div>

      {/* 编辑个人信息        */}
      <EditProfileModal
        open={showEditProfileModal}
        submiting={submiting}
        actionType={actionType}
        onClose={() => {
          setShowEditProfileModal(false);
          setSubmiting(false);
        }}
        initialData={userProfile}
        onSubmit={handleSaveProfile}
      />

      {/* 分享 */}
      <MarkdownModal
        open={showMarkdownModal}
        onClose={() => setShowMarkdownModal(false)}
        initialData={{ ...currentGroup }}
        onSubmit={handleSaveUpload}
      />

      {/* group */}
      <GroupFormModal
        open={showGroupFormModal}
        onClose={() => {
          setShowGroupFormModal(false);
          setSubmiting(false);
        }}
        actionType={groupActionType}
        initialData={{ ...currentGroup }}
        onSubmit={handleSaveGroup}
      />

      {/* 上传或编辑图片、视频 */}
      <EditUploadModal
        open={showEditUploadModal}
        onClose={() => setShowEditUploadModal(false)}
        data={currentGroup}
        onSubmit={handleSaveUpload}
      />
    </div>
  );
}
