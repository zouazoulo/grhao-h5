seajs.config({
  base : 'lib/',
  alias: {
    'weixinSDK' : 'weixin.js?v=20180720',
  },
  preload: ['mobile-util']
});
