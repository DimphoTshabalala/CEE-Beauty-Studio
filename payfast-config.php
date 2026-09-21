<?php

/*
|--------------------------------------------------------------------------
| CEE Beauty Studio - Payfast Configuration
|--------------------------------------------------------------------------
|
| We are using the Payfast Sandbox while developing.
| Replace the placeholder values with CEE Beauty Studio's
| actual Payfast Sandbox credentials.
|
*/

define('PAYFAST_MERCHANT_ID', '10000100');
define('PAYFAST_MERCHANT_KEY', '46f0cd694581a');
define('PAYFAST_PASSPHRASE', 'jt7NOE43FZPn');

define(
    'PAYFAST_PROCESS_URL',
    'https://sandbox.payfast.co.za/eng/process'
);

/*
|--------------------------------------------------------------------------
| Website URLs
|--------------------------------------------------------------------------
|
| These will eventually point to your real .co.za website.
| For local testing, we'll configure these once the XAMPP
| version of the site is running.
|
*/

define(
    'PAYFAST_RETURN_URL',
    'http://localhost/CEE-Beauty-Studio/payment-success.php'
);

define(
    'PAYFAST_CANCEL_URL',
    'http://localhost/CEE-Beauty-Studio/checkout.html'
);

define(
    'PAYFAST_NOTIFY_URL',
    'http://localhost/CEE-Beauty-Studio/payfast-notify.php'
);