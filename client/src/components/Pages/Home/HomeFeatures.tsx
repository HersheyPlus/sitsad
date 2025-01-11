import { Row, Col, Card, Typography } from 'antd';
import { TableOutlined, BankOutlined, CarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const features = [
    {
        title: 'ระบบจองโต๊ะ',
        description: 'จองโต๊ะเรียนหรือทำงานได้อย่างสะดวกและรวดเร็ว',
        icon: <TableOutlined className="text-4xl text-blue-600" />,
        href: '/table'
    },
    {
        title: 'ระบบตรวจห้องน้ำว่าง',
        description: 'ตรวจสอบสถานะห้องน้ำว่างได้แบบเรียลไทม์',
        icon: <BankOutlined className="text-4xl text-blue-600" />,
    },
    {
        title: 'ระบบตรวจจับรถยนต์จอดผิด',
        description: 'สำหรับผู้ดูแลระบบ: ตรวจสอบและจัดการรถยนต์ที่จอดผิดกฎ',
        icon: <CarOutlined className="text-4xl text-blue-600" />,
    },
];

const Features = () => {
    const navigate = useNavigate();

    const doNavigate = (href: string | undefined) => {
        if (!href) return

        navigate(href);
    }

    return (
        <div className="px-8 py-16 bg-white">
            <Title level={2} className="mb-12 text-center text-blue-800">
                Our Features
            </Title>
            <Row gutter={[32, 32]} justify="center">
                {features.map((feature, index) => (
                    <Col xs={24} sm={12} md={8} key={index}>
                        <Card className="h-full text-center transition-shadow hover:shadow-lg hover:cursor-pointer" onClick={() => doNavigate(feature.href)}>
                            {feature.icon}
                            <Title level={4} className="mt-4 text-blue-700">
                                {feature.title}
                            </Title>
                            <Paragraph>{feature.description}</Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Features;

