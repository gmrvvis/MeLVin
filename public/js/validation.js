var formValidation = {};

function validateForm(){
   var inputs = $("input");
   if(inputs.length === Object.keys(formValidation).length){
       var valid = true;
       inputs.each(function () {
          if(!formValidation[this.name]) valid = false;
       });

       //$("button").prop("disabled", !valid);
   }
}

function validateRecovery(username_email) {
    var validEmail = validateEmailFormat(username_email);
    var validUsername = validateUsernameFormat(username_email);
    highlight(username_email, validUsername || validEmail , "\""+username_email.value+"\" is not a valid email neither an username.");
}


function validateEmailFormat(email) {
    var valid = validator.isEmail(email.value);
    highlight(email, valid, "Email is not a valid email.");
    return valid;
}

function validateEmail(email) {
    var valid = validateEmailFormat(email);
    if (valid) {
        $.ajax({
            type: "POST",
            url: "/check_email",
            data: {email: email.value},
            success: function (result) {
                if (!result.error) {
                    valid = valid && !result.emailFound;
                    highlight(email, valid, "Email already registered.")
                }
            }
        });
    }
}

function validateUsernameFormat(username) {
    var valid = validator.isAlphanumeric(username.value) && username.value.length <= 12;
    highlight(username, valid, "Username can only be alphanumeric and 12 characters long");
    return valid;
}

function validateUsername(username) {
    var valid = validateUsernameFormat(username);
    if (valid) {
        $.ajax({
            type: "POST",
            url: "/check_username",
            data: {username: username.value},
            success: function (result) {
                if (!result.error) {
                    valid = valid && !result.usernameFound;
                    highlight(username, valid, "Username already registered.")
                }
            }
        });
    }
}

function validatePassword(password) {
    var valid = validator.isAscii(password.value);
    highlight(password, valid, "Not a validad password");
}

function checkPassword(password) {
    var passwordsDOM = $("input[type='password']");
    var passwords = passwordsDOM.map(function () {
        return this.value
    }).get();
    var passwordEqual = true;
    passwords.forEach(function (password) {
        if (password !== passwords[0]) passwordEqual = false;
    });
    highlight(password, passwordEqual,"Passwords don't match");
}
function highlight(elem, value, message) {
    var parent = $(elem).closest(".form-group");
    if (value) {
        parent.removeClass("has-error");
        parent.addClass("has-success");
    }
    else {
        parent.removeClass("has-success");
        parent.addClass("has-error");
    }
    parent.children("span").first().prop("innerText",message)
    formValidation[elem.name] = value;
    validateForm();
}