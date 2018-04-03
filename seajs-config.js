seajs.config({
  base : 'dest/',
  alias: {
    'swiperCSS' : '../css/swiper-3.3.1.min.css',
    'LAreaCSS':'../css/LArea.css',

    'LArea' : 'LArea.js',
    'LAreaData':'LAreaData.min.js',
    'mobile-util' : 'mobile-util.min.js',

    'adderessManagement' : 'addressManagement.js?v=0403',
    'addressfix' : 'addressfix.js?v=0403',
    'common' : 'common.js?v=0403',
    'goshopCar' : 'goshopCar.js?v=0403',
    'index' : 'index.js?v=0403',
    'login' : 'login.js?v=0403',
    'moregoods' : 'moregoods.js?v=0403',
    'order_management' : 'order_management.js?v=0403',
    'orderSettlement' : 'orderSettlement.js?v=0403',
    'other' : 'other.js?v=0403',
    'payment' : 'payment.js?v=0403',
    'personal' : 'personal.js?v=0403',
    'preOrderManagement' : 'preOrderManagement.js?v=0403',
    'search' : 'search.js?v=0403',
    'seckillGoods' : 'seckillGoods.js?v=0403',
    'zsCart' : 'zsCart.js?v=0403',
    'zipImage': 'zipImage.js?v=0403',
    'weixinSDK' : 'weixin.js?v=0403',
    'package' : 'red_package_rain.js?v=0403'
  },
  preload: ['mobile-util']
});
