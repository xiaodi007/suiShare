import { Spin, Radio, Tabs, message, Space, Tooltip, Modal } from "antd";
import { EditOutlined, FacebookFilled, IeCircleFilled, PaperClipOutlined, TwitterCircleFilled } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

import {
  useCurrentAccount,
  useSignPersonalMessage,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { SealClient, SessionKey, getAllowlistedKeyServers } from "@mysten/seal";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ImageCardGrid from "./components/ImageCardGrid";
import LockedOverlay from "./components/LockedOverlay";
import WalrusMedia from "../../components/WalrusMedia";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { downloadAndDecrypt } from "../../web3/downloadAndDecrypt";
import { getSessionKey } from "../../lib/sessionKeyStore";

import {
  getUserProfile,
  getGroups,
  fetchFilesInGroup,
  getUserPass,
} from "../../web3/query";
import { getMediaType } from "../../utils/utils";
import { useWalrusBlob } from "../../hooks/useWalrusBlob";

import CountdownTab from "./components/CountDownOverlay";

let originGroupData = [];

const TTL_MIN = 10;

export default function Detail() {
  const [userProfile, setUserProfile] = useState(null);
  const [userPass, setUserPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feeType, setFeeType] = useState('0');
  const [tabsGroup, setTabsGroup] = useState([]); // 当前 feeType 对应的 Tabs 列表
  const [allGroups, setAllGroups] = useState([]); // 全部 group 数据
  const [activeKey, setActiveKey] = useState(null);
  const [currentGroup, setCurrentGroup] = useState({});
  const [listLoading, setListLoading] = useState(false);
  const [noPass, setNoPass] = useState(false);
  const [isExpired, setIsExpired] = useState(true);
  const [fileList, setFileList] = useState([]);

  const { blobUrl: bannerUrl } = useWalrusBlob(userProfile?.bannerUrl);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const attentionAddress = urlParams.get("address"); // 替换 'key' 为你要取的参数名

  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
 

  useEffect(() => {
    // 用户信息
    handleQueryUserProfile();
    // 群组列表
    handleQueryGroups();
  }, []);

  // 切换组后加载对应文件
  useEffect(() => {
    if (activeKey) {
      setIsExpired(true);
      // 情况列表
      setFileList([]);

      const group =
        originGroupData?.find((item) => item?.objectId === activeKey) || {};
      const info = saveGroupInfo(group);

      handleQueryFilesByGroup(activeKey, info);
    }
  }, [activeKey]);

  // 保存分组信息
  const saveGroupInfo = (data) => {
    const { objectId: groupId, capId, fields } = data || {};
    const { name, fee_pre_month, open_time, group_type } = fields || {};

    const isExpired = dayjs(Number(open_time)).isBefore(dayjs());
    const info = {
      groupName: name,
      groupId,
      capId,
      monthly: fee_pre_month,
      lifeTime: fields?.fee_cut_off,
      open_time,
      group_type,
      isExpired
    };
    setCurrentGroup(info);
    // 时间胶囊
    if (group_type === 2) {
      console.log("isExpired", isExpired);

      setIsExpired(isExpired);
    }
    return info;
  };

  // 获取用户信息
  const handleQueryUserProfile = async () => {
    setLoading(true);
    const data = await getUserProfile(attentionAddress, suiClient);
    setLoading(false);
    setUserProfile(data);
  };

  // 选择 free / paid
  const handleFeeTypeChange = async (e) => {
    const value = e.target.value;
    setFeeType(value);
    const filtered = allGroups.filter((g) => g?.fields?.group_type === Number(value));
    const items = filtered.map((g, index) => ({
      key: g.objectId || String(index + 1),
      label: g.fields?.name || `Group ${index + 1}`,
    }));
    setTabsGroup(items);
    setActiveKey(items[0]?.key || null);
  };

  // 查询分组（所有）
  const handleQueryGroups = async () => {
    try {
      const data = await getGroups(attentionAddress, suiClient);
      console.log("getGroups: ", data);

      originGroupData = data;
      setAllGroups(data);
      // 默认使用 free 分组
      const defaultFeeType = '0';
      const filtered = data?.filter((g) => g?.fields?.group_type === 0);
      const items = filtered.map((g, index) => ({
        key: g.objectId,
        label: g.fields?.name || `Group ${index + 1}`,
      }));
      setFeeType(defaultFeeType);

      setTabsGroup(items);
      setActiveKey(items[0]?.key || null);

      // 保存信息
      saveGroupInfo(data[0]);
    } catch (err) {
      message.error("获取分组失败");
    }
  };

  const handleQueryFilesByGroup = async (groupId, groupInfo) => {
    console.log("fetch: group", groupInfo);
    const { isExpired, group_type } = groupInfo;
    if (!isExpired) return;
    console.log("fetch: group next");
    setListLoading(true);
    const userPass = await getUserPass(groupId, account?.address, suiClient);
    console.log("getUserPass: ", userPass);

    // 付费分组
    if (group_type === 1 && !userPass) {
      setNoPass(true);
      return;
    }

    try {
      const res = await fetchFilesInGroup(groupId, suiClient); // 获取对应组的文件
      console.log("FilesByGroup res: ", groupId, res);

      let data = res
        ?.map((item) => {
          try {
            const { objectId, fields } = item;
            const { name, value } = fields;
            const values = JSON.parse(value);
            return {
              ...values,
              objectId,
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
    const sessionKey = getSessionKey();

    if (sessionKey) {
      const decrypted = await handleDecryptFileList(data, userPass?.id);
      console.log("decrypt: ", decrypted);
      setFileList?.(decrypted || []);
      return;
    }

    // 弹窗确认签名
    Modal.confirm({
      title: 'Signature Required',
      content: 'Decryption requires your signature. Do you want to proceed?',
      okText: 'Yes',
      cancelText: 'Cancel',
      onOk: async () => {
        const decrypted = await handleDecryptFileList(data, userPass?.id);
        console.log("decrypt: ", decrypted);
        setFileList?.(decrypted || []);
      },
    });
  }
      setFileList(data || []);
    } catch (err) {
      console.log(err);

      message.error("Loaded file fail");
    } finally {
      setListLoading(false);
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

  const handleNavigate = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  const handlePassSuccess = () => {
    setNoPass(false);
    console.log("handlePassSuccess", currentGroup);
    
    const { groupId } = currentGroup;
    // 刷新
    handleQueryFilesByGroup(groupId, currentGroup);
  }

  return (
    <div className="">
      {/* 个人信息 */}
      <Spin spinning={loading}>
        <div className="w-full h-[320px] flex relative">
          {/* 返回 */}
          <div
            className="absolute top-4 left-10 flex z-10 px-4 py-2 bg-[#f5f8ff20] rounded-full cursor-pointer text-white"
            onClick={() => window.history.back()}
          >
            <ArrowLeftOutlined />
            <div className="ml-4">Back to Home</div>
          </div>
          <div
            className={
              'absolute w-full h-[320px] bg-[url("/assets/images/bg_me.jpg")] bg-cover bg-center blur-md'
            }
            style={{
              background: `url(${bannerUrl || "/assets/images/bg_me.jpg"})`,
            }}
          ></div>
          <div className="w-[80%] m-auto pt-10 pb-20 relative flex">
            {/* 头像 */}
            <div className="w-[140px] h-[140px] flex justify-center items-center flex-shrink-0 bg-white rounded-full">
              <WalrusMedia
                blobId={userProfile?.avatarUrl}
                width={90}
                height={90}
                isRound
              />
            </div>
            {/* 描述 */}
            <div className="flex-1 pl-10">
              <h2 className="mb-3 text-2xl text-white">{userProfile?.name}</h2>
              <div className="w-[150px] mb-3 inline-block px-5 py-1 text-sm text-primary bg-[#F5F8FF] rounded-full overflow-hidden text-ellipsis">
                {userProfile?.userAddress || "--"}
              </div>
              <div className="mb-3 text-white text-xl">
                {userProfile?.describeYourself || "--"}
              </div>

              <Space>
              <Tooltip title={`Website: ${userProfile?.website}`}>
                <IeCircleFilled onClick={() => handleNavigate(userProfile?.website)} style={{ color: '#fff', fontSize: 20 }}/>
              </Tooltip>
              <Tooltip title={`Twitter: ${userProfile?.twitter}`}>
                <TwitterCircleFilled onClick={() => handleNavigate(userProfile?.twitter)} style={{ color: '#fff', fontSize: 20 }}/>
              </Tooltip>
              <Tooltip title={`Facebook: ${userProfile?.facebook}`}>
                <FacebookFilled onClick={() => handleNavigate(user?.facebook)}  style={{ color: '#fff', fontSize: 20 }} />
              </Tooltip>
              <Tooltip title={`Telegram: ${userProfile?.telegram}`}>
                <img src="/assets/images/telegram.png" onClick={() => handleNavigate(userProfile?.telegram)} width={30} height={30} />
              </Tooltip>
            </Space>
            </div>
          </div>
        </div>
      </Spin>
      {/* 主页面内容 */}
      <div className="w-[80%] h-full m-auto mt-[-60px] mb-20 px-10 pb-10 relative bg-white rounded-lg">
        {/* 是否免费 */}
        <div className="pt-10 flex justify-center">
          <Radio.Group
            value={feeType}
            size="large"
            onChange={handleFeeTypeChange}
          >
            <Radio.Button value="0">Free</Radio.Button>
            <Radio.Button value="1">Paid</Radio.Button>
            <Radio.Button value="2">Time Capsule</Radio.Button>
          </Radio.Group>
        </div>
        {/* 图片、视频 */}
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          style={{ minHeight: 400 }}
          items={tabsGroup.map((g) => ({
            key: g.key,
            label: g.label,
            children: (
              <>
                {!isExpired && <CountdownTab groupInfo={currentGroup} />}
                {noPass && isExpired && <LockedOverlay data={currentGroup} onSuccess={handlePassSuccess}/>}
                <ImageCardGrid
                  data={fileList}
                  loading={listLoading}
                  onView={handleView}
                />
              </>
            ),
          }))}
        />
      </div>
    </div>
  );
}
