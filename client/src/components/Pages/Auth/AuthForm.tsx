import { useState } from 'react';
import { Form, Input, Button, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

// interface IForm {
//     username: string;
//     password: string;
//     email: string;
// }

const AuthForm = () => {
    const [activeTab, setActiveTab] = useState('login');

    const onFinish = (values: any) => {
        console.log('Success:', values);
    };

    return (
        <div className="px-8 py-16 bg-blue-50">
            <div className="max-w-md p-8 mx-auto bg-white rounded-lg shadow-md">
                <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
                    <TabPane tab="Login" key="login">
                        <Form name="login" onFinish={onFinish} layout="vertical">
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Username" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    Log in
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab="Register" key="register">
                        <Form name="register" onFinish={onFinish} layout="vertical">
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Username" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    Register
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default AuthForm

