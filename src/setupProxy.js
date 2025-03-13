const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://localhost:7101', // Đúng với profile "https" trong launchSettings.json
      changeOrigin: true,
      secure: false, // Cho phép kết nối với HTTPS có chứng chỉ tự ký
    })
  );
};
