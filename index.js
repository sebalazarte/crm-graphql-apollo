const { conectarDB } = require("./config/db");
const { ApolloServer } = require("apollo-server");
const resolvers = require("./db/resolvers");
const typeDefs = require("./db/schema");
const jwt = require("jsonwebtoken");
require("dotenv").config("variables.env");

//servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // console.log(req.headers["authorization"]);
    const token = req.headers["authorization"] || "";
    if (token) {
      try {
        const usuario = jwt.verify(token, process.env.SECRETA);
        return{
            usuario
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
});

//arrancar el servidor
server.listen().then(({ url }) => {
  console.log(`Servidor listo en la url ${url}`);
  conectarDB();
});
