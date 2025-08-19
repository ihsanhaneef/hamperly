const logger = require("../config/logger");

// helpers/formHelper.js
// helpers/errorHelper.js
const getFieldError = (errors, field) => {
  if (!errors || !Array.isArray(errors)) return null;
  
  // Find error that matches either the field name or has a path that includes the field
  const error = errors.find(err => {
    return err.param === field || 
           err.path === field || 
           (err.errors && err.errors[0].path === field);
  });

  return error ? error.msg : null;
};

module.exports = { getFieldError };
