import axios from "axios";
import type { Request, Response } from "express";

export class AdminController {
    private static getCatalogoBaseUrl(): string {
        return process.env.CATALOGO_URL ?? "http://catalogo:10103";
    }

    static async verificaciondeAdmin(req: Request, res: Response) {
        return res.status(200).json({
            message: "Acceso autorizado como administrador"
        });
    }

    static async crearCategoria(req: Request, res: Response) {
        try {
            const { nombre } = req.body as { nombre?: string };

            if (!nombre) {
                return res.status(400).json({
                    message: "Faltan datos obligatorios (nombre)"
                });
            }

            const catalogoUrl = `${AdminController.getCatalogoBaseUrl()}/catalogo/crearCategoria`;
            const { data, status } = await axios.post(
                catalogoUrl,
                { nombre },
                { timeout: 10000 }
            );

            return res.status(status).json(data);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status ?? 502;
                const data = error.response?.data ?? { message: "Error al conectar con catálogo" };
                return res.status(status).json(data);
            }

            return res.status(500).json({
                message: "Error interno al crear la categoria desde admin"
            });
        }
    }

    static async crearProducto(req: Request, res: Response) {
        try {
            const {
                nombre,
                categoria,
                category_id,
                price,
                imagen,
                image_url,
                descripcion,
                talla,
                genero,
                gender
            } = req.body as {
                nombre?: string;
                categoria?: string;
                category_id?: string | number;
                price?: string | number;
                imagen?: string;
                image_url?: string;
                descripcion?: string;
                talla?: string;
                genero?: string;
                gender?: string;
            };

            const imagenFinal = typeof imagen === "string" && imagen.trim() ? imagen.trim() : image_url?.trim();
            const categoryIdDirecto = category_id !== undefined ? Number(category_id) : null;
            const generoFinal = typeof genero === "string" && genero.trim()
                ? genero.trim()
                : typeof gender === "string" && gender.trim()
                    ? gender.trim()
                    : "Unisex";

            if (!nombre || price === undefined || !imagenFinal || (!categoria && category_id === undefined)) {
                return res.status(400).json({
                    message: "Faltan datos obligatorios (nombre, categoria o category_id, price, imagen o image_url)"
                });
            }

            const precioParseado = Number(price);
            if (!Number.isFinite(precioParseado) || (category_id !== undefined && !Number.isFinite(categoryIdDirecto))) {
                return res.status(400).json({
                    message: "price y category_id deben ser numéricos"
                });
            }

            const baseUrl = AdminController.getCatalogoBaseUrl();

            // 1) Resolver categoría: por ID directo o por nombre (crear si no existe)
            let categoryId: number | null = categoryIdDirecto;

            if (!categoryId && categoria) {
                try {
                    const categoriesResponse = await axios.get(`${baseUrl}/catalogo/obtenerCategorias`, {
                        timeout: 10000
                    });
                    const categories = Array.isArray(categoriesResponse.data?.data)
                        ? categoriesResponse.data.data
                        : [];
                    const found = categories.find(
                        (c: { id?: number; nombre?: string }) =>
                            typeof c?.nombre === "string" &&
                            c.nombre.trim().toLowerCase() === categoria.trim().toLowerCase()
                    );
                    if (found?.id) {
                        categoryId = Number(found.id);
                    }
                } catch (error: unknown) {
                    if (!axios.isAxiosError(error) || error.response?.status !== 404) {
                        throw error;
                    }
                }
            }

            if (!categoryId && categoria) {
                const createCategoryResponse = await axios.post(
                    `${baseUrl}/catalogo/crearCategoria`,
                    { nombre: categoria.trim() },
                    { timeout: 10000 }
                );
                categoryId = Number(createCategoryResponse.data?.data?.insertId);
            }

            if (!categoryId || !Number.isFinite(categoryId)) {
                return res.status(500).json({ message: "No se pudo obtener/crear la categoría" });
            }

            // 2) Crear producto base
            const createProductResponse = await axios.post(
                `${baseUrl}/productos/crearProducto`,
                {
                    nombre: nombre.trim(),
                    descripcion: descripcion?.trim() || nombre.trim(),
                    imagen_url: imagenFinal,
                    categoria_id: categoryId,
                    price: precioParseado,
                    talla: talla?.trim() || "UNICA",
                    genero: generoFinal
                },
                { timeout: 10000 }
            );

            const productId = Number(createProductResponse.data?.id?.insertId);
            if (!productId || !Number.isFinite(productId)) {
                return res.status(500).json({ message: "No se pudo crear el producto" });
            }

            return res.status(201).json({
                message: "Producto creado correctamente",
                data: {
                    categoria_id: categoryId,
                    producto_id: productId
                }
            });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status ?? 502;
                const data = error.response?.data ?? { message: "Error al conectar con catálogo" };
                return res.status(status).json(data);
            }

            return res.status(500).json({
                message: "Error interno al crear el producto desde admin"
            });
        }
    }
}
