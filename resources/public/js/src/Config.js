'use strict';

function Config() {}

Config.prototype.GPLUS = {
    CLIENT_ID: '944203012148-j0oc67d3hn40j3qoqq2vk7joo6f0jju4' +
               '.apps.googleusercontent.com',
    SCOPE: 'profile',
    ACCESS_TYPE: 'offline',
    THEME: 'dark',
    COOKIE_POLICY: 'single_host_origin'
};

module.exports = Config;