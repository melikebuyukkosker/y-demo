import React, { useEffect } from 'react';
import { Layout, Menu, Avatar, Space, Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../store/userSlice';
import { UserOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons';


const { Header, Sider, Content } = Layout;

const AppLayout = ({ children }) => {
    const user = useSelector((state) => state.user.user); // Redux'tan kullanıcı bilgilerini al
    const token = useSelector((state) => state.user.token); // Token kontrolü
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Token kontrolü: Eğer token yoksa login sayfasına yönlendir
    useEffect(() => {
        if (!token) {
            navigate('/login'); // Login sayfasına yönlendir
        }
    }, [token, navigate]);

    // Kullanıcı menü seçenekleri
    const userMenu = (
        <Menu>
            <Menu.Item
                key="profile"
                icon={<UserOutlined />}
                onClick={() => navigate('/profile')}
            >
                Profil
            </Menu.Item>
            <Menu.Item
                key="logout"
                icon={<LogoutOutlined />}
                danger
                onClick={() => {
                    dispatch(clearUser()); // Kullanıcıyı Redux'tan sil
                    navigate('/login'); // Giriş sayfasına yönlendir
                }}
            >
                Çıkış Yap
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Yan Panel */}
            <Sider collapsible theme="dark">
                {/* Logo Alanı */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '16px 0',
                    }}
                >
                    <Avatar size={40} style={{ backgroundColor: '#87d068' }}>
                        {user?.firstname?.[0]}
                        {user?.lastname?.[0]}
                    </Avatar>
                </div>
                {/* Menü */}
                <Menu theme="dark" mode="inline">
                    <Menu.Item key="users" icon={<TeamOutlined />}>
                        <Link to="/users">Kullanıcılar</Link>
                    </Menu.Item>
                    <Menu.Item key="profile" icon={<UserOutlined />}>
                        <Link to="/profile">Profil</Link>
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout>
                {/* Üst Panel */}
                <Header
                    style={{
                        background: '#fff',
                        padding: '0 16px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    {user && (
                        <Dropdown overlay={userMenu} trigger={['click']}>
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar style={{ backgroundColor: '#87d068' }}>
                                    {user?.firstname?.[0]}
                                    {user?.lastname?.[0]}
                                </Avatar>
                                <span>
                                    {user?.firstname} {user?.lastname}
                                </span>
                            </Space>
                        </Dropdown>
                    )}
                </Header>

                {/* İçerik Alanı */}
                <Content
                    style={{
                        margin: '16px',
                        padding: '16px',
                        background: '#fff',
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
