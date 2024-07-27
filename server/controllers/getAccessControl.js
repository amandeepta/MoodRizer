const User = require('../models/User');
exports.getAccessControl = async (req, res) => {
    try {
        const id = req.id;
        const user = await User.findOne({ spotifyId: id });
        if (user) {
            res.json(user.accessToken);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

