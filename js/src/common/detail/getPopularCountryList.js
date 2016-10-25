/**
 * module src: common/detail/getPopularCountryList.js
 * 获取主流目的国家列表
**/
define('common/detail/getPopularCountryList', ['common/config'], function(CONFIG){
    var data = [
        {
            whitherCountryId: 'US',
            whitherCountryName: 'United States'
        },
        {
            whitherCountryId: 'RF',
            whitherCountryName: 'Russian Federation'
        },
        {
            whitherCountryId: 'BR',
            whitherCountryName: 'Brazil'
        },
        {
            whitherCountryId: 'AU',
            whitherCountryName: 'Australia'
        },
        {
            whitherCountryId: 'UK',
            whitherCountryName: 'United Kingdom'
        },
        {
            whitherCountryId: 'ES',
            whitherCountryName: 'Spain'
        },
        {
            whitherCountryId: 'FR',
            whitherCountryName: 'France'
        },
        {
            whitherCountryId: 'CA',
            whitherCountryName: 'Canada'
        },
        {
            whitherCountryId: 'PL',
            whitherCountryName: 'Poland'
        },
        {
            whitherCountryId: 'TR',
            whitherCountryName: 'Turkey'
        },
        {
            whitherCountryId: 'SE',
            whitherCountryName: 'Sweden'
        },
        {
            whitherCountryId: 'IL',
            whitherCountryName: 'Israel'
        },
        {
            whitherCountryId: 'IT',
            whitherCountryName: 'Italy'
        },
        {
            whitherCountryId: 'NZ',
            whitherCountryName: 'New Zealand'
        },
        {
            whitherCountryId: 'DE',
            whitherCountryName: 'Germany'
        }
    ];

    return {
        get: function() {
            return data;
        }
    };
});