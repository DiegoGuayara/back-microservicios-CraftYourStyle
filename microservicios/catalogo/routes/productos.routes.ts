import {ProductoController} from '../controllers/productos.controller';
import {Router} from 'express';

const router = Router();
const productoController = ProductoController;

router.post('/crearProducto', ProductoController.createProduct.bind(productoController));
router.get('/obtenerProductos', ProductoController.getProducts.bind(productoController));
router.get('/obtenerProducto/:id', ProductoController.getProductById.bind(productoController));
router.patch('/actualizarProducto/:id', ProductoController.updateProductById.bind(productoController));
router.delete('/eliminarProducto/:id', ProductoController.deleteProductById.bind(productoController));

export default router