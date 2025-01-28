const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de autenticación
 *     responses:
 *       200:
 *         description: Usuario encontrado
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
 *         description: Usuario no encontrado
 *       401:
 *         description: Token no válido
 */
router.get('/:id', async (req, res) => {
  const token = req.query.token;
  const userId = req.params.id;

  if (!token) {
    return res.status(401).json({ message: 'Token no válido' });
  }

  req.redisClient.get(userId, async (err, redisToken) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (redisToken !== token) {
      return res.status(401).json({ message: 'Token no válido' });
    }

    try {
      // Buscar todos los usuarios en la base de datos
      const users = await User.find({}, 'username email firstName lastName address phone semester parallel career description');

      // Verificar si se encontraron usuarios
      if (users.length === 0) {
        return res.status(404).json({ message: 'No se encontraron usuarios' });
      }

      // Devolver la lista de usuarios
      res.json(users);
    } catch (err) {
      // Manejar errores
      res.status(500).json({ message: err.message });
    }
  });
});

module.exports = router;
