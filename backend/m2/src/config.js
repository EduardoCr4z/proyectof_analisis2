require('dotenv').config();

module.exports = {
    app: {
        port: process.env.PORT || 4002,
    },
    mysql: {
        host: process.env.MYSQL_HOST,
        user : process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB,
        charset: 'utf8mb4'
    }
}