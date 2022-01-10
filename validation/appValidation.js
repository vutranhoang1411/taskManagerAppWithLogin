const {body} = require('express-validator');

function userValidation() {
    return [
      // Validate email format
      body('username').isEmail().withMessage('Must be a valid email address.'),
      // Validate password length
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
      // Validate passwords match
      body('passwordConfirm').custom((value, { req }) => {
        if (value === req.body.password) {
          return true;
        } else {
          return false;
        }
      }).withMessage('Those passwords do not match. Try again.')
    ];
};

module.exports=userValidation;