seajs.config({
  base : 'dest/',
  alias: {
    'swiperCSS' : '../css/swiper-3.3.1.min.css',
    'LAreaCSS':'../css/LArea.css',

    'LArea' : 'LArea.js',
    'LAreaData':'LAreaData.min.js',
    'mobile-util' : 'mobile-util.min.js',

    'adderessManagement' : 'addressManagement.js?v=0420',
    'addressfix' : 'addressfix.js?v=0420',
    'common' : 'common.js?v=0420',
    'goshopCar' : 'goshopCar.js?v=0420',
    'index' : 'index.js?v=0420',
    'login' : 'login.js?v=0420',
    'moregoods' : 'moregoods.js?v=0420',
    'order_management' : 'order_management.js?v=0420',
    'orderSettlement' : 'orderSettlement.js?v=0420',
    'other' : 'other.js?v=0420',
    'payment' : 'payment.js?v=0420',
    'personal' : 'personal.js?v=0420',
    'preOrderManagement' : 'preOrderManagement.js?v=0420',
    'search' : 'search.js?v=0420',
    'seckillGoods' : 'seckillGoods.js?v=0420',
    'zsCart' : 'zsCart.js?v=0420',
    'zipImage': 'zipImage.js?v=0420',
    'weixinSDK' : 'weixin.js?v=0420',
    'package' : 'red_package_rain.js?v=0420',
    'vue':'vue.js?v=0420'
  },
  preload: ['mobile-util']
});
