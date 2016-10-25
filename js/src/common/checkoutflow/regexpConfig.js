/**
 * module src: common/checkoutflow/regexpConfig.js
 * 支付流程验证表单字段的正则集合模块
**/
define('checkoutflow/regexpConfig', [], function(){
    /**
     * Luhn算法
     * Form Internet：
     * http://www.sharejs.com/codes/javascript/7090
     * http://blog.sina.com.cn/s/blog_62e1faba010147k4.html
     * https://www.azcode.com/mod10/
     *
     * 信用卡号生成器
     * http://names.igopaygo.com/credit_card
     * http://www.e4dai.com/tool/CreditCard.asp
    **/
    var luhuCheck = function(sCardNum) {
        var iOddSum = 0,
            iEvenSum = 0,
            bIsOdd = true;

        for(var i = sCardNum.length-1; i >= 0; i --){
            var iNum = parseInt(sCardNum.charAt(i));
            if(bIsOdd){
                iOddSum += iNum;
            }else{
                iNum = iNum * 2;
                if(iNum > 9){
                    iNum = eval(iNum.toString().split('').join('+'));
                }
                iEvenSum += iNum;
            }
            bIsOdd = !bIsOdd;
        }
        return (iEvenSum + iOddSum) % 10 == 0;
    };

    /**
     * Form Internet：
     * http://codelinks.pachanka.org/post/39571739350/javascript-hex-to-ascii-conversion
     * Javascript Hex <to> Ascii conversion
     * Basic Hex to ASCII and ASCII to Hex converter including seperators for hex values.
     * Example:
     * favoConverter().toHex('Example')
     * // => "4578616d706c65"
     * 
     * favoConverter().toHex('Example', ':')
     * // => "45:78:61:6d:70:6c:65"
     * 
     * 只能转换英文字符，非英文字符均转为“1f”
     * favoConverter().toHex('测试文字');
     * // => "1f1f1f1f"
     *
     * toAscii()去除此方法
     * favoConverter().toAscii('4578616d706c65')
     * // => "Example"
    **/
    var favoConverter = (function(){
        var symbols, loAZ, hexChars;
        
        //设置能够进行转换的字符集
        symbols = " !\"#$%&'()*+,-./0123456789:;<=>?@";
        loAZ = "abcdefghijklmnopqrstuvwxyz";
        symbols += loAZ.toUpperCase();
        symbols += "[\\]^_`";
        symbols += loAZ;
        symbols += "{|}~";
        
        //16进制所包含的字符集
        hexChars = "0123456789abcdef";

        return {
            toHex: function(valueStr, seperator) {
                var text = "", i, oneChar, asciiValue, index1, index2;
                for (i = 0; i < valueStr.length; i++) {
                    oneChar = valueStr.charAt(i);
                    asciiValue = symbols.indexOf(oneChar) + 32;
                    index1 = asciiValue % 16;
                    index2 = (asciiValue - index1)/16;
                    if (text != "" && seperator) {
                        text += seperator;
                    }
                    text += hexChars.charAt(index2);
                    text += hexChars.charAt(index1);
                }
                return text;
            }
        }
    })();

    return {
        //包含数字
        hasNumber: /\d/,
        //纯数字
        isNumber: /^\d+$/,
        //空字符
        isNull: /^\s+$/,
        //非法字符
        isIllegalChar: /[!@$*+<>&'\"%\\]/,
        //名
        firstName: /^.{1,30}$/,
        //姓
        lastName: /^.{1,20}$/,
        //地址1
        addressOne: /^.{1,512}$/,
        //地址2
        addressTwo: /^.{0,512}$/,
        //城市
        city: /^.{1,60}$/,
        //合法的邮编字符
        zipCodeChar: /^[A-Za-z0-9\-_()+ ]+$/,
        //除美国外的邮编
        zipCode: /^.{4,10}$/,
        //美国邮编
        usZipCode: /^\d{5}$|^\d{9}$|^\d{5}\s\d{4}$/,
        //电话号码（只能包含：数字, ,-,(,)）
        telephone: /^[\d \-()]+$/,
        //电话号码（美国、加拿大）
        telephone1: /^.{10}$/,
        //电话号码（英国）
        telephone2: /^.{7,11}$/,
        //电话号码（澳大利亚）
        telephone3: /^.{9,10}$/,
        //邮箱地址
        email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
        //visa卡
        visaCardNo: /^(4\d{12}(?:\d{3})?)$/,
        visaCardNo1: /^4/,
        //master卡
        masterCardNo: /^(5[1-5]\d{2})[\s\-]?(\d{4})[\s\-]?(\d{4})[\s\-]?(\d{4})$/,
        masterCardNo1: /^5[1-5]/,
        //amex卡
        amexCardNo: /^((?:34|37)\d{13})$/,
        amexCardNo1: /^34|37/,
        //根据luhu算法验证银行卡的有效性
        luhuCheck: luhuCheck,
        //银行卡年份
        year: /^\d{2}$/,
        //银行卡月份
        month: /^\d{2}$/,
        //银行卡认证码
        csc1: /^\d{3}$/,          //visa和Master为3位
        csc2: /^\d{3}$|^\d{4}$/,  //AE是3位或者4位
        //密码校验
        password: /^.{6,30}$/,
        //国家和州省份名称校验
        country_state_name: /^\-\-.+\-\-$/,
        /**
         * 验证是否为非英文字符（特殊的校验实现为与平台实现统一）
         * 用户输入的字符串将进行hex编码，如果带有非英文字符则该
         * 字符将被编码为“1f”，且每个编码字符之间用“:”来进行分隔；
         * 例如，当用户输入的文字为“测试test文字”，则编码后的结
         * 果为："1f:1f:74:65:73:74:1f:1f"；
         * 也就是说此处验证是否为非英文字符就是通过查看编码后的
         * 字符串中是否包含有完整“1f”字符串；
        **/
        chkHexStr: function(str) {
            var flag = false,
                hexStr = favoConverter.toHex(str, ':').split(':'),
                i;
			for (i = 0; i < hexStr.length; i++) {
                //含有非英文字符
				if (hexStr[i] == '1f') {
					flag = true;
				}
			}
			return flag;
        }
    };
});


