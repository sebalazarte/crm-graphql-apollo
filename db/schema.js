const { gql } = require("apollo-server");

//schema
const typeDefs = gql`
    type Query {
        holaMundo: String
    }
`;

module.exports = typeDefs;