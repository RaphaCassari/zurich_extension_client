module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  publicPath: '/zurich_extension_client/',
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
    }
  }
}