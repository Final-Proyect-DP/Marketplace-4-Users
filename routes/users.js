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
 *     description: Retrieve user information based on the provided ID and requester authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to retrieve
 *       - in: query
 *         name: requesterId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user making the request
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: User's username
 *                 email:
 *                   type: string
 *                   description: User's email address
 *                 firstName:
 *                   type: string
 *                   description: User's first name
 *                 lastName:
 *                   type: string
 *                   description: User's last name
 *                 address:
 *                   type: string
 *                   description: User's address
 *                 phone:
 *                   type: string
 *                   description: User's phone number
 *                 semester:
 *                   type: string
 *                   description: User's current semester
 *                 parallel:
 *                   type: string
 *                   description: User's parallel group
 *                 career:
 *                   type: string
 *                   description: User's career program
 *                 description:
 *                   type: string
 *                   description: User's profile description
 *       400:
 *         description: Bad Request - Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: requesterId is required
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Not Found - User or requester not found
 */
router.get('/:id', 
  verifyToken, 
  handleAuthError, 
  async (req, res) => {
  const userId = req.params.id;
  const requesterId = req.query.requesterId;

  if (!requesterId) {
    return res.status(400).json({ message: 'requesterId is required' });
  }

  try {
    const requester = await User.findById(requesterId, 'username email firstName lastName address phone semester parallel career description');
    
    if (!requester) {
      throw new Error('Requester not found');
    }

    logger.info(`User data retrieved for requesterId: ${requesterId}`);
    res.json(requester);
  } catch (err) {
    const { status, response } = handleErrors(err);
    res.status(status).json(response);
  }
});

module.exports = router;
