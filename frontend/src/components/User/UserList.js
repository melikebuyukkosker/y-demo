import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Typography, Flex } from 'antd';
import { getUsers } from '../../services/api';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';
import MapModal from '../MapModal';
import AddUser from './AddUser';
import { useSelector } from 'react-redux';

const { Title } = Typography;

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.user);
   
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Kullanıcılar alınamadı:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const columns = [
        {
            title: 'Ad',
            dataIndex: 'firstname',
            key: 'firstname',
            align: 'center', // Sütunları ortala
        },
        {
            title: 'Soyad',
            dataIndex: 'lastname',
            key: 'lastname',
            align: 'center',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            align: 'center',
        },
        {
            title: 'Coordinate',
            dataIndex: 'coordinate',
            key: 'coordinate',
            align: 'center',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <EditUser user={record} fetchUsers={fetchUsers} />
                    <DeleteUser userId={record.user_id} fetchUsers={fetchUsers} />
                    <MapModal coordinate={record.coordinate} />
                </Space>
            ),
        },
    ];

    return (
        <div
           
        >
            <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
                Kullanıcı Tablosu
            </Title>
           <Flex justify='flex-end'>
           <AddUser fetchUsers={fetchUsers} />

           </Flex>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="user_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                bordered
                style={{ marginTop: '20px' }}
            />
        </div>
    );
};

export default UserTable;
