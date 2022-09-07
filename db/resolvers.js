const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config("../variables.env");

const crearToken = (usuario, secreta, expiracion) => {
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign(
    {
      id,
      email,
      nombre,
      apellido,
    },
    secreta,
    { expiresIn: expiracion }
  );
};

const resolvers = {
  Query: {
    obtenerUsuarioAutenticado: (_, { token }) => {
        const usuario = jwt.verify(token, process.env.SECRETA);
        return usuario;
      },
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

    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      //chequear si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      //revisar si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error("El password no es correcto");
      }

      //crear el token
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, "24h"),
      };
    },

    nuevoProducto: async(_, {input}) => {
        const producto = new Producto(input);
        try {
            const resultado = producto.save();
            return resultado;
        } catch (error) {
            console.log(error);
        }
    }
    
  },
};

module.exports = resolvers;
