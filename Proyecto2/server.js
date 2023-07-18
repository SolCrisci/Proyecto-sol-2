const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la Casa Computadora");
});
// Ruta para obtener todos los equipos de computación disponibles
app.get("/computacion", async (req, res) => {
    try {
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
      
    // Obtener la colección de equipos de computacion y convertir los documentos a un array
    const db = client.db("Computacion");
   const computacion = await db.collection ('computacion').find().toArray();
 
    res.json(computacion);

  } catch (error) {
    // Manejo de errores al obtener las frutas
    res.status(500).send("Error al obtener los equipos de computación de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});
  // Obtener los equipos de computacion por su código
app.get("/computacion/:codigo",async (req,res)=>{
    
    const client = await connectToDB();
    try{
    if (!client){
        res.status(500).send("Error al conectarse a MongoDB");
        return;
    };

    const db = client.db('Computacion');
    const computacionId= parseInt(req.params.codigo)||0;
    const computacion =await db.collection ('computacion').findOne({codigo:computacionId});

if(!computacion){
    res.status(404).send(`Error, ${computacionId} no existe`);
        return;
}

    res.json(computacion);
    }
    catch(error){
        res.status(500).send("Error al obtener el equipo de computación de la base de datos");
    }

 finally{
   await disconnectFromMongoDB();
   
    }
});

// Ruta para obtener equipo de computación por su nombre

app.get("/computacion/nombre/:nombre", async (req, res) => {
    const equipoQuery = req.params.nombre;
    let compuNombre = RegExp(equipoQuery, "i");
    try {
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
  
      // Obtener la colección de equipos de computación y buscar un equipo por su Nombre
      const db = client.db("Computacion");
      const computacion = await db
        .collection("computacion")
        .find({ nombre: compuNombre })
        .toArray();
      if (computacion.length > 0) {
        res.json(computacion);
      } else {
        res.status(404).send("Equipo de computación no encontrado");
      }
    } catch (error) {
      // Manejo de errores al obtener el equipo de computación
      res.status(500).send("Error al obtener el equipo de computación de la base de datos");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });
  // Ruta para obtener un equipo de computación por su categoría
  app.get("/computacion/categoria/:categoria", async (req, res) => {
    const equipoCategoria = req.params.categoria;
   // let compuCategoria = RegExp(equipoCategoria, "i");
    try {
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
  
      // Obtener la colección de equipos de computación y buscar un equipo por su Categoria
      const db = client.db("Computacion");
      const computacion = await db
        .collection("computacion")
        .find({ categoria: equipoCategoria })
        .toArray();
      if (computacion.length > 0) {
        res.json(computacion);
      } else {
        res.status(404).send(`No se encontraron Articulos para la categoria: ${equipoCategoria}`);
      }
    } catch (error) {
      // Manejo de errores al obtener el equipo de computación
      res.status(500).send("Error al obtener el equipo de computación de la base de datos");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });
  

  // Ruta para agregar un nuevo recurso

app.post("/computacion", async (req, res) => {
    //const nuevoEquipo = req.body;
    const nombreNew = req.body.nombre;
    const precioNew = req.body.precio;
    const categoriaNew = req.body.categoria;
    try {
      if (!nombreNew || !precioNew || !categoriaNew) {
        res.status(400).send("Error. Faltan datos de relevancia.");
      }
  
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
      }
      const db = client.db("Computacion");
      const computacionOrdenDesc = await db.collection ('computacion').find().sort({codigo: -1}).toArray();
      const codigoMax = computacionOrdenDesc[0].codigo;

      if (!codigoMax)
      {
        codigoNuevo = 1;
      }
      else
      {
        codigoNuevo = codigoMax + 1;
      }
      console.log(`Antes de intentar el insert ${codigoMax} ${nombreNew}   ${precioNew}   ${categoriaNew}`);
      const collecCompu = db.collection('computacion');
      const equipoNew = {codigo: codigoNuevo,nombre: nombreNew,precio: precioNew,categoria: categoriaNew };
      await collecCompu.insertOne(equipoNew);
      
      console.log("Nuevo equipo de computacion creado");

      res.status(201).send(codigoNuevo,nombreNew,precioNew,categoriaNew);
    } catch (error) {
      // Manejo de errores al agregar un equipo nuevo
      res.status(500).send("Error al intentar agregar un equipo nuevo");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });

  //Ruta para modificar el precio de un equipo

app.patch("/computacion/codigo/:codigo", async (req, res) => {
  const codigoEquipo = parseInt(req.params.codigo);
  const {precio} = req.body;
  const nuevoEquipo = {precio};
  try {
    if (!codigoEquipo) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("Computacion");
    const collection = db.collection("computacion");
    const computacion =await db.collection ('computacion').findOne({codigo:codigoEquipo});

if(!computacion){
    res.status(404).send(`Error, el codigo ${codigoEquipo} no existe`);
        return;
}
console.log("antes del update");
    await collection.updateOne({ codigo: codigoEquipo  }, { $set: nuevoEquipo });

    console.log("Dato modificado");

    res.status(200).send("Se actualizó el precio correctamente");
  } catch (error) {
    // Manejo de errores al modificar el equipo de computacion
    res.status(500).send("Error al modificar el equipo de computación");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para eliminar un recurso
app.delete("/computacion/codigo/:codigo", async (req, res) => {
    const codigoEquipo = parseInt(req.params.codigo);
    try {
      if (!codigoEquipo) {
        res.status(400).send("Error en el formato de datos a crear.");
        return;
      }
  
      // Conexión a la base de datos
      const client = await connectToDB();
      if (!client) {
        res.status(500).send("Error al conectarse a MongoDB");
        return;
      }
  
      // Obtener la colección de frutas, buscar la fruta por su ID y eliminarla
      const db = client.db("Computacion");
      const collection = db.collection("computacion");
      const resultado = await collection.deleteOne({ codigo: codigoEquipo });
      if (resultado.deletedCount === 0) {
        res .status(404).send("No se encontró ningun equipo con el id seleccionado.");
      } else {
        console.log("Equipo de computación Eliminado");
        res.status(204).send("Equipo de computación eliminado correctamente");
      }
    } catch (error) {
      // Manejo de errores 
      res.status(500).send("Error al eliminar un equipo de computacion");
    } finally {
      // Desconexión de la base de datos
      await disconnectFromMongoDB();
    }
  });

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});