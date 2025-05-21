import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { LockFilled, LockTwoTone } from "@ant-design/icons";
import { getTotalCoinsByType } from "../../../../utils/utils";
import { createPassPtb, updateProfilePtb } from "../../../../web3/ptb";

import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

export default function LockedOverlay({ data, onSuccess }) {
  const [feeList, setFeeList] = useState([]);

  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  const [modal, contextHolder] = Modal.useModal();


  useEffect(() => {
    console.log(data); 
    computedFee(data);
  }, [data]);

  const computedFee = (data) => {
    const { monthly, lifeTime } = data || {};
    const oneMonthly = getTotalCoinsByType(0, monthly);
    const quarterly = getTotalCoinsByType(1, monthly);
    const annual = getTotalCoinsByType(2, monthly);

    const result = [
      {
        policy: 0,
        months: 1,
        fee: oneMonthly?.fee,
        actualCoins: oneMonthly?.actualCoins,
      },
      {
        policy: 1,
        months: 3,
        fee: quarterly?.fee,
        actualCoins: quarterly?.actualCoins,
      },
      {
        policy: 2,
        months: 12,
        fee: annual?.fee,
        actualCoins: annual?.actualCoins,
      },
    ];
    if (lifeTime) {
      result.push({
        policy: 3,
        fee: Number(lifeTime) / 10 ** 9,
        actualCoins: Number(lifeTime),
      });
    }
    console.log('computedFee: ', result);
    
    setFeeList(result);
  };

  const handleSelected = async (item) => {
    const { policy, actualCoins } = item
    const tx = await createPassPtb(actualCoins, policy, data?.groupId, account?.address)
    
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async (txRes) => {
          modal.success({
            title: "Info",
            content: 'Successful purchase of membership',
            onOk() {
              onSuccess?.();
            }
          })
        },
      },
      {
        onError: (error) => {
          console.log(error);
        },
      }
    );
    
  }
  return (
    <div className="absolute inset-0 z-10 bottom-0 pt-[160px] flex flex-col items-center justify-center backdrop-blur-md bg-white/50">
      <div className="flex flex-col items-center gap-4 p-6  max-w-sm w-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-3xl">
            <LockFilled />
          </div>
          <div className="mt-3 text-xl font-semibold text-primary">Locked</div>
          <div className=" text-gray-500">You Don’t Have Permission</div>
        </div>
        <div className="w-full flex flex-col gap-3 text-sm">
          {feeList?.map((item) => {
            if (item?.policy === 3) {
              return (
                <button onClick={() => handleSelected(item)} className="bg-primary hover:bg-blue-600 text-white rounded-full py-3 px-4 w-full">
                  &nbsp; &nbsp; &nbsp; LifeTime &nbsp; | &nbsp; {item?.fee} SUI
                </button>
              );
            }
            return (
              <button onClick={() => handleSelected(item)} className="bg-primary hover:bg-blue-600 text-white rounded-full py-3 px-4 w-full">
                {item?.months} MONTHS &nbsp; | &nbsp; {item?.fee} SUI
              </button>
            );
          })}
        </div>
      </div>
      {/* `contextHolder` should always be placed under the context you want to access */}
      {contextHolder}
    </div>
  );
}
