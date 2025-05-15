import React, { useState } from "react";
import { Layout, Menu, theme, Popover, Select, Space } from "antd";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import SelectedLange from "../../components/SelectedLange";
import maskImage from "../../../public/assets/images/mask.png";

import "./index.less";

import Wallet from "../../components/Wallet";
import ContentPage from "./components/content";
import DetailPage from "../detail";
import MePage from '../me'
import VideoPlayerPage from "../preview/videoPlayer";
import MarkdownViewPage from "../preview/markdown";

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openWormhole, setOpenWormhole] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the current path selected in the menu
  const isMe = location.pathname === '/me';
  

  return (
      <div className="relative bg-[#F5F8FF] h-[100vh] overflow-auto ">
          <div className="relative px-10 py-4 pb-6 flex justify-between items-center z-10">
            <div className="text-primary text-3xl font-bold">SuiShare</div>
            <div className="flex items-center">
              <div className="h-[40px] flex items-center px-8  bg-[#FAEAF6] rounded-full">
              <span className={`px-4 cursor-pointer ${isMe ? 'text-gray-500' : 'font-semibold' }`} onClick={() => navigate('/')}>Home</span>
              <span className={`px-4 cursor-pointer ${isMe ? 'font-semibold' : 'text-gray-500'}`} onClick={() => navigate('/me')}>MyPage</span>
              </div>
            </div>
            {/* <SelectedLange style={{ marginRight: "10px" }} /> */}
            <Wallet />
          </div>
          <img className="w-[60vw] mr-10 absolute top-0 right-[15%] z-0" src={maskImage} alt="homePage" />
          {/* Only Content area changes based on route */}
          <Routes>
            <Route path="/" element={<ContentPage />} />
            <Route path="/detail" element={<DetailPage />} />
            <Route path="/me" element={<MePage />} />
            <Route path="/preview/video" element={<VideoPlayerPage />} />
            <Route path="/preview/md" element={<MarkdownViewPage />} />
          </Routes>
       
      </div>
  );
};

export default App;
