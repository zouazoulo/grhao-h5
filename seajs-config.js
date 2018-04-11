seajs.config({
  base : 'dest/',
  alias: {
    'swiperCSS' : '../css/swiper-3.3.1.min.css',
    'LAreaCSS':'../css/LArea.css',

    'LArea' : 'LArea.js',
    'LAreaData':'LAreaData.min.js',
    'mobile-util' : 'mobile-util.min.js',

    'adderessManagement' : 'addressManagement.js?v=0411',
    'addressfix' : 'addressfix.js?v=0411',
    'common' : 'common.js?v=0411',
    'goshopCar' : 'goshopCar.js?v=0411',
    'index' : 'index.js?v=0411',
    'login' : 'login.js?v=0411',
    'moregoods' : 'moregoods.js?v=0411',
    'order_management' : 'order_management.js?v=0411',
    'orderSettlement' : 'orderSettlement.js?v=0411',
    'other' : 'other.js?v=0411',
    'payment' : 'payment.js?v=0411',
    'personal' : 'personal.js?v=0411',
    'preOrderManagement' : 'preOrderManagement.js?v=0411',
    'search' : 'search.js?v=0411',
    'seckillGoods' : 'seckillGoods.js?v=0411',
    'zsCart' : 'zsCart.js?v=0411',
    'zipImage': 'zipImage.js?v=0411',
    'weixinSDK' : 'weixin.js?v=0411',
    'package' : 'red_package_rain.js?v=0411'
  },
  preload: ['mobile-util']
});
