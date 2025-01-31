const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// CORS Ayarları
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// PostgreSQL bağlantı havuzu
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Hata Mesajları için Middleware
const handleErrors = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ status: 'error', statusCode, message });
};

// Kullanıcı yetki kontrolü
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { userId } = decoded;

            const permissionQuery = `
                SELECT DISTINCT p.permission_id
                FROM permissions p
                JOIN role_permissions rp ON p.permission_id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = $1;
            `;

            const result = await pool.query(permissionQuery, [userId]);
            const userPermissions = result.rows.map((row) => row.permission_id);

            if (!userPermissions.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            req.user = { userId, permissions: userPermissions };
            next();
        } catch (err) {
            next({ statusCode: 401, message: 'Unauthorized' });
        }
    };
};

// Kullanıcı Kayıt
app.post('/register', async (req, res, next) => {
    const { firstname, lastname, email, password, coordinate } = req.body;

    try {
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı ekle
        const insertUserQuery = `
            INSERT INTO users (firstname, lastname, email, password, coordinate, status) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING user_id;
        `;
        const userResult = await pool.query(insertUserQuery, [
            firstname,
            lastname,
            email,
            hashedPassword,
            coordinate,
            'ACTIVE',
        ]);

        const userId = userResult.rows[0].user_id;

        // Kullanıcıya varsayılan rol ata (Eğer user_roles tablosunda otomatik eklenmiyorsa)
        const defaultRoleId = 'USER'; // Varsayılan rol ID'sini belirleyin
        const insertRoleQuery = `
            INSERT INTO user_roles (user_id, role_id) 
            VALUES ($1, $2);
        `;
        await pool.query(insertRoleQuery, [userId, defaultRoleId]);

        // Kullanıcıya USER_ACCOUNT_READ_PAGE iznini ata
        // const assignPermissionQuery = `
        //     INSERT INTO role_permissions (role_id, permission_id) 
        //     SELECT ur.role_id, 'USER_ACCOUNT_READ_PAGE'
        //     FROM user_roles ur
        //     WHERE ur.user_id = $1;
        // `;
        // await pool.query(assignPermissionQuery, [userId]);

        res.status(201).json({ message: 'User registered successfully with default permissions' });
    } catch (err) {
        console.error('Error during registration:', err.message);

        if (err.code === '23505') {
            next({ statusCode: 400, message: 'Email or unique field already exists' });
        } else {
            next({ statusCode: 500, message: 'Server Error' });
        }
    }
});


// Kullanıcı Detaylarını Döndürme
app.get('/currentUser', async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;

        const userQuery = `
            SELECT u.user_id, u.email, u.firstname, u.lastname, u.coordinate, u.status, u.locale, u.timezone,
                   ARRAY_AGG(DISTINCT p.permission_id) AS permissions,
                   ARRAY_AGG(DISTINCT r.role_id) AS roles
            FROM users u
            LEFT JOIN user_roles ur ON u.user_id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.role_id
            LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE u.user_id = $1
            GROUP BY u.user_id;
        `;

        const result = await pool.query(userQuery, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        next({ statusCode: 401, message: 'Invalid token' });
    }
});

// Kullanıcı Giriş
app.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Kullanıcı bilgilerini al
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Kullanıcının yetkilerini al
        const permissionsResult = await pool.query(
            `SELECT p.permission_id 
             FROM permissions p 
             JOIN role_permissions rp ON p.permission_id = rp.permission_id 
             JOIN user_roles ur ON rp.role_id = ur.role_id 
             WHERE ur.user_id = $1`,
            [user.user_id]
        );

        const roles = await pool.query(
            `SELECT user_role_id, user_id, role_id, created_at, updated_at
            FROM public.user_roles where user_id=$1`
        ,[user.user_id])

        const permissions = permissionsResult.rows.map((row) => row.permission_id);

        // Token oluştur
        const token = jwt.sign(
            { userId: user.user_id, permissions },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Kullanıcı bilgilerini token ile birlikte döndür
        res.status(200).json({
            token,
            user: {
                user_id: user.user_id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                coordinate: user.coordinate,
                status: user.status,
                created_at: user.created_at,
                updated_at: user.updated_at,
                roles:roles.rows.map((c)=>c.role_id),
                permissions,
            },
        });
    } catch (err) {
        console.error('Login Error:', err);
        next({ statusCode: 500, message: 'Server Error' });
    }
});

