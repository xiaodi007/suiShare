import React, { useState } from "react";
import { Empty, Modal, Spin } from "antd";
import WalrusMedia from "../../../../components/WalrusMedia";

// 图片列表组件
const ImageCardGrid = ({ data, loading, onView }) => {

  const handleView = (item) => {
    if(item?.type === 'video' || item?.type === 'md') {
      onView(item);
    }
  };

  return (
    <div>
      <Spin spinning={loading}>
        {data?.length ? (
          <div className="min-h-48 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {data?.map((item, index) => (
              <div
                key={index}
                className="rounded-xl shadow-md overflow-hidden bg-white cursor-pointer hover:shadow-lg transition"
                onClick={() => handleView(item)}
              >
                {
                   item?.fileName === 'document.md' 
                   ? <img src="/assets/images/message.png" className="w-full h-[140px]" />
                   : <WalrusMedia
                   blobId={item?.thumbnailBlobId || item?.decryptedUrl || item?.blobId}
                   preview={item?.type === 'image'}
                   type={item?.type}
                   width={"100%"}
                   height={140}
                 />
                }
                
                <div className="p-3 text-center text-gray-800 text-sm">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </Spin>
     
    </div>
  );
};

export default ImageCardGrid;
