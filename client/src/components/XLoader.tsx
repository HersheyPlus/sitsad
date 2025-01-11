import useLoaderStore from '@/stores/loader.store';
import { Spin } from 'antd';

const XLoader = () => {
    const isLoading = useLoaderStore(state => state.loading);

    if (!isLoading) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
            }}
        >
            <Spin size="large" tip="Loading" />
        </div>
    );
};

export default XLoader;
