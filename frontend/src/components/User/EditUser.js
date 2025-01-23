import React, { useState, useEffect, use } from 'react';
import { Modal, Button, Form, Input, message, Transfer } from 'antd';
import { updateUser, getRolePermissions } from '../../services/api';
import { EditOutlined } from '@ant-design/icons'; // İkon import
import withUserPermission from '../../services/permissions';

const EditUser = ({ user, fetchUsers }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [permissions, setPermissions] = useState([]); // Tüm izinler
    const [selectedPermissions, setSelectedPermissions] = useState([]); // Seçilen izinler

    // Modal'ı aç ve formu doldur
    const showModal = () => {
        setIsModalVisible(true);
        if (user) {
            form.setFieldsValue(user); // Formu kullanıcı bilgileriyle doldur
            setSelectedPermissions(user.permissions || []); // Kullanıcının mevcut izinlerini seçili hale getir
        }
    };

    // Modal'ı kapat
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedPermissions([]); // Seçimleri sıfırla
    };

    // Tüm izinleri API'den çek
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await getRolePermissions();
                setPermissions(response.data.map((perm) => ({
                    key: perm.permission_id,
                    title: perm.permission_id,
                })));
            } catch (error) {
                message.error('İzin bilgileri alınırken bir hata oluştu.');
            }
        };
        fetchPermissions();
    }, []);

    // Transfer bileşeni seçimini yönet
    const handleTransferChange = (targetKeys) => {
        setSelectedPermissions(targetKeys);
    };

    // Kullanıcı düzenleme işlemi
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const updatedUser = {
                ...values,
                permissions: selectedPermissions, // Seçilen izinleri güncelleme isteğine ekle
            };
            const response = await updateUser(user.user_id, updatedUser); // API çağrısı
            message.success(response.data.message || 'Kullanıcı başarıyla güncellendi!');
            fetchUsers(); // Kullanıcı listesini güncelle
            handleCancel(); // Modal'ı kapat
        } catch (error) {
            const status = error.response?.status;
            if (status === 400) {
                message.error('Bu email adresi zaten başka bir kullanıcı tarafından kullanılıyor!');
            } else if (status === 401) {
                message.error('Yetkilendirme hatası! Lütfen tekrar giriş yapın.');
            } else if (status === 403) {
                message.error('Erişim reddedildi! Bu işlem için yetkiniz yok.');
            } else {
                message.error('Sunucu hatası! Lütfen tekrar deneyin.');
            }
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
           <Button type="primary" onClick={showModal} icon={<EditOutlined />}>
              
            </Button>
            <Modal
                title="Kullanıcıyı Düzenle"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
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
                            dataSource={permissions}
                            titles={['Mevcut İzinler', 'Seçilen İzinler']}
                            targetKeys={selectedPermissions}
                            onChange={handleTransferChange}
                            render={(item) => item.title}
                            rowKey={(record) => record.key} // Unique key tanımlama
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Kaydet
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default withUserPermission(EditUser,'USER_ACCOUNT_UPDATE_PAGE');
