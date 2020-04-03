"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("./../src/router");
var handler = function (request, response) {
    console.log('request: %o, response: %o', request, response);
};
router_1.router.delete('/users', handler);
router_1.router.get('/users', handler);
router_1.router.patch('/users', handler);
router_1.router.post('/users', handler);
router_1.router.put('/users', handler);
router_1.router.get('/users/:id', handler)
    .get('/users/favorites/:id', handler);
router_1.router.checkRoute('/users', 'DELETE');
router_1.router.checkRoute('/users', 'GET');
router_1.router.checkRoute('/users', 'PATCH');
router_1.router.checkRoute('/users', 'POST');
router_1.router.checkRoute('/users', 'PUT');
router_1.router.checkRoute('/users/1', 'GET');
router_1.router.checkRoute('/users/favorites/1', 'GET');
// checkRoute method return a array with all routes that match the pattern
router_1.router.checkRoute('/users?limit=10&offset=2', 'GET').forEach(function (route) {
    var request = {
    // params: route.params,
    // query: route.query
    };
    var response = {};
    route.handler(request, response);
});
router_1.router.setRoutes({});
console.log('Routes: %o', router_1.router.getRoutes());
var groupRoutes = [{
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
router_1.router.group('v1', groupRoutes);
console.log(router_1.router.checkRoute('/v1/login', 'POST'));
console.log(router_1.router.verifyRoute('/v1/login', 'POST'));
console.log('Routes: %o', router_1.router.getRoutes());
