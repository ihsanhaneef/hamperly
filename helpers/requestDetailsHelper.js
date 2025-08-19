// helpers/requestDetailsHelper.js
const getRequestDetails = (req) => {
    return {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: JSON.stringify(req.body, null, 2),  // Stringify body to JSON for structured logging
        file: req.file ? JSON.stringify(req.file, null, 2) : 'No file uploaded'  // Stringify file to JSON if present
    };
};

module.exports = getRequestDetails;
