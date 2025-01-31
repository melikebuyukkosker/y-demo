import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, message, Transfer } from 'antd';
import { registerUser, getRolePermissions } from '../../services/api';
import { UserAddOutlined } from '@ant-design/icons'; // Kullanıcı ekleme ikonu
import withUserPermission from '../../services/permissions';

const AddUser = ({ fetchUsers }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [roles, setRoles] = useState([]); // Tüm izinler
    const [selectedRoles, setSelectedRoles] = useState([]); // Seçilen izinler

    // Modal'ı aç
    const showModal = () => {
        setIsModalVisible(true);
        fetchRoles();
    };

    // Modal'ı kapat
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedRoles([]); // Seçimleri sıfırla
    };

    // Tüm izinleri API'den çek
    const fetchRoles = async () => {
        try {
            const response = await getRolePermissions();
            setRoles(response.data.map((perm) => ({
                key: perm.role_id,
                title: perm.role_id,
            })));
        } catch (error) {
            message.error('İzin bilgileri alınırken bir hata oluştu.');
        }
    };
  

    // Transfer bileşeni seçimini yönet
    const handleTransferChange = (targetKeys) => {
        setSelectedRoles(targetKeys);
    };

    // Kullanıcı ekleme işlemi
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const newUser = {
                ...values,
                roles: selectedRoles, // Seçilen izinleri API isteğine ekle
            };
            const response = await registerUser(newUser); // API fonksiyonunu çağır
            message.success(response.data.message);
            fetchUsers(); // Kullanıcı listesini güncelle
            handleCancel(); // Modal'ı kapat
        } catch (error) {
            if (error.response?.status === 400) {
                message.error('Bu email adresi zaten kayıtlı!');
            } else {
                message.error('Sunucu hatası! Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button type="primary" onClick={showModal} icon={<UserAddOutlined />}>
               
            </Button>
            <Modal
                title="Kullanıcı Ekle"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800} // Modal genişliği
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Ad"
                        name="firstname"
                        rules={[{ required: true, message: 'Lütfen adınızı giriniz!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Soyad"
                        name="lastname"
                        rules={[{ required: true, message: 'Lütfen soyadınızı giriniz!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Lütfen email adresinizi giriniz!' },
                            { type: 'email', message: 'Geçerli bir email adresi giriniz!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Şifre"
                        name="password"
                        rules={[{ required: true, message: 'Lütfen şifrenizi giriniz!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Konum"
                        name="coordinate"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="İzinler">
                        <Transfer
                        listStyle={{
                            width: 360,
                            height: 300,
                          }}
                            dataSource={roles}
                            titles={['Mevcut İzinler', 'Seçilen İzinler']}
                            targetKeys={selectedRoles}
                            onChange={handleTransferChange}
                            render={(item) => item.title}
                            rowKey={(record) => record.key} // Unique key tanımlama
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Kullanıcı Ekle
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default withUserPermission(AddUser,'USER_ACCOUNT_CREATE_PAGE');
