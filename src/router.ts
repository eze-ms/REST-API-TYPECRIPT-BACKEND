import { Router } from "express"
import { body, param } from "express-validator"
import { createProduct, deleteProduct, getProducts, getProductsById, updateAvailability, updateProduct } from "./handlers/product"
import { handleInputErrors } from "./middleware"

const router = Router()

/**
 * @swagger
 *  components:
 *      schemas:
 *          Product:
 *              type: object
 *              properties:
 *                  id: 
 *                      type: integer
 *                      description: The Product ID
 *                      example: 1
 *                  name:
 *                      type: string
 *                      description: The Product name
 *                      example: Monitor Curvado de 49 pulgadas
 *                  price:
 *                      type: number
 *                      description: The Product price
 *                      example: 300
 *                  availability:
 *                      type: boolean
 *                      description: The Product availability
 *                      example: true
 */

//! -----------------------------------
//! Routes for retrieving products
//! -----------------------------------

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get a list of products
 *     tags:
 *       - Products
 *     description: Returns a list of products
 *     responses: 
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/Product'
 */
//! Routing para obtener productos
router.get('/', getProducts)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags:
 *       - Products
 *     description: Return a product based on its unique ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the product to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       400:
 *         description: Bad Request - Invalid ID
 */
//! Routing para obtener producto por ID
router.get(
  '/:id',
  param('id').isInt().withMessage('ID no válido'), // Validación del parámetro "id"
  handleInputErrors, // Middleware para manejar errores de validación
  getProductsById // Controlador para obtener un producto por ID
)

//! -----------------------------------
//! Routes for creating and updating products
//! -----------------------------------

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     description: Return a new record in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Monitor curvado de 49 pulgadas"
 *               price:
 *                 type: number
 *                 example: 399
 *     responses:
 *       201:
 *         description: Successfully response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad Request - invalid input data
 */
//! Routing para crear un producto
router.post(
  '/',
  // Validaciones de campos del cuerpo de la solicitud
  body('name').notEmpty().withMessage('El nombre del producto no puede estar vacío'),
  body('price')
    .isNumeric().withMessage('Valor no válido')
    .notEmpty().withMessage('El precio del producto no puede estar vacío')
    .custom(value => value > 0).withMessage('El precio no es válido'),
  handleInputErrors, // Middleware para manejar errores de validación
  createProduct // Controlador para crear un producto
)

//! -----------------------------------
//! Routes for edit products
//! -----------------------------------

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Updates a product with user input
 *     tags:
 *       - Products
 *     description: Returns the updated product
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the product to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Monitor curvado de 49 pulgadas"
 *               price:
 *                 type: number
 *                 example: 399
 *               availability: 
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad Request - Invalid ID or input data
 *       404:
 *         description: Product Not Found
 */
//! Routing para editar un producto
router.put('/:id', 
    param('id').isInt().withMessage('ID no válido'), // Validación del parámetro "id"
    body('name').notEmpty().withMessage('El nombre del producto no puede estar vacío'),
    body('price')
        .isNumeric().withMessage('Valor no válido')
        .notEmpty().withMessage('El precio del producto no puede estar vacío')
        .custom(value => value > 0).withMessage('El precio no es válido'),
    body('availability')
        .isBoolean().withMessage('Valor para la disponibilidad no válida '),
    handleInputErrors, //? Middleware para manejar errores de validación
    updateProduct //? Controlador para actializar el producto
)

//! -----------------------------------
//! Routes for update a product field
//! -----------------------------------

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update Product availability
 *     tags:
 *       - Products
 *     description: Returns the updated availability
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the product to update
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad Request - Invalid ID
 *       404:
 *         description: Product Not Found
 */
//! Routing para actualizar un campo del producto
router.patch('/:id', 
  param('id').isInt().withMessage('ID no válido'), // Validación del parámetro "id"
  handleInputErrors,
  updateAvailability
)

//! -----------------------------------
//! Routes for deleting products
//! -----------------------------------

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Deletes a product by ID
 *     tags:
 *       - Products
 *     description: Deletes a product from the database
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the product to delete
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Producto eliminado'
 *       404:
 *         description: Product not found
 *       400:
 *         description: Bad Request - Invalid ID
 */
//! Routing para borrar un producto
router.delete(
    '/:id', 
    param('id').isInt().withMessage('ID no válido'), 
    handleInputErrors,
    deleteProduct
  )
export default router