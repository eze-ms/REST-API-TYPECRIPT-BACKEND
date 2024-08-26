import swaggerJSDoc from "swagger-jsdoc";
import { SwaggerUiOptions } from "swagger-ui-express";

const options :swaggerJSDoc.Options = { 
    swaggerDefinition: {
        openapi: '3.0.2',
        tags: [
            {
                name: 'Products',
                description: 'API operations related to products'
            }
        ],
        info: {
            title: 'REST API Node.JS / Express / Typescript',
            version: "1.0.0",
            description: "API Docs for Products"
        }
    },
    apis: ['./src/router.ts']
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerUiOptions: SwaggerUiOptions = {
    customCss: `
        .topbar-wrapper {
            width: 15%;
        }
        .topbar-wrapper .link {
            content: url('/public/img/rest-api.webp');
            height: auto;
            width: 100%; 
        }
        .swagger-ui .topbar {
            background-color: #3597d6;  
        }
    `,
    customSiteTitle: 'Documentación REST API Express / Typescript'
};

export default swaggerSpec;
export { swaggerUiOptions };
