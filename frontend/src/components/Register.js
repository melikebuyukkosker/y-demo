import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom'; // Navigasyon için
import { registerUser } from '../services/api'; // Register API çağrısı

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const navigate = useNavigate(); // Navigasyon fonksiyonu

  const onFinish = async (values) => {
    setLoading(true); // Butonu yüklenme durumuna geçir
    try {
      // API fonksiyonunu çağır
      const response = await registerUser(values);
      
      // Eğer 201 dönerse başarılı mesajı göster ve login sayfasına yönlendir
      if (response.status === 201) {
        message.success(response.data.message || 'Registration successful!');
        navigate('/login'); // Login sayfasına yönlendir
      }
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || 'An error occurred. Please try again later.'); // Hata mesajını göster
      } else {
        message.error('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false); // Yüklenme durumunu kapat
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <Title level={2}>Register</Title>
      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{ textAlign: 'left' }}
      >
        <Form.Item
          label="First Name"
          name="firstname"
          rules={[{ required: true, message: 'Please enter your first name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastname"
          rules={[{ required: true, message: 'Please enter your last name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Coordinate"
          name="coordinate"
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
