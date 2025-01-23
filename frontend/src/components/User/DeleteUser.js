import React from 'react';
import { Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'; // İkon import
import { deleteUser } from '../../services/api';
import withUserPermission from '../../services/permissions';

const DeleteUser = ({ userId, fetchUsers }) => {
    // Kullanıcı silme işlemi
    const handleDelete = async () => {
        try {
            const response = await deleteUser(userId); // API fonksiyonunu çağır
            if (response.status === 200) { // 200 durum kodunu kontrol et
                message.success('Kullanıcı başarıyla silindi!');
                fetchUsers(); // Kullanıcı listesini güncelle
            } else {
                message.warning('İstek başarılı ama beklenmeyen bir durum oluştu.');
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 403) {
                message.error('Bu işlem için yetkiniz yok!');
            } else if (status === 401) {
                message.error('Yetkilendirme hatası! Lütfen tekrar giriş yapın.');
            } else {
                message.error('Kullanıcı silinirken bir hata oluştu!');
            }
            console.error('Error:', error);
        }
    };

    return (
        <Popconfirm
            title="Bu kullanıcıyı silmek istediğinize emin misiniz?"
            onConfirm={handleDelete} // Silme işlemi onaylanınca çalışır
            okText="Evet"
            cancelText="Hayır"
        >
            <Button type="link" danger icon={<DeleteOutlined />}>
                
            </Button>
        </Popconfirm>
    );
};

export default withUserPermission(DeleteUser,'USER_ACCOUNT_DELETE_PAGE');
