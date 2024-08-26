import express from 'express'
import colors from 'colors'
import cors, { CorsOptions } from 'cors'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec, { swaggerUiOptions } from './config/swagger'
import router from './router'
import db from './config/db'
import path from 'path' 

//! -----------------------------------
//! Conexión a la Base de Datos
//! -----------------------------------
export async function connectDB() {
    try {
        await db.authenticate()
        db.sync()
    } catch (error) {
        console.log(colors.red.bold('Hubo un error al conectarse a la BBDD'))
    }
}
connectDB()

//! -----------------------------------
//! Configuración de Express y Middlewares
//! -----------------------------------
const server = express()

//? Permitir conexiones CORS
const corsOptions: CorsOptions = {
    origin: function(origin, callback) {
        if(origin === process.env.FRONTEND_URL) {
            callback(null, true)
        } else {
            callback(new Error('Error de Cors'))
        } 
    }
}
server.use(cors(corsOptions))

//? Leer datos de formularios en formato JSON
server.use(express.json())

//? Configurar la carpeta pública para archivos estáticos
server.use('/public', express.static(path.join(__dirname, 'public')))

//? Logger de solicitudes HTTP
server.use(morgan('dev'))

//! -----------------------------------
//! Rutas de la API y Documentación
//! -----------------------------------
//? Registrar el enrutador principal
server.use('/api/products', router)

//? Documentación Swagger
server.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))

//! -----------------------------------
//! Exportar servidor
//! -----------------------------------
export default server
