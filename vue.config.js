const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  productionSourceMap: false,
  transpileDependencies: true,
  publicPath: '/twfollowers/'
})
process.env.VUE_APP_VERSION = require('./package.json').version
