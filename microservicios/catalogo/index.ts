import express from "express";
import dotenv from "dotenv";
import productosRouter from "./routes/productos.routes";
import catalogoRouter from "./routes/catalogo.routes";
import variantProductoRouter from "./routes/variant-producto.routes";

dotenv.config();

const app = express();
const PORT = 10103;

app.use(express.json());
app.use("/productos", productosRouter);
app.use("/catalogo", catalogoRouter);
app.use("/variantProductos", variantProductoRouter);

app.get("/", (req, res) => {
  res.send("Microservicio de Catálogo funcionando correctamente");
});

app.listen(PORT, () => {
  console.log(`Microservicio de Catálogo escuchando en el puerto ${PORT}`);
});
