import request from "supertest"
import server from "../../server"
import Product from "../../models/Product.model"

//! Sección: Pruebas para la ruta POST /api/products
describe('POST /api/products', () => {
    
    //? Valida que se devuelvan errores de validación cuando se envía un objeto vacío
    it('should display validation errors', async () => {
        const response = await request(server).post('/api/products').send({})
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(4) // Se esperan 4 errores de validación

        // Negaciones
        expect(response.status).not.toBe(404)
        expect(response.body.errors).not.toHaveLength(2)
    })

    //? Valida que el precio sea mayor que 0
    it('should validate that the price is greater than 0', async () => {
        const response = await request(server).post('/api/products').send({
            name: 'Monitor Curvado',
            price: 0
        })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1) // Error porque el precio no es válido

        // Negaciones
        expect(response.status).not.toBe(404)
        expect(response.body.errors).not.toHaveLength(2)
    })

    //? Valida que el precio sea un número y mayor que 0
    it('should validate that the price is a number and greater than 0', async () => {
        const response = await request(server).post('/api/products').send({
            name: 'Monitor Curvado',
            price: "Hola" // Precio no numérico
        })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(2) // Se esperan 2 errores: no es un número y menor que 0

        // Negaciones
        expect(response.status).not.toBe(404)
        expect(response.body.errors).not.toHaveLength(4)
    })

    //? Valida que se pueda crear un nuevo producto correctamente
    it('should create a new product', async () => {
        const response = await request(server).post('/api/products').send({
            name: "Mouse - Testing",
            price: "50"
        })
        expect(response.status).toBe(201) // Se espera un código 201 al crear un producto
        expect(response.body).toHaveProperty('data');// El cuerpo debe contener los datos del producto creado

        // Negaciones
        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('errors')
    })

    //? Simula un error en la creación de un producto para cubrir el bloque catch
    it('should handle database errors during product creation', async () => {
        // Simula un error en Product.create()
        jest.spyOn(Product, 'create').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(server).post('/api/products').send({
            name: "Error Product",
            price: "100"
        });

        expect(response.status).toBe(500);  // Verifica que el código de estado es 500
        expect(response.body).toHaveProperty('error', 'Database error');  // Verifica el mensaje de error
    });

    // Restaurar mocks después de cada prueba
    afterEach(() => {
        jest.restoreAllMocks();  // Restaura todos los mocks después de cada prueba
    });
})

//! Sección: Pruebas para la ruta GET /api/products
describe('GET /api/products', () => { 

    //? Valida que la URL /api/products exista
    it('should check if api/products url exists', async () => {
        const response = await request(server).get('/api/products')
        expect(response.status).not.toBe(404); // La ruta debe existir
    })

    //? Valida que se devuelva una respuesta JSON con los productos
    it('GET a JSON response with products', async () => {
        const response = await request(server).get('/api/products')
        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toMatch(/json/)
        expect(response.body).toHaveProperty('data') // Debe contener la propiedad 'data'
        expect(response.body.data).toHaveLength(1) // Se espera que haya un producto en la respuesta

        // Negaciones
        expect(response.status).not.toBe(404)
        expect(response.body).not.toHaveProperty('errors')
    })

    //? Simula un error en la consulta a la base de datos para cubrir el bloque catch
    it('should handle database errors', async () => {
        // Simula un error en Product.findAll()
        jest.spyOn(Product, 'findAll').mockRejectedValueOnce(new Error('Database error'))

        const response = await request(server).get('/api/products')

        expect(response.status).toBe(500)  // Verifica que el código de estado es 500
        expect(response.body).toHaveProperty('error', 'Database error')  // Verifica el mensaje de error
    })

    // Restaurar mocks después de cada prueba
    afterEach(() => {
        jest.restoreAllMocks();  // Restaura todos los mocks después de cada prueba
    });
});

//! Sección: Pruebas para la ruta GET /api/products/:id
describe('GET /api/products', () => { 
    
    //? Valida que se devuelva un 404 para un producto no existente
    it('Should return a 404 response for a non-existent product', async () => {
        const productId = 2000
        const response = await request(server).get(`/api/products/${productId}`)
        expect(response.status).toBe(404) // El producto no existe, se espera un 404
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Producto no encontrado')
    })

    //? Valida que el ID en la URL sea válido
    it('Should check a valid ID in the URL', async () => {
        const response = await request(server).get('/api/products/not-valid-url')
        expect(response.status).toBe(400) // El ID no es válido, se espera un 400
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('ID no válido') // El mensaje de error esperado
    })

    //? Valida que se obtenga un producto existente
    it('get a JSON response for a single product', async () => {
        const response = await request(server).get('/api/products/1')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data') // Debe contener los datos del producto

        // Negaciones
        expect(response.status).not.toBe(404)
        expect(response.body).not.toHaveProperty('error')
    })

    //? Simula un error en la consulta a la base de datos para cubrir el bloque catch
    it('should handle database errors when fetching a product by ID', async () => {
        // Simula un error en Product.findByPk()
        jest.spyOn(Product, 'findByPk').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(server).get('/api/products/1');

        expect(response.status).toBe(500);  // Verifica que el código de estado es 500
        expect(response.body).toHaveProperty('error', 'Database error');  // Verifica el mensaje de error
    });

    // Restaurar mocks después de cada prueba
    afterEach(() => {
        jest.restoreAllMocks();  // Restaura todos los mocks después de cada prueba
    });
})

