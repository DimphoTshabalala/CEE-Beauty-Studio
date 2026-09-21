<?php

require_once 'payfast-config.php';


/*
|--------------------------------------------------------------------------
| PAYFAST SIGNATURE
|--------------------------------------------------------------------------
|
| Payfast requires the submitted variables to be concatenated
| in the order they appear below, URL encoded, and then hashed
| with MD5.
|
*/

function generateSignature($data, $passPhrase = null)
{
    $pfOutput = '';

    foreach ($data as $key => $val) {

        if ($val !== '') {

            $pfOutput .=
                $key . '=' .
                urlencode(trim($val)) .
                '&';
        }
    }

    // Remove the final &
    $getString = substr($pfOutput, 0, -1);

    // Add passphrase
    if ($passPhrase !== null && $passPhrase !== '') {

        $getString .=
            '&passphrase=' .
            urlencode(trim($passPhrase));
    }

    return md5($getString);
}


/*
|--------------------------------------------------------------------------
| GET CHECKOUT DATA
|--------------------------------------------------------------------------
*/

$fullName   = trim($_POST['fullName'] ?? '');
$email      = trim($_POST['email'] ?? '');
$phone      = trim($_POST['phone'] ?? '');

$address    = trim($_POST['address'] ?? '');
$suburb     = trim($_POST['suburb'] ?? '');
$city       = trim($_POST['city'] ?? '');
$province   = trim($_POST['province'] ?? '');
$postalCode = trim($_POST['postalCode'] ?? '');

$quantity = intval($_POST['quantity'] ?? 1);


/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

if (
    $fullName === '' ||
    $email === '' ||
    $phone === '' ||
    $address === '' ||
    $suburb === '' ||
    $city === '' ||
    $province === '' ||
    $postalCode === ''
) {

    die('Please complete all required checkout details.');

}


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    die('Please provide a valid email address.');

}


if ($quantity < 1) {

    $quantity = 1;

}


/*
|--------------------------------------------------------------------------
| PRODUCT
|--------------------------------------------------------------------------
*/

$productName  = 'CEE Beauty Lace Glue';
$productPrice = 300.00;


/*
|--------------------------------------------------------------------------
| ORDER TOTAL
|--------------------------------------------------------------------------
|
| Delivery is not included yet because the Courier Guy
| delivery charge has not been confirmed.
|
*/

$amount = $productPrice * $quantity;


/*
|--------------------------------------------------------------------------
| UNIQUE PAYMENT ID
|--------------------------------------------------------------------------
*/

$paymentId =
    'CEE-' .
    date('YmdHis') .
    '-' .
    random_int(1000, 9999);


/*
|--------------------------------------------------------------------------
| SPLIT CUSTOMER NAME
|--------------------------------------------------------------------------
*/

$nameParts = preg_split(
    '/\s+/',
    $fullName,
    2
);

$firstName = $nameParts[0] ?? '';

$lastName = $nameParts[1] ?? '';


/*
|--------------------------------------------------------------------------
| PAYFAST DATA
|--------------------------------------------------------------------------
|
| Keep these fields in the same order used for
| signature generation.
|
*/

$data = [

    // Merchant details
    'merchant_id'  => PAYFAST_MERCHANT_ID,
    'merchant_key' => PAYFAST_MERCHANT_KEY,

    // Redirect URLs
    'return_url' => PAYFAST_RETURN_URL,
    'cancel_url' => PAYFAST_CANCEL_URL,
    'notify_url' => PAYFAST_NOTIFY_URL,

    // Buyer details
    'name_first'     => $firstName,
    'name_last'      => $lastName,
    'email_address'  => $email,

    // Transaction details
    'm_payment_id' => $paymentId,

    'amount' => number_format(
        $amount,
        2,
        '.',
        ''
    ),

    'item_name' =>
        $productName . ' x ' . $quantity
];


/*
|--------------------------------------------------------------------------
| GENERATE SIGNATURE
|--------------------------------------------------------------------------
*/

$data['signature'] = generateSignature(
    $data,
    PAYFAST_PASSPHRASE
);


/*
|--------------------------------------------------------------------------
| DEBUGGING
|--------------------------------------------------------------------------
|
| Remove this section once payment testing is complete.
|
*/

if (isset($_GET['debug'])) {

    echo '<pre>';

    echo "PAYFAST PARAMETER STRING\n\n";

    $debugString = '';

    foreach ($data as $key => $value) {

        if ($key !== 'signature' && $value !== '') {

            $debugString .=
                $key . '=' .
                urlencode(trim($value)) .
                '&';
        }
    }

    $debugString =
        substr($debugString, 0, -1);

    $debugString .=
        '&passphrase=' .
        urlencode(trim(PAYFAST_PASSPHRASE));

    echo htmlspecialchars($debugString);

    echo "\n\nSIGNATURE:\n";
    echo htmlspecialchars($data['signature']);

    echo '</pre>';

    exit;
}

?>

<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Secure Payment | CEE Beauty Studio
    </title>

</head>


<body>

    <p>
        Redirecting to secure payment...
    </p>


    <form
        id="payfast-form"
        action="<?= htmlspecialchars(PAYFAST_PROCESS_URL) ?>"
        method="post"
    >

        <?php foreach ($data as $name => $value): ?>

            <input
                type="hidden"
                name="<?= htmlspecialchars($name) ?>"
                value="<?= htmlspecialchars($value) ?>"
            >

        <?php endforeach; ?>


        <noscript>

            <button type="submit">
                Continue to Payfast
            </button>

        </noscript>

    </form>


    <script>

        document
            .getElementById("payfast-form")
            .submit();

    </script>

</body>

</html>