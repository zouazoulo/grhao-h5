seajs.config({
  base : 'lib/',
  alias: {
    'swiperCSS' : '../css/swiper-3.3.1.min.css',
    'LAreaCSS':'../css/LArea.css',

    'LArea' : 'LArea.js',
    'LAreaData':'LAreaData.min.js',
    'mobile-util' : 'mobile-util.min.js',

    'adderessManagement' : 'addressManagement.js?v=1000000',
    'addressfix' : 'addressfix.js?v=1000000',
    'common' : 'common.js?v=1000000',
    'goshopCar' : 'goshopCar.js?v=1000000',
    'index' : 'index.js?v=1000000',
    'login' : 'login.js?v=1000000',
    'moregoods' : 'moregoods.js?v=1000000',
    'order_management' : 'order_management.js?v=1000000',
    'orderSettlement' : 'orderSettlement.js?v=1000000',
    'other' : 'other.js?v=1000000',
    'payment' : 'payment.js?v=1000000',
    'personal' : 'personal.js?v=1000000',
    'preOrderManagement' : 'preOrderManagement.js?v=1000000',
    'search' : 'search.js?v=1000000',
    'seckillGoods' : 'seckillGoods.js?v=1000000',
    'zsCart' : 'zsCart.js?v=1000000',
    'zipImage': 'zipImage.js?v=1000000',
    'weixinSDK' : 'weixin.js?v=1000000',
    'package' : 'red_package_rain.js?v=1000000'
  },
  preload: ['mobile-util']
});
