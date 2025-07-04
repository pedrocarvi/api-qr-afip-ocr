const express = require('express');

const cors = require('cors');
const { swaggerUi, specs } = require('./swagger');
const { extractQRFromPDFencoded } = require('afip-ocr');
const { Jimp } = require('jimp');
const jsQR = require('jsqr');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Multer
const upload = multer({ storage: multer.memoryStorage() });

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// Bienvenida API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la api. Ir a /api-docs para la documentación con Swagger :)' });
});

// Funciones utiles
function decodeBase64ToObject(encoded) {
  const buf = Buffer.from(encoded, 'base64');
  return JSON.parse(buf.toString('latin1'));
}

function extractValueFromURL(url) {
  const [, query] = url.split('?');
  if (!query) return null;
  const param = query.split('&').find(p => p.startsWith('p='));
  return param ? decodeBase64ToObject(param.slice(2)) : null;
}

/**
 * @openapi
 * /extract-pdf:
 *   post:
 *     tags:
 *       - AFIP QR
 *     summary: Extrae datos de QR en un PDF Base64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               base64PDF:
 *                 type: string
 *                 description: PDF codificado en Base64
 *     responses:
 *       200:
 *         description: Datos extraídos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Falta el parámetro base64PDF
 *       500:
 *         description: Error interno
 */
app.post('/extract-pdf', async (req, res) => {
  const { base64PDF } = req.body;

  if (!base64PDF) {
    return res.status(400).json({ httpCode: 400, error: 'Falta base64PDF en el body' });
  }
  
  try {
    const data = await extractQRFromPDFencoded(base64PDF);
    res.status(200).json({ httpCode: 200, success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ httpCode: 500, success: false, error: err.message });
  }
});

/**
 * @openapi
 * /extract-image:
 *   post:
 *     tags:
 *       - AFIP QR
 *     summary: Extrae datos de QR de una imagen PNG/JPEG
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen PNG o JPEG
 *     responses:
 *       200:
 *         description: Datos extraídos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Falta el archivo `image`
 *       500:
 *         description: Error interno
 */
app.post('/extract-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ httpCode: 400, error: 'Falta el archivo `image`' });
  }
  try {
    // Leemos el buffer de la imagen usando Jimp
    const image = await Jimp.read(req.file.buffer);
    const { data, width, height } = image.bitmap;

    // Escaneamos el QR
    const qr = jsQR(new Uint8ClampedArray(data), width, height);
    if (!qr) {
      return res
        .status(404)
        .json({ httpCode: 404, success: false, data: null, message: "QR no encontrado" });
    }

    // Parseamos el contenido del QR
    const parsed = extractValueFromURL(qr.data);
    return res.status(200).json({ httpCode: 200,success: true, data: parsed});
  } catch (err) {
    console.error(err);
    res.status(500).json({ httpCode: 500, success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