//! Sección: Pruebas para la ruta PUT /api/products/:id
describe('PUT /api/products/id:', () => {

    //? Valida que el ID en la URL sea válido al actualizar un producto
    it('Should check a valid ID in the URL', async () => {
        const response = await request(server)
                                    .put('/api/products/not-valid-url')
                                    .send({
                                        name: "Monitor Curvo",
                                        availability: true,
                                        price: 300,
                                    })
        expect(response.status).toBe(400); // El ID no es válido, se espera un 400
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('ID no válido') // El mensaje de error esperado
    })

    //? Valida que se devuelvan errores de validación al intentar actualizar un producto sin datos
    it('Should display validation errors messages when updating a product', async () => {
        const response = await request(server).put('/api/products/1').send({})
        expect(response.status).toBe(400) // Se esperan errores de validación
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(5) // Se esperan 5 errores de validación

        // Negaciones
        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    //? Valida que el precio sea mayor que 0 al actualizar un producto
    it('Should validate that the price is greater than 0', async () => {
        const response = await request(server)
                                .put('/api/products/1')
                                .send({
                                    name: "Monitor Curvo",
                                    availability: true,
                                    price: 0
                                })
        expect(response.status).toBe(400); // El precio no es válido, se espera un 400
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('El precio no es válido') // El mensaje de error esperado

        // Negaciones
        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    //? Valida que el producto exista
    it('Should return to 404 response for a non-existent product', async () => {
        const productId = 2000
        const response = await request(server)
                                .put(`/api/products/${productId}`)
                                .send({
                                    name: "Monitor Curvo",
                                    availability: true,
                                    price: 300
                                })
        expect(response.status).toBe(404) // El precio no es válido, se espera un 404
        expect(response.body.error).toBe('Producto no encontrado')
       
        // Negaciones
        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    //? Valida que el producto se actualiza
    it('Should update an existing product with valid data', async () => {
    
        const response = await request(server)
                                .put(`/api/products/1`)
                                .send({
                                    name: "Monitor Curvo",
                                    availability: true,
                                    price: 300
                                })
        expect(response.status).toBe(200) // El precio se modifica correctamente
        expect(response.body).toHaveProperty('data')
       
        // Negaciones
        expect(response.status).not.toBe(400)
        expect(response.body).not.toHaveProperty('errors')
    })

    //? Simula un error durante la actualización del producto para cubrir el bloque catch
    it('Should handle database errors during product update', async () => {
        // Simula un error en Product.findByPk()
        jest.spyOn(Product, 'findByPk').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(server)
                                .put(`/api/products/1`)
                                .send({
                                    name: "Error Product",
                                    availability: true,
                                    price: 300
                                });

        expect(response.status).toBe(500); // Verifica que el código de estado es 500
        expect(response.body).toHaveProperty('error', 'Database error'); // Verifica el mensaje de error
    });

    // Restaurar mocks después de cada prueba
    afterEach(() => {
        jest.restoreAllMocks();  // Restaura todos los mocks después de cada prueba
    });
})

//! Sección: Pruebas para la ruta PATCH /api/products/:id
describe('PATCH /api/products/:id', () => {
    
    //? Valida que se devuelva un 404 para un producto no existente
    it('Should return a 404 response for a non-existing product', async () => {
        const productId = 2000
        const response = await request(server).patch(`/api/products/${productId}`)
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Producto no encontrado')

        // Negaciones
        expect(response.status).not.toBe(200)
        expect(response.body).not.toHaveProperty('data')
    })

    //? Valida que se actualice la disponibilidad del producto
    it('Should update the product availability', async () => {
        const response = await request(server).patch('/api/products/1')

        expect(response.status).toBe(200) // Se espera un código 200 si la actualización fue exitosa
        expect(response.body.data.availability).toBe(false)

        // Negaciones
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(400)
        expect(response.body).not.toHaveProperty('error')
    })

    //? Simula un error en la actualización de disponibilidad para cubrir el bloque catch
    it('should handle database errors during availability update', async () => {
        // Simula un error en Product.findByPk()
        jest.spyOn(Product, 'findByPk').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(server).patch('/api/products/1');

        expect(response.status).toBe(500); // Verifica que el código de estado es 500
        expect(response.body).toHaveProperty('error', 'Database error'); // Verifica el mensaje de error
    })

    afterEach(() => {
        jest.restoreAllMocks(); // Restaurar todos los mocks después de cada prueba
    })
})

//! Sección: Pruebas para la ruta DELETE /api/products/:id
describe('PUT /api/products/id:', () => {

    //? Valida que el ID sea válido
    it('Should check a valid ID',async () => {
        const response = await request(server).delete('/api/products/not-valid')
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe('ID no válido')
    })

    //? Valida que el producto no exista
    it('Should return a 404 response for a non-existent product',async () => {
        const productId = 2000
        const response = await request(server).delete(`/api/products/${productId}`)
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Producto no encontrado')

         // Negaciones
         expect(response.status).not.toBe(200)
    })

    //? Valida que el producto se borre correctamente
    it('Should delete product',async () => {
        const response = await request(server).delete('/api/products/1')
        expect(response.status).toBe(200) // El producto se borra correctamente
        expect(response.body.data).toBe('Producto eliminado')

         // Negaciones
         expect(response.status).not.toBe(404)
         expect(response.status).not.toBe(400)
    })

    //? Simula un error en la eliminación para cubrir el bloque catch
    it('should handle database errors during product deletion', async () => {
        // Simula un error en Product.findByPk()
        jest.spyOn(Product, 'findByPk').mockRejectedValueOnce(new Error('Database error'));

        const response = await request(server).delete('/api/products/1');

        expect(response.status).toBe(500); // Verifica que el código de estado es 500
        expect(response.body).toHaveProperty('error', 'Database error'); // Verifica el mensaje de error
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restaurar todos los mocks después de cada prueba
    })
})