import React from 'react';
import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

const AuthLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {children}
      </Content>
    </Layout>
  );
};

export default AuthLayout;
