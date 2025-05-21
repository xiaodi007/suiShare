import React, { useState } from "react";
import { Table, Button, Empty, Tag, Modal, Alert } from "antd";
import WalrusMedia from "../../../../components/WalrusMedia";

const GROUP_TYPE = {
  0: "Free",
  1: "Paid",
  2: "Time capsule",
};


const MediaList = ({ groupInfo, data = [], loading, onUpload, onPostMessage, onDeleteFile, onView, onEditGroup }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  // if (!data?.length) {
  //   return (
  //     <div className="w-full flex flex-col items-center justify-center py-24">
  //       <Empty description="" />
  //       <button
  //         onClick={onUpload}
  //         className="mt-4 px-6 py-2 text-white bg-primary hover:bg-blue-700 rounded-full w-fit"
  //       >
  //         Upload
  //       </button>
  //     </div>
  //   );
  // }

  const handleView = (item) => {
    console.log("handleView: ", item);
    
    if(item?.type === 'video' || item?.type === 'md') {
      onView(item);
    }
  };

  const handleDeleteSelected = () => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: `Are you sure to delete ${selectedRowKeys.length} items?`,
      onOk: () => {
        message.success(`Deleted ${selectedRowKeys.length} item(s).`);
        // 这里你可以调用接口或回调删除
        setSelectedRowKeys([]);
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const columns = [
    {
      title: "File",
      dataIndex: "thumbnail",
      width: 300,
      render: (_, record) => (
        <div
          className="flex items-center cursor-pointer relative"
          onClick={() => handleView(record)}
        >
          {/* {record.type === "video" ? (
            <div className="relative w-[100px]">
              <img
                src={'https://www.figma.com/file/H36tj5rex49BMzH9taQBQS/image/96e5218b23e9cc16cd8058b3d40361b727540df9?fuid=1417689993312975755'}
                alt="media"
                className="w-[100px] object-contain rounded"
              />
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[10px] px-1.5 py-[1px] rounded">
                {record.duration || "00:00"}
              </div>
            </div>
          ) : (
            // <img
            //   src={'https://aggregator.walrus-testnet.walrus.space/v1/blobs/3kmtaJzrH04U8arpQjmV8kqW9Wrvfg4fBIS_Rn101pc.png'}
            //   alt="media"
            //   className="w-[100px] h-[80px] object-contain rounded"
            // /> */}
            {
              record?.fileName === 'document.md' 
              ? <img src="/assets/images/message.png" className="w-[120px] h-[80px]" />
              : <WalrusMedia blobId={record?.thumbnailBlobId || record?.decryptedUrl  || record?.blobId} preview={record?.type === 'image'} />
            }
            {/* <WalrusMedia blobId={record?.thumbnailBlobId || record?.decryptedUrl  || record?.blobId}  /> */}
          {/* )} */}
          <div className="flex-shrink-1 ml-4">
            <div className="mb-1 font-medium">{record.title}</div>
            <div className="mb-1 text-md text-gray-500">{record.description}</div>
            {/* <div className="text-xs text-gray-400">
              👁 {record.views} &nbsp; 🕓 {record.time}
            </div> */}
          </div>
        </div>
      ),
    },

    // {
    //   title: "Visibility",
    //   dataIndex: "visibility",
    //   render: (text) => <Tag>{text}</Tag>,
    // },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "CreateDate",
      dataIndex: "createDate",
    },
    {
      title: "Operation",
      render: (_, record) => (
        <div className="flex gap-2">
          {/* <Button size="small" onClick={() => onEdit(record)}>
            Edit
          </Button> */}
          <Button size="small" danger onClick={() => onDeleteFile(record)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <Alert message={
        <div className="flex justify-between">
          <div>Current group is <span className="text-primary">{GROUP_TYPE[groupInfo?.group_type]}</span></div>
          <span className="text-gray-500 cursor-pointer" onClick={onEditGroup}>More ></span>
        </div>
        }/>
      {/* 顶部操作栏 */}
      <div className="flex justify-end my-4">
        {/* <Button
          disabled={selectedRowKeys.length === 0}
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </Button> */}
        <Button type="default"  onClick={onPostMessage} className="mr-4">
          Post
        </Button>
        <Button type="default" onClick={onUpload}>
          Upload
        </Button>
      </div>

      {/* 表格 */}
      <Table
        rowKey="id"
        rowSelection={rowSelection}
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />

      {/* 🔍 预览 Modal */}
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        centered
        width="auto"
        bodyStyle={{ padding: 0 }}
      >
        {previewContent?.type === "video" ? (
          <video
            src={previewContent.src}
            controls
            className="max-w-[90vw] max-h-[80vh] mx-auto block"
          />
        ) : (
          <img
            src={previewContent?.src || previewContent?.thumbnail}
            alt="preview"
            className="max-w-[90vw] max-h-[80vh] mx-auto block"
          />
        )}
      </Modal>
    </div>
  );
};

export default MediaList;
