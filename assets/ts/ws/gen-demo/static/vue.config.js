module.exports = {
  runtimeCompiler: true,
  publicPath: './',
  configureWebpack: {

    module: {
      rules: [
        {
          test: /\.html$/,
          loader: 'html-loader',
        },
      ]
    }
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
