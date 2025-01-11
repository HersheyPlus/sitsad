import { Card, Col, Row, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

export default function Dashboard() {
    return (
        <div className="">
            <Title level={2} style={{ marginBottom: '24px' }}>Admin Dashboard</Title>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Link to="/dashboard/table">
                        <Card
                            hoverable
                            title="Table"
                            bordered
                        >
                            <p>View and manage data in a table format</p>
                        </Card>
                    </Link>
                </Col>
                <Col xs={24} md={8}>
                    <Link to="/dashboard/location">
                        <Card
                            hoverable
                            title="Location"
                            bordered
                        >
                            <p>Manage and view location data</p>
                        </Card>
                    </Link>
                </Col>
                <Col xs={24} md={8}>
                    <Link to="/dashboard/toilet">
                        <Card
                            hoverable
                            title="Toilet"
                            bordered
                        >
                            <p>Manage toilet facilities</p>
                        </Card>
                    </Link>
                </Col>
            </Row>
        </div>
    );
}
