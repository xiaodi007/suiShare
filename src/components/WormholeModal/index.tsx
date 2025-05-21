// ModalWithTable.js
import React from 'react';
import { Modal, Table, Button } from 'antd';
import WormholeConnect from '@wormhole-foundation/wormhole-connect';


const WormholeModal = ({ visible, onClose, data, onSelect }) => {
    return (
        <Modal
            title=""
            open={visible}
            onCancel={onClose}
            footer={[]}
        >
            <div className='bg-black'>
                <WormholeConnect />

            </div>
        </Modal>
    );
};

export default WormholeModal;
