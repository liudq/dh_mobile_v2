/**
 * Created by liudongqing on 16/9/7.
 */
function fn(a) {
        return function(b) {
            return a + b;
        }
    }
var x = fn(5);
var x = fn(4);
var y = fn(7);
console.log(x(1)); //输出结果是5console.log(x(3)); //输出结果是7console.log(y(1)); //输出结果是8
var foo = {
    bar: function() {
        return this.baz;
    },
    baz: 1
};
alert((function() {
    return typeof arguments[0]();
})(foo.bar)); //结果是undfined,同样是在考闭包
function build() {
    var i;
    return function() {
        alert(i++);
    }
}
var f1 = build();
var f2 = build();