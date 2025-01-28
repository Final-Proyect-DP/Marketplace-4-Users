const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: user`s ID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token
 *       - in: query
 *         name: requesterId
 *         required: true
 *         schema:
 *           type: string
 *         description: Requester user ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 image:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       format: base64
 *                     contentType:
 *                       type: string
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid token
 */
router.get('/:id', async (req, res) => {
  const token = req.query.token;
  const requesterId = req.query.requesterId;
  const userId = req.params.id;

  if (!token || !requesterId) {
    return res.status(401).json({ message: 'Invalid token or requester ID' });
  }

  req.redisClient.get(requesterId, async (err, redisToken) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (redisToken !== token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    try {
      // Find the user by ID in the database
      const user = await User.findById(userId, 'username email firstName lastName address phone semester parallel career description');

      // Check if the user was found
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the user data
      res.json(user);
    } catch (err) {
      // Handle errors
      res.status(500).json({ message: err.message });
    }
  });
});

module.exports = router;
