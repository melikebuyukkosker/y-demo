import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    setLoading(true); // Buton yüklenme durumunu etkinleştir
    try {
      const { email, password } = values;
      const response = await axios.post('http://localhost:5001/login', { email, password });
      
      // JWT Token'ı localStorage'a kaydet
      localStorage.setItem('token', response.data.token);
      const { token, user } = response.data;

      // Kullanıcı bilgisini Redux'a kaydet
      dispatch(setUser({ token, user }));
      message.success('Başarıyla giriş yaptınız!'); // 200 durumunda başarılı mesaj
      navigate('/users'); // Kullanıcılar sayfasına yönlendir
    } catch (error) {
      // Hata durumlarına göre mesajlar
      const status = error.response.status;
      switch (error.response.status) {
        case 400:
          message.error('İstek hatalı! Lütfen bilgilerinizi kontrol edin.');
          break;
        case 401:
          message.error('Yetkilendirme hatası! E-posta veya şifre yanlış.');
          break;
        case 403:
          message.error('Erişim reddedildi! Yetkiniz yok.');
          break;
        default:
          message.error('Sunucu hatası! Lütfen daha sonra tekrar deneyin.');
          break;
      }
      console.error('Hata:', error.response?.data || error.message);
    } finally {
      setLoading(false); // Yüklenme durumunu kapat
    }
  };

  return (
    <Card>
      <Form
        name="login"
        onFinish={onFinish}
        style={{ width: 300 }}
        layout="vertical"
      >
        <Title level={3} style={{ textAlign: 'center' }}>Giriş Yap</Title>
        
        <Form.Item
          label="E-posta"
          name="email"
          rules={[
            { required: true, message: 'Lütfen e-posta adresinizi giriniz!' },
            { type: 'email', message: 'Geçerli bir e-posta adresi giriniz!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Şifre"
          name="password"
          rules={[
            { required: true, message: 'Lütfen şifrenizi giriniz!' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Giriş Yap
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Login;
