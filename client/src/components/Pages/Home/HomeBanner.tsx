import { Typography, Button } from 'antd';

const { Title, Paragraph } = Typography;

const Banner = () => {
  return (
    <div className="px-8 py-20 text-center bg-blue-100">
      <Title level={1} className="text-blue-800">
        Welcome to SIT Krana
      </Title>
      <Paragraph className="mb-8 text-lg">
        Innovative solutions for campus management and student services
      </Paragraph>
      <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700">
        Get Started
      </Button>
    </div>
  );
};

export default Banner;

