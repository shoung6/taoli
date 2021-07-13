module.exports = {
  devServer: {
    proxy: {
      "/data": {
        target: "https://www.jisilu.cn",
        changeOrigin: true, // 允许跨域
      },
    },
  },
};
