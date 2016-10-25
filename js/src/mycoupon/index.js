/**
 * module src: mycoupon/index.js
 * 1、模块路径配置
 * 2、配置不兼容模块
**/
requirejs.config({
    baseUrl: 'http://js.dhresource.com/mobile_v2/src/',
    paths: {
        lib: 'common/base',
        tools: 'common/tools',
        ui: 'common/ui',
        tpl: 'common/tpl',
        checkoutflow: 'common/checkoutflow',
        app: 'mycoupon',
        appTpl: 'mycoupon/tpl'
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
        }
    }
});

//调用入口文件
requirejs(['app/main']);
