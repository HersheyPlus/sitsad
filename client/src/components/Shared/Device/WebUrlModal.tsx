import React from 'react';
import { Modal } from 'antd';

interface IProps {
    webUrl: string | undefined;
    isVisible: boolean;
    onClose: () => void;
}

const WebUrlModal: React.FC<IProps> = ({ webUrl, isVisible, onClose }) => {
    if (!webUrl) return null

    return (
        <Modal
            visible={isVisible}
            title="Camera Preview"
            onCancel={onClose}
            footer={null}
            width="70%"
        >
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                    src={webUrl}
                    title="Embedded Web"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                />
            </div>
        </Modal>
    );
};

export default WebUrlModal;
