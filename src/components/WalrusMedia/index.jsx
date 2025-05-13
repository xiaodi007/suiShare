import { Image } from "antd";
import React, { useEffect, useState } from "react";

import { AGGREGATOR_URL } from '../../config/constants';
const WalrusMedia = ({
  blobId,
  type,
  width = 120,
  height = 80,
  preview = true,
  isRound = false,
}) => {
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mime, setMime] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      const isDefault =
        blobId?.indexOf("/assets") > -1 || blobId?.indexOf("blob") > -1;
      const fileUrl = `${AGGREGATOR_URL}/v1/blobs/${blobId}`;

      if (isDefault) {
        console.log("dd: ", blobId);
        setMediaUrl(blobId);
      } else {
        try {
          const res = await fetch(fileUrl);
          const contentType = res.headers.get("Content-Type") || "";
          const blob = await res.blob();

          setMime(contentType); // 保存 MIME 类型
          const url = URL.createObjectURL(blob);
          setMediaUrl(url);
        } catch (err) {
          console.error("媒体加载失败:", err);
        }
      }
    };

    if (blobId) {
      fetchMedia();
    }
  }, [blobId]);

  // 最终类型判断优先级：用户传入 > MIME
  const finalType = type || (mime?.startsWith("video/") ? "video" : "image");


  return (
    <div className="relative">
      {!mediaUrl && (
        <div
          className="text-center text-gray-400 text-sm"
          style={{ width, height: 80 }}
        >
          loading...
        </div>
      )}

      {mediaUrl && finalType === "image" && (
        <Image
          src={mediaUrl}
          alt="media"
          width={width}
          height={height}
          style={{ borderRadius: isRound ? "50%" : null }}
          preview={preview}
        />
      )}

      {mediaUrl && finalType === "video" && (
        <video src={mediaUrl} controls style={{ width, height }} />
      )}
    </div>
  );
};

export default WalrusMedia;
