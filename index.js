const { conectarDB } = require('./config/db');
const { ApolloServer } = require("apollo-server");
const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema');

//servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {

        return {
        }
    }
});


//arrancar el servidor
server.listen().then(({url}) => {
    console.log(`Servidor listo en la url ${url}`);
    conectarDB();
})