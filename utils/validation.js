/**
 * Validates that the body contains the required fields and that they are not empty.
 * @param {Object} body - The request body (req.body).
 * @param {Array<string>} fields - The list of required field names.
 * @returns {Array<string>} - An array of missing or empty field names.
 */
exports.validateFields = (body, fields) => {
    const missingFields = [];
    fields.forEach(field => {
        if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
            missingFields.push(field);
        }
    });
    return missingFields;
};
