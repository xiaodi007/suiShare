import React, { useEffect } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { createProfilePtb, updateProfilePtb } from "../../web3/ptb";
import { getUserProfile } from "../../web3/query";
import WalrusUpload from "../../web3/WalrusUpload";
import FileUploader from "../../components/FileUploader";

// import "./App.css";

function App() {
  const [profile, setProfile] = React.useState("");
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const account = useCurrentAccount();

  useEffect(() => {
    if (account?.address) {
      console.log(account.address);

      queryUserProfile();
    }
  }, [account]);
  // 创建 profile
  const handleCreateProfile = async () => {
    const data = [
      "http://minio.kmzydata.cn/api/v1/buckets/common/objects/download?preview=true&prefix=crown.jpg",
      "http://minio.kmzydata.cn/api/v1/buckets/common/objects/download?preview=true&prefix=back5.png",
      "FinaticImp",
      "World is never you know, it is always you make ???",
      "https://www.baidu.com",
      "https://twitter.com",
      "https://t.me/finaticimp",
      "https://www.facebook.com",
    ];
    // 创建
    // const tx = await createProfilePtb(data, account.address);
    // 编辑
    const tx = await updateProfilePtb(
      data,
      "0xcd6a10d01c8eb8e1dadbe7d747d016c6aa45425c1f2692758f7bbd551ae68174"
    );
    signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: async (txRes) => {
          console.log(txRes);
        },
      },
      {
        onError: (error) => {
          console.log(error);
        },
      }
    );
  };

  const queryUserProfile = async () => {
    const data = await getUserProfile(account.address, client);
    console.log(data);
  };
  function ConnectedAccount() {
    if (!account) {
      return null;
    }

    return (
      <div>
        <div>Connected to {account.address}</div>;
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <ConnectButton />
      </div>
      <ConnectedAccount />
      {/* <span
        className="px-8 py-2 bg-primary text-white text-2xl"
        onClick={handleCreateProfile}
      >
        Create Profile
      </span> */}

      <FileUploader
        mode="drop"
        data={{
          groupId:
            "0xa008ec133453a4d248c369836ee7ed71ad1cba9b80736ed3fcbd730ce8120d0a",
          capId: "0x321d07b504881277b24bb000a4584dacfb9d58240b5f74e3b69488f62c5b318a",
        }}
      />

      {/* <Counter id={'0x9fbfa0d3d09bd3d4da36e446a5fd5113b57e00aa8f3bf4613b591997e963e11f'} />
      <CreateCounter
        onCreated={(id) => {
          window.location.hash = id;
        }}
      /> */}
    </>
  );
}

export default App;
