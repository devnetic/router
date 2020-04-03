"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = __importDefault(require("ava"));
var sinon = __importStar(require("sinon"));
var router_1 = require("./../src/router");
var utils = __importStar(require("../src/support/utils"));
ava_1.default.beforeEach(function (t) {
    router_1.router.setRoutes({});
});
ava_1.default.serial('should add get route', function (t) {
    var _a;
    var method = 'GET';
    var handler = function (request, response) { };
    var expected = (_a = {},
        _a[method] = [{
                handler: handler,
                params: {},
                path: /^\/route$/,
                method: method,
                query: {}
            }],
        _a);
    router_1.router.get('/route', handler);
    t.deepEqual(router_1.router.getRoutes(), expected);
});
ava_1.default.serial('should add post route', function (t) {
    var _a;
    var method = 'POST';
    var handler = function (request, response) { };
    var expected = (_a = {},
        _a[method] = [{
                handler: handler,
                params: {},
                path: /^\/route$/,
                method: method,
                query: {}
            }],
        _a);
    router_1.router.post('/route', handler);
    t.deepEqual(router_1.router.getRoutes(), expected);
});
ava_1.default.serial('should add multiple routes', function (t) {
    var handler = function (request, response) { };
    var expected = {
        GET: [{
                handler: handler,
                params: {},
                path: /^\/route$/,
                method: 'GET',
                query: {}
            }, {
                handler: handler,
                params: { 'id': undefined },
                path: /^\/route\/([A-Za-z0-9_-]+)$/,
                method: 'GET',
                query: {}
            }],
        DELETE: [{
                handler: handler,
                params: { 'id': undefined },
                path: /^\/route\/([A-Za-z0-9_-]+)$/,
                method: 'DELETE',
                query: {}
            }]
    };
    router_1.router.get('/route', handler);
    router_1.router.get('/route/:id', handler);
    router_1.router.delete('/route/:id', handler);
    t.deepEqual(router_1.router.getRoutes(), expected);
});
ava_1.default.serial('should return empty array when no routes defined', function (t) {
    t.deepEqual(router_1.router.checkRoute('/route', 'GET'), []);
});
ava_1.default.serial('should verify correct route', function (t) {
    var method = 'GET';
    var handler = function (request, response) { };
    var expected = {
        handler: handler,
        params: {},
        path: /^\/route$/,
        method: method,
        query: {}
    };
    router_1.router.get('/route', handler);
    router_1.router.get('/route/:id', handler);
    t.deepEqual(router_1.router.checkRoute('/route', 'GET'), [expected]);
});
ava_1.default.serial('should verify correct route with param', function (t) {
    var method = 'GET';
    var handler = function (request, response) { };
    var expected = {
        handler: handler,
        params: { id: '10' },
        path: /^\/route\/([A-Za-z0-9_-]+)$/,
        method: method,
        query: {}
    };
    router_1.router.get('/route', handler);
    router_1.router.get('/route/:id', handler);
    t.deepEqual(router_1.router.checkRoute('/route/10', 'GET'), [expected]);
});
ava_1.default.serial('calling verify should show deprecated message', function (t) {
    sinon.spy(utils, 'deprecated');
    router_1.router.verifyRoute('/route/10', 'GET');
    t.true(utils.deprecated.calledWith('verifyRoute', 'checkRoute'));
});
ava_1.default.serial('should verify correct route with query params', function (t) {
    var method = 'GET';
    var handler = function (request, response) { };
    var expected = {
        handler: handler,
        params: {},
        path: /^\/route$/,
        method: method,
        query: {
            limit: '10',
            offset: '2'
        }
    };
    router_1.router.get('/route', handler);
    t.deepEqual(router_1.router.checkRoute('/route?limit=10&offset=2', 'GET'), [expected]);
});
ava_1.default.serial('should verify correct grouped route', function (t) {
    var method = 'POST';
    var group = 'v1';
    var handler = function (request, response) { };
    var expected = {
        handler: handler,
        params: {},
        path: /^\/v1\/login$/,
        method: method,
        query: {}
    };
    var routes = [{
            method: 'post',
            path: 'login',
            params: {},
            query: {},
            handler: handler
        }, {
            method: 'post',
            path: 'register',
            params: {},
            query: {},
            handler: handler
        }];
    router_1.router.group(group, routes);
    t.deepEqual(router_1.router.checkRoute(group + "/login", method), [expected]);
});
