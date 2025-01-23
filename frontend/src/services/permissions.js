import React from 'react';
import { useSelector } from 'react-redux';

const withUserPermission = (Component, requiredPermissions) => {
    const PermissionWrapper = (props) => {
      const userPermissions = useSelector((state) => state.user?.user?.permissions);
  console.log(userPermissions)
      // Birden fazla izin kontrolü
      const hasPermission =
        userPermissions.includes(requiredPermissions);
  
      return hasPermission ? <Component {...props} /> : null;
    };
  
    return PermissionWrapper;
  };

export default withUserPermission;
