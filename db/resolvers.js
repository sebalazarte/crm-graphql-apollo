const Usuario = require("../models/Usuario");
const bcryptjs = require('bcryptjs');

const resolvers = {
  Query: {
    holaMundo: () => "Hola mundo",
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;

      //revisar si el usuario ya esta registrado
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario) {
        throw new Error("El usuario ya esta registrado");
      }

      //hasear su password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      try {
          //guardar en la base de datos
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;

      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = resolvers;
