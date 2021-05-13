let responseMessages = {
    PARAMETER_MISSING: "Insufficient information was supplied. Please check and try again.",
    ACTION_COMPLETE: "Successful",
    BAD_REQUEST: "Invalid Request",
    AUTHENTICATION_FAILED: "Authentication failed",
    ACTION_FAILED: "Something went wrong.Please try again",
    INCORRECT_PASSWORD: "Incorrect Password"

};

let responseFlags = {
    PARAMETER_MISSING: 100,
    ACTION_COMPLETE: 200,
    BAD_REQUEST: 400,
    AUTHENTICATION_FAILED: 401,
    ACTION_FAILED: 410,
    PERMISSION_NOT_ALLOWED: 403

};

exports.languagesPoster = {
    ENGLISH: 1,
    HINDI: 2,
    BILINGUAL: 3
}


exports.tokenDetails = {
    TOKENSECRET: "EHSPRINTSHELLO"

}

exports.getOtpCreation = function() {
    var otp = Math.floor(100000 + Math.random() * 900000);
    const ttl = 5 * 60 * 1000;
    const expires = Date.now() + ttl;
    return {
        otp: otp,
        expires_in: expires
    }
}

exports.autoCreateSlug = function(text) {
    text = "" + text // toString
    text = text.replace(/[^a-zA-Z ]/g, ""); // replace all special char 
    text = text.replace(/\s\s+/g, ' ');

    text = text.trim() //trim text
    text = text.replace(/ /g, "-"); // replace all special char 
    text = text.toLowerCase();
    if (!text) {
        text = 'slg-' + Math.floor(Math.random() * (999 - 100 + 1) + 100);
    }
    // $text = preg_replace('~[^\pL\d]+~u', '-', $text); // replace non letter or digits by -
    // $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text); // transliterate
    // $text = preg_replace('~[^-\w]+~', '', $text); // remove special characters
    // $text = trim($text, '-'); // trim
    // $text = preg_replace('~-+~', '-', $text); // remove duplicate -
    // $text = strtolower($text); // lowercase
    // if (empty($text)) {
    //   return 'n-a';
    // }
    return text;
}

exports.operationType = {
    PUSH: 1,
    PULL: 2,
    REPLACE: 3
}

exports.actionCompleteResponse = function(res, data, msg) {
    var response = {
        success: 1,
        message: msg || responseMessages.ACTION_COMPLETE,
        status: responseFlags.ACTION_COMPLETE,
        data: data || {}
    };
    res.status(responseFlags.ACTION_COMPLETE).send(JSON.stringify(response));
}

exports.authenticationFailed = function(res, msg, data) {
    var response = {
        success: 0,
        message: msg || 'Authentication Failed',
        status: responseFlags.AUTHENTICATION_FAILED,
        data: data || {}
    }
    res.status(responseFlags.AUTHENTICATION_FAILED).send(response);
}


exports.sendActionFailedResponse = function(res, data, msg) {
    var response = {
        success: 0,
        message: msg || responseMessages.ACTION_FAILED,
        status: responseFlags.ACTION_FAILED,
        data: data || {}
    }

    return res.status(responseFlags.ACTION_FAILED).send(response);
};