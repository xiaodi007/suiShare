import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "antd";
import React from "react";
import { useState } from "react";

const ConnectWalletButton = () => {
    const [open, setOpen] = useState(false);
    const currentAccount = useCurrentAccount();
  
    return (
      <ConnectModal
        trigger={
          <Button
            variant="filled"
            size="large"
            type="primary"
            disabled={!!currentAccount}
            onClick={() => setOpen(true)}
          >
            Connect Wallet
          </Button>
        }
        open={open}
        onOpenChange={(isOpen) => setOpen(isOpen)}
      />
    );
  };
  
  export default ConnectWalletButton;
  