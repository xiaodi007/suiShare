import { Row, Col, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";

import barImage from "../../../../public/assets/images/bar.png";
import circlebarImage from "../../../../public/assets/images/circleBar.png";

const Content = () => {
  const navigate = useNavigate();

  const handleSearch = (value) => {
    if(!value) return
    navigate(`/detail?address=${value}`)
  }
  return (
    <div className="mt-10 z-10 relative">
      <div className="mb-[5vh]">
        {/* 标题 */}
        <div className="w-[60%] m-auto mb-20 text-center">
          <div className="mb-[2vh] text-[4vw] font-bold">
            {/* Create Freely, Share Securely On Sui. */}
            Create Freely. Share Securely. Earn on Your Terms.
          </div>
          <div className="mb-[3vh] text-gray-700  text-[1.2vw] mx-auto">
            {/* No middlemen. No limits. Publish rich media with full ownership,
gated access, and privacy <br /> all powered by <b>Sui</b> & <b>Walrus</b>. */}

      Share images, videos, or Markdown — encrypted and truly yours.<br />
      Control who views, how long, and at what price.<br />
      No middlemen. Just you, your content, and the power of Sui.<br />
      <em>Built with Seal encryption and Walrus storage.</em>
 

          </div>
        </div>
        {/* 搜索 */}
        <div className="w-[60%] m-auto">
          <Input.Search placeholder="Search by address" size="large" onSearch={handleSearch}/>
        </div>
      </div>
      {/* 内容介绍 */}
      <div className="w-[80%] m-auto">
        <div className="mb-6 text-[1.6vw] font-bold">What We Do</div>
        <Row gutter={20} style={{ display: "flex", alignItems: "stretch" }}>
          <Col className="gutter-row" span={8}>
            <div className="h-full bg-white p-[2vw] rounded-md">
              <div className="mb-4 text-[1.4vw] font-bold">
                🔗 On-Chain Ownership
              </div>
              <div className="text-[1.1vw] text-zinc-600  leading-relaxed">
        {/* <p>Your profile and posts live immutably on <strong>Sui</strong>.<br />
        You create it. You own it. No platform control.</p> */}
        Your profile and posts are stored immutably on <strong>Sui</strong><br />
        No centralized control, no hidden edits.<br />
        You own your content. Always.
              </div>
            </div>
          </Col>
          <Col className="gutter-row" span={8}>
            <div className="h-full bg-white p-[2vw] rounded-md">
              <div className="mb-4 text-[1.4vw] font-bold">
                🔐 Encrypted Access Control
              </div>
              <div className="text-[1.1vw] text-zinc-600 leading-relaxed">
        Content is encrypted with <strong>Seal</strong>, and only approved users can unlock it.<br />
        Set rules for public, paid, or timed access.<br />
        Your privacy, your terms.
              </div>
            </div>
          </Col>
          <Col className="gutter-row" span={8}>
            <div className="h-full bg-white p-[2vw] rounded-md">
              <div className="mb-4 text-[1.4vw] font-bold">
                🐘Decentralized Storage
              </div>
              <div className="text-[1.1vw] text-zinc-600 leading-relaxed">
        Media is stored through <strong>Walrus</strong>, with no centralized dependency.<br />
        Always online, censorship-resistant, and globally accessible.<br />
        Built to last — just like your content.
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <div className="w-full h-[500px] relative bg-[#F5F8FF]">
        {/* 图片 */}
        <img
          className=" absolute bottom-0 left-0 z-0 w-[20%] mix-blend-color-burn"
          src={circlebarImage}
          alt="homePage"
        />
        <img
          className=" absolute bottom-0 right-0 z-0 w-[40%] mix-blend-color-burn"
          src={barImage}
          alt="homePage"
        />
      </div>
    </div>
  );
};

export default Content;
