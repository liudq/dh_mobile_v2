/**
 * module src: cart/index.js
 * 1、模块路径配置
 * 2、配置不兼容模块
**/
requirejs.config({
    baseUrl: '//js.dhresource.com/mobile_v2/src/',
    paths: {
        lib: 'common/base',
        tools: 'common/tools',
        ui: 'common/ui',
        tpl: 'common/tpl',
        checkoutflow: 'common/checkoutflow',
        app: 'cart',
        appTpl: 'cart/tpl'
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
        'tools/jquery.cookie': {
            deps: ['lib/jquery'],
            exports: '$cookie'
        },
        'tools/fastclick': {
            exports: 'FastClick'
        },
        'app/lazyload': {
            deps: ['lib/jquery'],
            exports: 'Lazyload'
        }
    }
});

//调用入口文件
requirejs(['app/main']);


