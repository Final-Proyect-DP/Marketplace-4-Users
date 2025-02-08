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
 * /users/{userToSearch}:
 *   get:
 *     tags: [Users]
 *     summary: Get user information
 *     description: Get information about a user. The userToSearch is the target user ID, and requesterId in query is who makes the request
 *     parameters:
 *       - in: path
 *         name: userToSearch
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to search information about
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
 *         description: ID of the user making the request
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
router.get('/:userToSearch', 
  (req, res, next) => {
    // Añadir el requesterId al query params para el middleware de autenticación
    req.query.id = req.query.requesterId;
    next();
  },
  verifyToken, 
  handleAuthError, 
  async (req, res) => {
    const userToSearch = req.params.userToSearch;
    const requesterId = req.query.requesterId;

    if (!requesterId) {
      return res.status(400).json({ message: 'Requester ID is required' });
    }

    try {
      const user = await User.findById(userToSearch, 'username email firstName lastName address phone semester parallel career description');
      
      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`User data retrieved. Requester: ${requesterId}, SearchedUser: ${userToSearch}`);
      res.json(user);
    } catch (err) {
      const { status, response } = handleErrors(err);
      res.status(status).json(response);
    }
});

module.exports = router;
