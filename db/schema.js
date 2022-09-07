const { gql } = require("apollo-server");

//schema
const typeDefs = gql`

    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }

    type Producto {
        id: ID,
        nombre: String
        existencia: Int
        precio: Float
        creado: String
    }

    type Token {
        token: String
    }

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    input ProductoInput {
        nombre: String!
        existencia: Int!
        precio: Float!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    type Query {
        obtenerUsuarioAutenticado(token: String!): Usuario
    }

    type Mutation {
        #Usuarios
        nuevoUsuario(input: UsuarioInput): Usuario,
        autenticarUsuario(input: AutenticarInput): Token,

        #Productos
        nuevoProducto(input: ProductoInput): Producto
    }

`;

module.exports = typeDefs;