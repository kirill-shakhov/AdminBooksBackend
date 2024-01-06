module.exports = (req, res, next) => {
    if (req.fileValidationError) {
        return res.status(400).json({message: req.fileValidationError});
    }
    next();
};

