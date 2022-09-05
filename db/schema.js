const { gql } = require("apollo-server");

//schema
const typeDefs = gql`

    type Curso {
        titulo: String
    }

    type Tecnologia {
        tecnologia: String
    }

    type Query {
        obtenerCursos(input: CursoInput): [Curso],
        obtenerTecnologia: [Tecnologia]
    }

    input CursoInput {
        tecnologia: String
    }

`;

module.exports = typeDefs;