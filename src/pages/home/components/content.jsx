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
            Decentralize Your Voice, Own Your Journey
          </div>
          <div className="mb-[3vh] text-gray-700  text-[1.2vw]">
            suiShare empowers creators to share multimedia content, build loyal
            communities, and monetize seamlessly through Key access passes—all
            powered by Web3 ownership and privacy on the Walrus
          </div>
        </div>
        {/* 搜索 */}
        <div className="w-[60%] m-auto">
          <Input.Search placeholder="Search by address" size="large" onSearch={handleSearch}/>
        </div>
      </div>
      {/* 内容介绍 */}
      <div className="w-[80%] m-auto">
        <div className="mb-6 text-[1.6vw] font-bold">What We do</div>
        <Row gutter={20} style={{ display: "flex", alignItems: "stretch" }}>
          <Col className="gutter-row" span={8}>
            <div className="h-full bg-white p-[2vw] rounded-md">
              <div className="mb-4 text-[1.4vw] font-bold">
                True Ownership, Zero Middlemen
              </div>
              <div className="text-[1.2vw] text-zinc-500">
                Your Content, Your Rules ,Store profiles, posts, and social
                links permanently on-chain. Control access with customizable NFT
                passes and earn directly from supporters.
              </div>
            </div>
          </Col>
          <Col className="gutter-row" span={8}>
            <div className="h-full bg-white p-[2vw] rounded-md">
              <div className="mb-4 text-[1.4vw] font-bold">
                Key Access, Deeper Connections
              </div>
              <div className="text-[1.2vw] text-zinc-500">
                From concept to launch, we create stunning, user-centric
                websites that elevate your brand and engage your audience.
              </div>
            </div>
          </Col>
          <Col className="gutter-row" span={8}>
            <div className="h-full bg-white p-[2vw] rounded-md">
              <div className="mb-4 text-[1.4vw] font-bold">
                Built-In Privacy
              </div>
              <div className="text-[1.2vw] text-zinc-500">
                All uploaded files are encrypted and stored based on
                Walrus. Access your data anytime, anywhere
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
