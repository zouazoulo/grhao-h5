seajs.config({
  base : 'lib/',
  alias: {
    'swiperCSS' : '../css/swiper-3.3.1.min.css',
    'LAreaCSS':'../css/LArea.css',

    'LArea' : 'LArea.js',
    'LAreaData':'LAreaData.min.js',
    'mobile-util' : 'mobile-util.min.js',

    'adderessManagement' : 'addressManagement.js?v=0509',
    'addressfix' : 'addressfix.js?v=0509',
    'common' : 'common.js?v=0509',
    'goshopCar' : 'goshopCar.js?v=0509',
    'index' : 'index.js?v=0509',
    'login' : 'login.js?v=0509',
    'moregoods' : 'moregoods.js?v=0509',
    'order_management' : 'order_management.js?v=0509',
    'orderSettlement' : 'orderSettlement.js?v=0509',
    'other' : 'other.js?v=0509',
    'payment' : 'payment.js?v=0509',
    'personal' : 'personal.js?v=0509',
    'preOrderManagement' : 'preOrderManagement.js?v=0509',
    'search' : 'search.js?v=0509',
    'seckillGoods' : 'seckillGoods.js?v=0509',
    'zsCart' : 'zsCart.js?v=0509',
    'zipImage': 'zipImage.js?v=0509',
    'weixinSDK' : 'weixin.js?v=0509',
    'package' : 'red_package_rain.js?v=0509',
    'vue':'vue.js?v=0509'
  },
  preload: ['mobile-util']
});
