import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import homePage from "../../../public/assets/home_1.png";

const Splash = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen px-[3vw] py-[4vh] bg-white overflow-auto">
      <div className="mb-10 flex justify-between">
        <div className="text-[2vw] font-bold">Maris</div>
        <div
          className="btn btn-primary"
          onClick={() => navigate("/app/token-manager/create-token")}
        >
          Launch App
        </div>
      </div>
      <div className="mb-[5vh] flex justify-between items-center">
        <div className="mt-10 w-1/2">
          <div className="mb-[2vh] text-[2.6vw] font-bold">
            Your all-in-one tool for seamless token management on Sui.
          </div>
          <div className="mb-[3vh] text-gray-700  text-[1.2vw]">
            Maris simplifies and secures your token operations on Sui.
            Effortlessly create, vest, lock, and track tokens tailored for your
            business.
          </div>
          <div
            className="btn btn-primary"
            onClick={() => navigate("/app/token-manager/create-token")}
          >
            Launch App
          </div>
        </div>
        <div>
          <img className="w-[20vw] mr-10" src={homePage} alt="homePage" />
        </div>
      </div>
      <div className="mb-6 text-center text-[1.6vw] font-bold">
        Secure and automate your token operations
      </div>
      <Row gutter={20} style={{ display: "flex", alignItems: "stretch" }}>
        <Col className="gutter-row" span={8}>
          <div className="h-full bg-[#f0f0f0] p-[2vw] rounded-md">
            <div className="mb-4 text-[1.4vw] font-bold">Token creation</div>
            <div className="text-[1.2vw]">
              Launch and customize your token with features like burn, mint, and
              regulation options.
            </div>
          </div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div className="h-full bg-[#f0f0f0] p-[2vw] rounded-md">
            <div className="mb-4 text-[1.4vw] font-bold">Token locks</div>
            <div className="text-[1.2vw]">
              Secure community and investor confidence with Maris by creating
              immediate liquidity locks for your tokens.
            </div>
          </div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div className="h-full bg-[#f0f0f0] p-[2vw] rounded-md">
            <div className="mb-4 text-[1.4vw] font-bold">Token vesting</div>
            <div className="text-[1.2vw]">
              Set up reliable vesting schedules for investors and employees,
              ensuring they receive the right tokens at the right time, every
              time.
            </div>
          </div>
        </Col>
        <Col className="gutter-row" span={6}>
          <div className="h-full bg-[#f0f0f0] p-[2vw] rounded-md">
            <div className="mb-4 text-[1.4vw] font-bold">Multisender</div>
            <div className="text-[1.2vw]">
              Simplify token distribution for payroll, service payments, and
              airdrops—all in one go with the Maris Multisender.
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Splash;