// Kullanıcı Listeleme
app.get('/users', checkPermission('USER_ACCOUNT_READ_PAGE'), async (req, res, next) => {
    try {
        const query = `
            SELECT 
                u.user_id,
                u.firstname,
                u.lastname,
                u.email,
                u.coordinate,
                COALESCE(ARRAY_AGG(DISTINCT p.permission_id), '{}') AS permissions
            FROM users u
            LEFT JOIN user_roles ur ON u.user_id = ur.user_id
            LEFT JOIN role_permissions rp ON ur.role_id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.permission_id
            GROUP BY u.user_id;
        `;

        const result = await pool.query(query);

        for(const user of result.rows){
            const roles = await pool.query(
                `SELECT user_role_id, user_id, role_id, created_at, updated_at
                FROM public.user_roles where user_id=$1`
            ,[user.user_id])

            const rolDetail = roles.rows.map((c)=>c.role_id);

            user.roles = rolDetail
    
        }



        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        next({ statusCode: 500, message: 'Server Error' });
    }
});

// Kullanıcı Düzenleme
app.patch('/users/:id', checkPermission('USER_ACCOUNT_UPDATE_PAGE'), async (req, res, next) => {
    const { id } = req.params; // Kullanıcı ID'si
    const { roles } = req.body; // Yeni izinler

    console.log(req.body)

    if (!roles || !Array.isArray(roles)) {
        return res.status(400).json({ message: 'Roles must be a valid array' });
    }


    try {



        await pool.query('DELETE FROM user_roles WHERE user_id=$1',[id])
        for(const role of roles){
            await pool.query(`
            INSERT INTO public.user_roles(
                user_id, role_id)
                VALUES ($1, $2);
            `,[id,role])
        }


        // // Mevcut izinleri sil
        // const deletePermissionsQuery = `
        //     DELETE FROM role_permissions
        //     WHERE role_id = ANY($1::VARCHAR[]);
        // `;
        // await pool.query(deletePermissionsQuery, [roles]);

        // // Yeni izinleri ekle
        // const insertPermissionsQuery = `
        //     INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        //     VALUES ($1, $2, NOW(), NOW());
        // `;
        // for (const roleId of roles) {
        //     for (const permission of permissions) {
        //         await pool.query(insertPermissionsQuery, [roleId, permission]);
        //     }
        // }

        // // Güncellenmiş izinleri döndür
        // const updatedPermissionsQuery = `
        //     SELECT DISTINCT p.permission_id
        //     FROM role_permissions rp
        //     JOIN permissions p ON rp.permission_id = p.permission_id
        //     WHERE rp.role_id = ANY($1::VARCHAR[]);
        // `;
        // const updatedPermissionsResult = await pool.query(updatedPermissionsQuery, [roles]);

        res.status(200).json({
            message: 'Permissions updated successfully',
            roles: roles,
        });
    } catch (err) {
        console.error('Error updating permissions:', err.message);
        next({ statusCode: 500, message: 'Server Error' });
    }
});






// Kullanıcı Silme Endpoint'i
app.delete('/users/:id', checkPermission('USER_ACCOUNT_DELETE_PAGE'), async (req, res, next) => {
    const { id } = req.params; // Silinecek kullanıcının ID'si

    try {
        const deleteUserQuery = `DELETE FROM users WHERE user_id = $1 RETURNING *;`;
        const result = await pool.query(deleteUserQuery, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı!' }); // Kullanıcı bulunamadı hatası
        }

        res.status(200).json({ message: 'Kullanıcı başarıyla silindi!', user: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        next({ statusCode: 500, message: 'Server Error' }); // Sunucu hatası
    }
});

app.get('/roles', async (req, res, next) => {
    try {
        const query = `
            SELECT role_id, description, is_default, created_at, updated_at
            FROM roles;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching roles:', err);
        next({ statusCode: 500, message: 'Server Error' });
    }
});

app.get('/role-permissions', async (req, res, next) => {
    try {
        const query = `
            SELECT role_permission_id, permission_id, role_id, created_at, updated_at
            FROM role_permissions;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching role permissions:', err);
        next({ statusCode: 500, message: 'Server Error' });
    }
});

app.get('/user-roles', async (req, res, next) => {
    try {
        const query = `
            SELECT user_role_id, user_id, role_id, created_at, updated_at
            FROM user_roles;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching user roles:', err);
        next({ statusCode: 500, message: 'Server Error' });
    }
});

// Hata Middleware'i
app.use(handleErrors);

// Sunucu Başlatma
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
