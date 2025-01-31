import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCurrentUser } from './api';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';

const ProtectedRoute = ({ children }) => {

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {

    setLoading(true)

    const token = localStorage.getItem('token');

    if (token) {
      //Token kontrolüne gitsin

      getCurrentUser().then((e) => {
        dispatch(setUser({ user :e.data }));
      }).catch(f => {
        window.localStorage.clear('token')
        navigate('/login')
      }).finally(() => {
        setLoading(false)
      })


    } else {
      setLoading(false)
      navigate('/login')
    }


  }, [])

  if (loading) return (<Spin spinning={true}><div style={{
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}></div></Spin>)

  return children
  // const token = localStorage.getItem('token');
  // return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
