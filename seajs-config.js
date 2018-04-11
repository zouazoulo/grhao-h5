seajs.config({
  base : 'dest/',
  alias: {
    'swiperCSS' : '../css/swiper-3.3.1.min.css',
    'LAreaCSS':'../css/LArea.css',

    'LArea' : 'LArea.js',
    'LAreaData':'LAreaData.min.js',
    'mobile-util' : 'mobile-util.min.js',

    'adderessManagement' : 'addressManagement.js?v=041101',
    'addressfix' : 'addressfix.js?v=041101',
    'common' : 'common.js?v=041101',
    'goshopCar' : 'goshopCar.js?v=041101',
    'index' : 'index.js?v=041101',
    'login' : 'login.js?v=041101',
    'moregoods' : 'moregoods.js?v=041101',
    'order_management' : 'order_management.js?v=041101',
    'orderSettlement' : 'orderSettlement.js?v=041101',
    'other' : 'other.js?v=041101',
    'payment' : 'payment.js?v=041101',
    'personal' : 'personal.js?v=041101',
    'preOrderManagement' : 'preOrderManagement.js?v=041101',
    'search' : 'search.js?v=041101',
    'seckillGoods' : 'seckillGoods.js?v=041101',
    'zsCart' : 'zsCart.js?v=041101',
    'zipImage': 'zipImage.js?v=041101',
    'weixinSDK' : 'weixin.js?v=041101',
    'package' : 'red_package_rain.js?v=041101'
  },
  preload: ['mobile-util']
});
