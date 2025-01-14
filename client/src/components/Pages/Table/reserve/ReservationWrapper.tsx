'use client'

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Building2, DoorClosed } from 'lucide-react';
import { IItem } from '@/types/item';
import TableService from '@/services/table.service';
import { useNotificationStore } from '@/stores/notification.store';
import { Card, Input, Button, Form, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import ReservationResult from './ReservationResult';
import NotFoundPage from '@/pages/NotFoundPage';

const { Title, Text } = Typography;

const ReservationWrapper = () => {
    const { tableId } = useParams<{ tableId: string }>();

    const [table, setTable] = useState<IItem | undefined>();
    const [form] = Form.useForm();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [phoneNo, setPhoneNo] = useState('');

    const openNotification = useNotificationStore(state => state.openNotification);

    useEffect(() => {
        if (tableId) {
            doFindTable();
        }
    }, [tableId]);

    const doFindTable = async () => {
        if (!tableId) return;

        try {
            const data = await TableService.findById(tableId);
            setTable(data);
        } catch (error) {
            openNotification({
                message: 'Error',
                description: 'Failed to fetch the table information',
                type: 'error'
            });
        }
    };

    const doSubmit = (values: { phoneNo: string }) => {
        console.log('Submitting reservation for phone number:', values.phoneNo);
        openNotification({
            message: 'Success',
            description: 'Reservation submitted successfully',
            type: 'success'
        });
        form.resetFields();

        setIsSubmitted(true);
    };

    if (!table) {
        return <NotFoundPage />
    }

    if (isSubmitted) {
        return <ReservationResult table={table} phoneNo={phoneNo} success={true} />;
    }

    return (
        <Card style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
            <Title level={4}>Table Reservation</Title>
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Building2 size={16} style={{ marginRight: 8 }} />
                    <Text>{table.location.building.building_name}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <DoorClosed size={16} style={{ marginRight: 8 }} />
                    <Text>{table.location.room.room_name}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {table.available ? (
                        <CheckCircle size={16} style={{ marginRight: 8, color: '#52c41a' }} />
                    ) : (
                        <XCircle size={16} style={{ marginRight: 8, color: '#f5222d' }} />
                    )}
                    <Text>{table.available ? 'Available' : 'Not Available'}</Text>
                </div>
            </div>
            <Form form={form} onFinish={doSubmit} layout="vertical">
                <Form.Item
                    name="phoneNo"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please input your phone number!' }]}
                >
                    <Input placeholder="Enter your phone number" type='number' onChange={(e) => setPhoneNo(e.target.value)} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Reserve Table
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ReservationWrapper;

