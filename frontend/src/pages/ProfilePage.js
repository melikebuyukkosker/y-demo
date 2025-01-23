import React from 'react';
import { Card, Typography, Descriptions, Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Title } = Typography;

const ProfilePage = () => {
    const user = useSelector((state) => state.user.user); // Redux'tan kullanıcı bilgilerini çek

    if (!user) {
        return <p>Lütfen giriş yapın.</p>;
    }

    return (
        <div
            
        >
            {/* Başlık ve Avatar */}
            <Space direction="vertical" align="center" style={{ marginBottom: '20px' }}>
                <Avatar size={64} style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                <Title level={3} style={{ margin: 0 }}>
                    {user.firstname} {user.lastname}
                </Title>
            </Space>

            {/* Profil Bilgileri */}
            <Descriptions
                bordered
                column={1}
                labelStyle={{ fontWeight: 'bold', width: '30%' }}
                contentStyle={{ background: '#fafafa', padding: '8px' }}
            >
                <Descriptions.Item label="Ad">{user.firstname}</Descriptions.Item>
                <Descriptions.Item label="Soyad">{user.lastname}</Descriptions.Item>
                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            </Descriptions>
        </div>
    );
};

export default ProfilePage;
