import { Request, Response } from "express"
import Product from "../models/Product.model"

//! Controlador para obtener todos los productos (GET)
export const getProducts = async (req: Request, res: Response) => {
    try {
        // Realiza una consulta para obtener todos los productos, ordenados por precio en orden ascendente
        const products = await Product.findAll({
            order: [
                ['id', 'DESC']  // Ordena los productos por precio en orden ascendente
            ],
            attributes: {exclude: ['createdAt', 'updatedAt']} //* Excluye lo que no queramos recibir 
        })
        // Devuelve los productos en formato JSON
        res.json({ data: products })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Database error' })
    }
}

//! Controlador para obtener todos los productos por su ID (GET)
export const getProductsById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const product = await Product.findByPk(id)

        // Verifica si el producto existe
        if(!product) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }
        // Devuelve el producto en formato JSON
        res.json({data: product})
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Database error' })
    }
}

//! Controlador para crear un nuevo producto (POST)
export const createProduct = async (req: Request, res: Response) => {
    try {
        // Crea un nuevo producto con los datos recibidos en el cuerpo de la solicitud
        const product = await Product.create(req.body)
        // Devuelve el producto creado en formato JSON como respuesta
        res.status(201).json({ data: product })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Database error' })
    }
}

//! Controlador para actualizar producto (PUT)
export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        // Buscar el producto por ID
        const product = await Product.findByPk(id)

        // Verificar si el producto existe
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

         //? PUT reemplaza todos los datos del producto con los nuevos proporcionados
        product.update(req.body)
        await product.save()

        // Responder con el producto actualizado
        res.json({ data: product })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Database error' })
    }
}

//! Controlador para actualizar la disponibilidad del producto (PATCH)
export const updateAvailability = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        // Buscar el producto por ID
        const product = await Product.findByPk(id)

        // Verificar si el producto existe
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        //? PATCH solo actualiza el campo 'availability' sin modificar el resto del producto
        product.availability = !product.dataValues.availability
        await product.save()

        // Responder con el producto actualizado
        res.json({ data: product })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Database error' })
    }
}

//! Controlador para eliminar un producto
export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        // Buscar el producto por ID
        const product = await Product.findByPk(id)

        // Verificar si el producto existe
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        // Eliminar el producto (lógico)
        await product.destroy()

        // Responder con un mensaje de confirmación
        res.json({ data: 'Producto eliminado' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Database error' })
    }
}
