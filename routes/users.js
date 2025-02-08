const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Cambiado de '../models/user' a '../models/User'
const logger = require('../config/logger');
const { verifyToken, handleAuthError } = require('../middlewares/authMiddleware');
const handleErrors = require('../utils/handleErrors');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for user management
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token
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
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid token
 */
router.get('/:id', 
  verifyToken, 
  handleAuthError, 
  async (req, res) => {
  const userId = req.params.id;

  try {
    const users = await User.find({}, 'username email firstName lastName address phone semester parallel career description');
    if (!users || users.length === 0) {
      throw new Error('No users found');
    }
    logger.info('All users retrieved');
    res.json(users);
  } catch (err) {
    const { status, response } = handleErrors(err);
    res.status(status).json(response);
  }
});

module.exports = router;
