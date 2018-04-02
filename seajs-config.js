seajs.config({
  base : 'lib/',
  alias: {
    'swiperCSS' : '../css/swiper-3.3.1.min.css',
    'LAreaCSS':'../css/LArea.css',

    'LArea' : 'LArea.js',
    'LAreaData':'LAreaData.min.js',
    'mobile-util' : 'mobile-util.min.js',

    'adderessManagement' : 'addressManagement.js?v=03301',
    'addressfix' : 'addressfix.js?v=03301',
    'common' : 'common.js?v=03301',
    'goshopCar' : 'goshopCar.js?v=03301',
    'index' : 'index.js?v=03301',
    'login' : 'login.js?v=03301',
    'moregoods' : 'moregoods.js?v=03301',
    'order_management' : 'order_management.js?v=03301',
    'orderSettlement' : 'orderSettlement.js?v=03301',
    'other' : 'other.js?v=03301',
    'payment' : 'payment.js?v=03301',
    'personal' : 'personal.js?v=03301',
    'preOrderManagement' : 'preOrderManagement.js?v=03301',
    'search' : 'search.js?v=03301',
    'seckillGoods' : 'seckillGoods.js?v=03301',
    'zsCart' : 'zsCart.js?v=03301',
    'zipImage': 'zipImage.js?v=03301',
    'weixinSDK' : 'weixin.js?v=03301',
    'package' : 'red_package_rain.js?v=03301'
  },
  preload: ['mobile-util']
});
