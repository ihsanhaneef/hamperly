// middleware/validators/categoryValidator.js (restored and adjusted)
const { body } = require("express-validator");
const logger = require("../../config/logger");

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; 

const categoryCreationRules = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Category name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Category name must be between 2 and 50 characters")
      .trim()
      .escape(),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters")
      .trim()
      .escape(),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("Status must be a boolean value"),
    body("image").custom((value, { req }) => {
      if (req.file) {
        if (!req.file.mimetype.startsWith("image/")) {
          throw new Error("Uploaded file must be an image"); 
        }
        if (req.file.size > MAX_IMAGE_SIZE) {
          throw new Error("Image size must not exceed 5MB"); 
        }
      }
      return true;
    }),
  ];
};

const categoryUpdateRules = () => {
  return [
    body().custom((value, { req }) => {
      // Adding similar logging for update consistency
      logger.info("=== Category Update Request ===");
      logger.info("Name:", req.body.name);
      logger.info("Description:", req.body.description);
      logger.info("IsActive:", req.body.isActive);
      logger.info("Complete Body:", JSON.stringify(req.body, null, 2));
      logger.info("File:", req.file);
      logger.info("Headers:", req.headers["content-type"]);
      logger.info("=== End Request ===");
      return true;
    }),
    body("name")
      .notEmpty()
      .withMessage("Category name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Category name must be between 2 and 50 characters")
      .trim()
      .escape(),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters")
      .trim()
      .escape(),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("Status must be a boolean value"),
    body("image").custom((value, { req }) => {
      if (req.file) {
        // Check mimetype
        if (!req.file.mimetype.startsWith("image/")) {
          throw new Error("Uploaded file must be an image"); // This message will be shown
        }
        // Check file size
        if (req.file.size > MAX_IMAGE_SIZE) {
          throw new Error("Image size must not exceed 5MB"); // This message will be shown
        }
      }
      return true;
    }),
  ];
};

module.exports = {
  categoryCreationRules,
  categoryUpdateRules,
};
