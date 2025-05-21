import React, { useState, useEffect } from "react";
import { Button, Modal, Dropdown, Menu, Avatar, message } from "antd";
import { useAccounts, useCurrentAccount, useCurrentWallet, useDisconnectWallet, useSwitchAccount } from "@mysten/dapp-kit";  // 用于获取连接的所有账户
import ConnectWalletButton from "../ConnectWalletButton";
import { CheckOutlined, CopyOutlined, Loading3QuartersOutlined, UserOutlined } from "@ant-design/icons";

const Wallet = () => {
    const accounts = useAccounts();
    const currentAccount: any = useCurrentAccount();
    const { isConnecting } = useCurrentWallet();
    const { mutate: disconnect } = useDisconnectWallet();
    const { mutate: selectAccount } = useSwitchAccount();

    const currentAccountAdress = currentAccount?.address;

    // 处理断开连接
    const handleDisconnect = () => {
        // setCurrentAccount(null);
        disconnect();
        message.success("Disconnected successfully!");
    };

    // 处理切换账户
    const handleSwitchAccount = (account) => {
        if (!(currentAccountAdress === account?.address)) {
            selectAccount({ account });
        }
    };

    // 浏览器打开
    const handleViewExplorer = () => {
        window.open(`https://suiscan.xyz/mainnet/account/${currentAccountAdress}`);
    };

    // 处理复制地址
    const handleCopy = (address) => {
        navigator.clipboard.writeText(address).then(() => {
            message.success("Address copied to clipboard!");
        });
    };

    // 格式化地址（如果长度超过20，省略中间部分）
    const formatAddress = (address) => {
        if (address.length > 20) {
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        }
        return address;
    };

    // 创建菜单，包含所有账号和断开连接选项
    const menu = (
        <Menu>
            {/* 渲染所有连接的账户 */}
            {
                accounts.map((account, index) => {
                    const { label, address } = account || {};
                    const isCurrentAccount = currentAccountAdress === address; // 当前账户的标识
                    return (
                        <Menu.Item key={index} style={{ display: "flex", alignItems: "center" }}>
                            {/* 显示当前账户前的打勾图标 */}
                            <div className="flex" onClick={() => handleSwitchAccount(account)}>
                                <div className=" w-6 h-6 mr-2 pr-[2px] flex justify-end align-middle rounded-full border bg-[#cde2e6]">
                                    <UserOutlined style={{ margin: 0 }} />
                                </div>
                                {formatAddress(label || address)}
                            <CopyOutlined onClick={() => handleCopy(address)} style={{ marginLeft: 10, cursor: "pointer" }} />
                            {isCurrentAccount && <CheckOutlined style={{ marginLeft: 10, color: "#52c41a" }} />}
                            </div>
                        </Menu.Item>
                    );
                })
            }
            {/* 断开连接 */}
            <Menu.Divider />
            <Menu.Item key="view" onClick={handleViewExplorer}>
                <div className="w-full text-center">
                    View In Explorer
                </div>
            </Menu.Item>
            {/* 断开连接 */}
            <Menu.Divider />
            <Menu.Item key="disconnect" onClick={handleDisconnect}>
                <div className="w-full text-center">

                    Disconnect
                </div>
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="">
            {/* 如果已经连接，显示头像按钮 */}
            {
                isConnecting ? (
                    <Loading3QuartersOutlined />
                ) :
                    currentAccount ? (
                        <Dropdown overlay={menu} trigger={["click"]}>
                            <div className=" w-12 h-12 mr-2 pr-[8px] flex justify-end align-middle rounded border bg-[#cde2e6]">
                                <UserOutlined style={{ fontSize: 24 }} />
                            </div>
                        </Dropdown>
                    ) : (
                        <ConnectWalletButton />
                    )}


        </div>
    );
};

export default Wallet;
