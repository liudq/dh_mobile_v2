/**
 * module src: openScreenAd/index.js
 * 1、模块路径配置
 * 2、配置不兼容模块
**/
requirejs.config({
    baseUrl: 'http://js.dhresource.com/mobile_v2/src/',
    paths: {
        lib: 'common/base',
        tools: 'common/tools',
        app: 'openScreenAd'
    },
    shim: {
        'lib/backbone': {
            deps: ['lib/underscore', 'lib/jquery'],
            exports: 'Backbone'
        },
        'lib/underscore': {
            exports: '_'
        },
        'lib/jquery': {
            exports: '$'
        },
        'app/swiper': {
            exports: 'Swiper'
        },
    }
});

//调用入口文件
requirejs(['app/main']);


