import { Row, Col, Card, Typography } from 'antd';
import { TableOutlined, CarOutlined, BookOutlined } from '@ant-design/icons';
import { ToiletIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const features = [
    {
        title: 'ระบบจองโต๊ะ',
        description: 'จองโต๊ะเรียนหรือทำงานได้อย่างสะดวกและรวดเร็ว',
        icon: (
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <TableOutlined className="text-3xl text-blue-600" />
            </div>
        ),
        href: '/table',
    },
    {
        title: 'ระบบตรวจห้องน้ำว่าง',
        description: 'ตรวจสอบสถานะห้องน้ำว่างได้แบบเรียลไทม์',
        icon: (
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <ToiletIcon className="w-8 h-8 text-blue-600" />
            </div>
        ),
        href: '/toilet',
    },
    {
        title: 'ระบบแสดงรายการของหายในคณะ',
        description: 'ค้นหาของหายที่ถูกเก็บในพื้นที่คณะได้อย่างง่ายดาย',
        icon: (
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <BookOutlined className="text-3xl text-blue-600" />
            </div>
        ),
        href: '/lost-and-found',
    },
];

const Features = () => {
    const navigate = useNavigate();

    const handleNavigation = (href) => {
        if (href) navigate(href);
    };

    return (
        <div className="px-6 py-12 bg-gray-50">
            <Title level={2} className="mb-10 text-center text-blue-800">
                Our Features
            </Title>
            <Row gutter={[24, 24]} justify="center">
                {features.map((feature, index) => (
                    <Col xs={24} sm={12} md={8} key={index}>
                        <Card
                            hoverable
                            className="flex flex-col items-center h-full text-center transition-shadow shadow-md hover:shadow-lg"
                            onClick={() => handleNavigation(feature.href)}
                        >
                            <div className="flex justify-center mb-4">{feature.icon}</div>
                            <Title level={4} className="text-blue-700">
                                {feature.title}
                            </Title>
                            <Paragraph className="text-gray-600">{feature.description}</Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Features;
