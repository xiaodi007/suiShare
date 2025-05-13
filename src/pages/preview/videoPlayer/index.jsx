import React, { useState, useEffect } from "react";
import { Routes, useSearchParams, useNavigate, useLocation } from "react-router-dom";

import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { SealClient, SessionKey, getAllowlistedKeyServers } from "@mysten/seal";

import { getUserPass } from "../../../web3/query"; 
import { downloadAndDecrypt } from '../../../web3/downloadAndDecrypt';
import WalrusMedia from "../../../components/WalrusMedia";

export default function VideoPlayer() {
  const [pageData, setPageData] = useState({});
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const objectId = searchParams.get("objectId");
  const suiClient = useSuiClient();
    const client = new SealClient({
      suiClient,
      serverObjectIds: getAllowlistedKeyServers("testnet"),
      verifyKeyServers: false,
    });

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
 
  const account = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if(!account?.address) return

    const data = JSON.parse(localStorage.getItem("viewFile"));

    // 加密分组
    if (data?.currentGroup?.group_type === 1) {
      loadVideo(data);
    } else {
      setPageData(data)
    }
  }, [account?.address, objectId, location.pathname]);

  const loadVideo = async (data) => {
    let { currentGroup, videoInfo, ...reset } = data;

    const { groupId } = currentGroup;
    const userPass = await getUserPass(groupId, account?.address, suiClient);
    console.log("getUserPass: ", userPass);

    if (!userPass) {
      return;
    }

    const res = await downloadAndDecrypt([videoInfo], suiClient, client, {
      groupId,
      passId: userPass?.id,
    }, account?.address, signPersonalMessage);

    setPageData({...data, videoInfo: res?.[0]});
  };

   // 预览
   const handleNavigate = (row) => {
    localStorage.setItem(
      "viewFile",
      JSON.stringify({  ...pageData, videoInfo: row})
    );
    if (row.type === "video") {
      navigate(`/preview/video?objectId=${row.blobId}&type=${row.type}`);
    } else {
      navigate(`/preview/md?objectId=${row.blobId}&type=${row.type}`);
    }
  };

  return (
    <div className="flex h-screen px-20 bg-white relative">
      {/* 左侧内容区域 */}
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        {/* 标题和描述 */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">
            {pageData?.videoInfo?.title}
          </h1>

          <p className="text-gray-600 text-sm mt-1">
            {pageData?.videoInfo?.createDate} · Reproduction without the
            author's authorization is prohibited!
          </p>
        </div>

        {/* 视频播放 */}
        <div className="bg-black rounded-md overflow-hidden mb-6">
          {/* <video
            controls
            className="w-full h-[480px] bg-black"
            poster={currentVideo.cover}
          >
            <source src="/videos/main.mp4" type="video/mp4" />
            您的浏览器不支持视频播放。
          </video> */}
          <WalrusMedia
            blobId={pageData?.videoInfo?.decryptedUrl || pageData?.videoInfo?.blobId}
            type="video"
            width={"100%"}
            height={480}
            isRound
          />
        </div>
        <p className="text-gray-800 mt-1">
          {pageData?.videoInfo?.description }
        </p>
      </div>

      {/* 右侧用户与视频列表 */}
      <div className="w-96 bg-white border-l p-4 flex flex-col">
        <div className="mb-4 flex justify-center items-center">
          {/* 头像 */}
          <div className="w-[60px] h-[60px] flex justify-center items-center flex-shrink-0 bg-white rounded-full">
            <WalrusMedia
              blobId={pageData?.userProfile?.avatarUrl}
              width={60}
              height={60}
              isRound
            />
          </div>
          {/* 描述 */}
          <div className="pl-2">
            <h2 className="mb-1 text-xl ">{pageData?.userProfile?.name}</h2>
            <span className="w-[150px] inline-block px-5 text-sm text-primary bg-[#F5F8FF] rounded-full overflow-hidden text-ellipsis">
              {pageData?.userProfile?.userAddress || "--"}
            </span>
            <div
              className="mb-1 text-gray-500 line-clamp-2"
              style={{ wordBreak: "break-all" }}
            >
              {pageData?.userProfile?.describeYourself || "--"}
            </div>
          </div>
        </div>

        {/* 视频列表 */}
        <div className="flex-1 overflow-auto">
          <h2 className="text-lg font-bold mb-3">
            Group | {pageData?.currentGroup?.groupName}
          </h2>
          <ul className="space-y-4">
            {pageData?.fileList?.map((record, index) => (
              <li
                key={index}
                className={`flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded ${
                  record?.blobId === pageData?.videoInfo?.blobId ? 'border border-[#ccc]' : ''
                }`}
                onClick={() => handleNavigate(record)}
              >
                {record?.fileName === "document.md" ? (
                    <img
                      src="/assets/images/message.png"
                      className="w-[100px] h-[80px]"
                    />
                  ) : (
                    <WalrusMedia
                      blobId={record?.thumbnailBlobId}
                      width={100}
                      height={80}
                      preview={record?.type === 'image'}
                    />
                  )}
                <div className="flex flex-col text-sm">
                  <div className="mb-2 text-xl line-clamp-1">
                    {record.title}
                  </div>
                  <div className="mb-2 text-gray-500 line-clamp-2">
                    {record.description}
                  </div>
                  <div className="text-gray-500">{record.createDate}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
