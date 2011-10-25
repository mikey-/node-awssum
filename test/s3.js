// --------------------------------------------------------------------------------------------------------------------
//
// s3.js - test for AWS Simple Notification Service
//
// Copyright (c) 2011 AppsAttic Ltd - http://www.appsattic.com/
// Written by Andrew Chilton <chilts@appsattic.com>
//
// License: http://opensource.org/licenses/MIT
//
// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// requires

var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    _ = require('underscore');
var amazon;
var s3Service;

// --------------------------------------------------------------------------------------------------------------------
// basic tests

test("load s3", function (t) {
    s3Service = require("../lib/s3");
    t.ok(s3Service, "object loaded");

    amazon = require("../lib/amazon");
    t.ok(amazon, "object loaded");

    t.end();
});

test("create s3 object", function (t) {
    var s3 = new s3Service.S3('access_key_id', 'secret_access_key', 'aws_account_id', amazon.US_WEST_1);

    t.equal('access_key_id', s3.accessKeyId(), 'Access Key ID set properly');
    t.equal('secret_access_key', s3.secretAccessKey(), 'Secret Access Key set properly');
    t.equal('aws_account_id', s3.awsAccountId(), 'AWS Account ID set properly');
    t.equal('California', s3.region(), 'Region is set properly');

    t.end();
});

test("test all endpoints", function (t) {
    var s31 = new s3Service.S3('access_key_id', 'secret_access_key', 'aws_account_id', amazon.US_EAST_1);
    var s32 = new s3Service.S3('access_key_id', 'secret_access_key', 'aws_account_id', amazon.US_WEST_1);
    var s33 = new s3Service.S3('access_key_id', 'secret_access_key', 'aws_account_id', amazon.EU_WEST_1);
    var s34 = new s3Service.S3('access_key_id', 'secret_access_key', 'aws_account_id', amazon.AP_SOUTHEAST_1);
    var s35 = new s3Service.S3('access_key_id', 'secret_access_key', 'aws_account_id', amazon.AP_NORTHEAST_1);

    t.equal('s3.amazonaws.com', s31.endPoint(), '1) Endpoint is correct');
    t.equal('s3.us-west-1.amazonaws.com', s32.endPoint(), '2) Endpoint is correct');
    t.equal('s3.eu-west-1.amazonaws.com', s33.endPoint(), '3) Endpoint is correct');
    t.equal('s3.ap-southeast-1.amazonaws.com', s34.endPoint(), '4) Endpoint is correct');
    t.equal('s3.ap-northeast-1.amazonaws.com', s35.endPoint(), '5) Endpoint is correct');

    t.end();
});

test("test strToSign", function (t) {
    var s3 = new s3Service.S3('access_key_id', 'secret_access_key', 'aws_account_id', amazon.US_WEST_1);

    var strToSignEmpty1 = s3.strToSign(undefined, undefined, 'GET', '/', {}, []);
    t.equal(strToSignEmpty1, "GET\n\n\n\n/", 'strToSign of ListBuckets');

    // set up some generic headers first
    var headers = {};
    headers.Date = "Mon, 26 Oct 2011 16:07:36 Z";

    // test an initial string
    var strToSign = s3.strToSign('bulk', undefined, 'POST', '/', headers, []);
    t.equal(strToSign, "POST\n\n\nMon, 26 Oct 2011 16:07:36 Z\n/bulk/", 'strToSign of common params');

    // do a subresource test
    var strToSign2 = s3.strToSign('bulk', undefined, 'POST', '/', headers, [{name:'versioning'}]);
    t.equal(
        strToSign2,
        "POST\n\n\nMon, 26 Oct 2011 16:07:36 Z\n/bulk/?versioning",
        'strToSign with subresource of versioning'
    );

    // do a subresource test
    var strToSign3 = s3.strToSign('bulk', undefined, 'POST', '/', headers, [{name:'website'}]);
    t.equal(
        strToSign3,
        "POST\n\n\nMon, 26 Oct 2011 16:07:36 Z\n/bulk/?website",
        'strToSign with subresource of website'
    );

    t.end();
});

test("test signature", function (t) {
    var s3 = new s3Service.S3('access_key_id', 'secret_access_key', 'aws_account_id', amazon.US_WEST_1);

    var strToSign = "GET\n\n\nTue, 25 Oct 2011 03:09:21 UTC\n/";
    var sig = s3.signature(strToSign);
    t.equal(sig, 'OFs3nLlSvlN6EaeNy/IluZpS+E8=', 'signature of ListBuckets request');

    var strToSign2 = "GET\n\n\nTue, 25 Oct 2011 03:09:21 UTC\n/bulk/?versioning";
    var sig2 = s3.signature(strToSign2);
    t.equal(sig2, 'zxmJifiGCl8WgMu2XLaiEx0o5Wo=', 'signature of ListBuckets request with versioning');

    t.end();
});

// --------------------------------------------------------------------------------------------------------------------