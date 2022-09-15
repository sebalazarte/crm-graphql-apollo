const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const Cliente = require("../models/Cliente");
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
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      return producto;
    },
    obtenerClientes: async () => {
      try {
        return await Cliente.find({});
      } catch (error) {
        throw new Error(error);
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      try {
        return await Cliente.find({ vendedor: ctx.usuario.id });
      } catch (error) {
        throw new Error(error);
      }
    },
    obtenerCliente: async(_, {id}, ctx) => {
      //revisar si el cliente existe o no
      const cliente = await Cliente.findById(id);
      if(!cliente){
        throw new Error('Cliente no encontrado');
      }
      //quien lo creo puede verlo
      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error('No tienes las credenciales');
      }
      return cliente;
    }
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

    nuevoProducto: async (_, { input }) => {
      const producto = new Producto(input);
      try {
        const resultado = producto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      let producto = await Producto.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      producto = await Producto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return producto;
    },
    eliminarProducto: async (_, { id }) => {
      let producto = await Producto.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      await Producto.findOneAndDelete({ _id: id });

      return "Producto eliminado";
    },
    nuevoCliente: async (_, { input }, ctx) => {
      //verificar si el cliente ya esta registrado
      const { email } = input;
      const cliente = await Cliente.findOne({ email });

      console.log(cliente);
      if (cliente) {
        throw new Error("Cliente ya registrado");
      }
      //asignar el vendedor
      const nuevoCliente = new Cliente(input);
      nuevoCliente.vendedor = ctx.usuario.id;

      //guardar el cliente

      try {
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        throw new Error("Error al guardar el cliente");
      }
    },
    actualizarCliente: async(_, {id, input}, ctx) => {
      let cliente = await Cliente.findById(id);
      if(!cliente){
        throw new Error('El cliente no existe');
      }

      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error('No tienes las credenciales');
      }

      cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});
      return cliente;

    },
    eliminarCliente: async (_, { id }, ctx) => {
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("Cliente no encontrado");
      }

      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error('No tienes las credenciales');
      }

      await Cliente.findOneAndDelete({ _id: id });

      return "Cliente eliminado";
    },
  },
};

module.exports = resolvers;
