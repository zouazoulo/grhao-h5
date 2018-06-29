seajs.config({
  base : 'dest/',
  alias: {
    'swiperCSS' : '../css/swiper-3.3.1.min.css',
    'LAreaCSS':'../css/LArea.css',

    'LArea' : 'LArea.js',
    'LAreaData':'LAreaData.min.js',
    'mobile-util' : 'mobile-util.min.js',

    'adderessManagement' : 'addressManagement.js?v=20180606',
    'addressfix' : 'addressfix.js?v=20180606',
    'common' : 'common.js?v=20180606',
    'goshopCar' : 'goshopCar.js?v=20180606',
    'index' : 'index.js?v=20180606',
    'login' : 'login.js?v=20180606',
    'moregoods' : 'moregoods.js?v=20180606',
    'order_management' : 'order_management.js?v=20180606',
    'orderSettlement' : 'orderSettlement.js?v=20180606',
    'orderSettlement1' : 'orderSettlement1.js?v=20180606',
    'other' : 'other.js?v=20180606',
    'payment' : 'payment.js?v=20180606',
    'personal' : 'personal.js?v=20180606',
    'preOrderManagement' : 'preOrderManagement.js?v=20180606',
    'search' : 'search.js?v=20180606',
    'seckillGoods' : 'seckillGoods.js?v=20180606',
    'zsCart' : 'zsCart.js?v=20180606',
    'zipImage': 'zipImage.js?v=20180606',
    'weixinSDK' : 'weixin.js?v=20180606',
    'package' : 'red_package_rain.js?v=20180606',
    'vue':'vue.js?v=20180606',
    'score':'score.js?v=20180606'
  },
  preload: ['mobile-util']
});
