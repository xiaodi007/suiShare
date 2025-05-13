import { EditOutlined, FacebookFilled, IeCircleFilled, PaperClipOutlined, TwitterCircleFilled } from "@ant-design/icons";
import React, { useEffect } from "react";
import WalrusMedia from "../../../../components/WalrusMedia";
import { Image, Space, Tooltip } from "antd";

const UserProfile = ({ user, onCreate, onEdit }) => {
  let isEmpty = !user;
  // useEffect(() => {
  //   console.log("user", user);
  //   isEmpty = !user;
  // }, [user]);
  
  const handleNavigate = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };
  
  return (
    <div className="w-[80%] m-auto pb-20 relative flex">
      {/* 头像区域 */}
      <div className="w-[140px] h-[140px] flex justify-center items-center flex-shrink-0 bg-white rounded-full overflow-hidden">
        {isEmpty ? (
          <img
            src="/assets/images/person.svg"
            alt="avatar"
            className="w-[80px] h-[80px]"
          />
        ) : (
          <WalrusMedia blobId={user?.avatarUrl} width={90} height={90} isRound/>
        )}
      </div>

      {/* 右侧内容 */}
      <div className="flex-1 pl-6 flex flex-col justify-center">
        {isEmpty ? (
          // 没有用户信息，展示按钮
          <button
            onClick={onCreate}
            className="px-6 py-2 text-white bg-primary hover:bg-blue-700 rounded-full w-fit"
          >
            Create MyPage
          </button>
        ) : (
          // 有用户信息，展示资料
          <>
            <h2 className="mb-4 text-2xl text-white">{user?.name}</h2>
            <div className="w-[150px] mb-4 inline-block px-5 py-1 text-sm text-primary bg-[#F5F8FF] rounded-full overflow-hidden text-ellipsis">
              {user?.userAddress}
            </div>
            <div className="mb-4 text-white text-xl">{user?.describeYourself || '--'}</div>
            <Space>
              <Tooltip title={`Website: ${user?.website}`}>
                <IeCircleFilled onClick={() => handleNavigate(user?.website)} style={{ color: '#fff', fontSize: 20 }}/>
              </Tooltip>
              <Tooltip title={`Twitter: ${user?.twitter}`}>
                <TwitterCircleFilled onClick={() => handleNavigate(user?.twitter)} style={{ color: '#fff', fontSize: 20 }}/>
              </Tooltip>
              <Tooltip title={`Facebook: ${user?.facebook}`}>
                <FacebookFilled onClick={() => handleNavigate(user?.facebook)}  style={{ color: '#fff', fontSize: 20 }} />
              </Tooltip>
              <Tooltip title={`Telegram: ${user?.telegram}`}>
                <img src="/assets/images/telegram.png" onClick={() => handleNavigate(user?.telegram)} width={30} height={30} />
              </Tooltip>
            </Space>
          </>
        )}
      </div>
      {/* 编辑信息 */}
      {!isEmpty && (
        <div className="absolute top-[-20px] right-0 flex">
            <div className="mr-4 px-4 py-2  flex items-center gap-4 bg-[#f5f8ffe0] rounded-full cursor-pointer" onClick={onEdit}>
              <EditOutlined style={{ color: '#666'}}/>
              <span className="text-black/70">Edit Profile</span>  
            </div>          
            <div className="px-4 py-2  flex items-center gap-4 bg-[#f5f8ffe0] rounded-full cursor-pointer" onClick={() => window.open(`https://twitter.com/intent/tweet`, "_blank")}> 
              <PaperClipOutlined style={{ color: '#666'}}/>
              <span className="text-black/70">Share</span>  
            </div>          
          </div>
      )}
    </div>
  );
};

export default UserProfile;
