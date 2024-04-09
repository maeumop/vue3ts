const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  filenameHashing: true,
  configureWebpack: {
    output: {
      filename: 'js/[name].[chunkhash:8].js',
      chunkFilename: 'js/[name].[chunkhash:8].js'
    }
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import '@/assets/scss/abstracts/_functions.scss';
          @import '@/assets/scss/abstracts/_variables.scss';
          @import '@/assets/scss/abstracts/_mixins.scss';
        `
      }
    }
  }
});
