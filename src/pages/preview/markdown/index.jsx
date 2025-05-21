import React, { useState, useEffect } from "react";
import { Routes, useSearchParams , useNavigate, useLocation } from "react-router-dom";

import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { SealClient, SessionKey, getAllowlistedKeyServers } from "@mysten/seal";

import { getUserPass } from "../../../web3/query";
import { downloadAndDecrypt } from "../../../web3/downloadAndDecrypt";
import WalrusMedia from "../../../components/WalrusMedia";
import { getSessionKey } from "../../../lib/sessionKeyStore";
import MarkdownIt from "markdown-it";
import { Spin } from "antd";

import { AGGREGATOR_URL } from '../../../config/constants';

export default function MarkdownView() {
  const [pageData, setPageData] = useState({});
  const [markdownText, setMarkdownText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const objectId = searchParams.get("objectId");
  
  const navigate = useNavigate();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();

  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });

  const mdParser = new MarkdownIt();

  useEffect(() => {
    if (!account?.address) return;
    
    const data = JSON.parse(localStorage.getItem("viewFile"));
    setPageData(data);

    // 付费分组
    if (data?.currentGroup?.group_type === 1) {
      loadEncryptFile(data);
    } else {
      fetchMarkdown(data);
    }
  }, [account?.address, objectId, location.pathname]);

  const fetchMarkdown = async (data) => {
    const fileUrl = `${AGGREGATOR_URL}/v1/blobs/${data?.videoInfo?.blobId}`;
    setLoading(true);
    try {
      fetch(fileUrl)
        .then((res) => res.text())
        .then((text) => {
          setLoading(false);
          setMarkdownText(text); // setText 是你 useState 里的 setter
        });
    } catch (err) {
      setLoading(false);
      console.error("媒体加载失败:", err);
    }
  };

  const loadEncryptFile = async (data) => {
    let { currentGroup, videoInfo, ...reset } = data;

    const { groupId } = currentGroup;
    setLoading(true);
    try {
      const userPass = await getUserPass(groupId, account?.address, suiClient);
      console.log("getUserPass: ", userPass);

      if (!userPass) {
        return;
      }

      const res = await downloadAndDecrypt([videoInfo], suiClient, client, {
        groupId,
        passId: userPass?.id,
      }, account?.address, signPersonalMessage);

      console.log("res: ", res);
      
      setMarkdownText(res?.[0]?.text); // setText 是你 useState 里的 setter
      setLoading(false);
    } catch (error) {
      console.log("error: ", error);
      
      setLoading(false);
    } finally {
    }
  };

  // 预览
  const handleNavigate = (row) => {
    if(row?.blobId === pageData?.videoInfo?.blobId) return
    
    localStorage.setItem(
      "viewFile",
      JSON.stringify({ ...pageData, videoInfo: row })
    );
    if (row.type === "video") {
      navigate(`/preview/video?objectId=${row.blobId}&type=${row.type}`);
    } else {
      navigate(`/preview/md?objectId=${row.blobId}&type=${row.type}`);
    }
  };


  return (
      <div className="flex min-h-screen px-20 pb-20 bg-white relative">
        {/* 左侧内容区域 */}
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          {/* 标题和描述 */}
          <div className="mb-4 pb-4 border-b">
            <h1 className="mb-2 text-3xl font-bold">
              {pageData?.videoInfo?.title}
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              {pageData?.videoInfo?.createDate} · Reproduction without the
              author's authorization is prohibited!
            </p>
          </div>

          <Spin spinning={loading}>

          <div
            className="prose h-full w-full border mt-4 m-auto p-4"
            style={{ maxWidth: 1000 }}
            dangerouslySetInnerHTML={{
              __html: mdParser.render(markdownText || ""),
            }}
          />
          </Spin>
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
                      {record.description || "--"}
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
