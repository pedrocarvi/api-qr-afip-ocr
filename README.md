## API Afip - QR

Para probar la API en Swagger: 

```
http://localhost:3009/api-docs
```

## Endpoints

### 1. POST /extract-pdf

* **Descripción**: Extrae datos del QR contenido en un PDF codificado en Base64.

**Request Body (JSON)**

```json
{
  "base64PDF": "<tu_base64_del_PDF>"
}
```

**Responses**:

* **200 OK**

  ```json
  {
    "httpCode": 200,
    "success": true,
    "data": { /* datos del QR */ }
  }
  ```
* **400 Bad Request** (sin `base64PDF`)

  ```json
  {
    "httpCode": 400,
    "error": "Falta base64PDF en el body"
  }
  ```
* **500 Internal Server Error**

  ```json
  {
    "httpCode": 500,
    "success": false,
    "error": "<mensaje de error>"
  }
  ```

### 2. POST /extract-image

* **Descripción**: Escanea un código QR desde una imagen PNG o JPEG.

**Request (multipart/form-data)**

* **image**: archivo PNG o JPEG

**Responses**:

* **200 OK** (QR encontrado)

  ```json
  {
    "httpCode": 200,
    "success": true,
    "data": { /* datos del QR */ }
  }
  ```
* **404 Not Found** (QR no detectado)

  ```json
  {
    "httpCode": 404,
    "success": false,
    "data": null,
    "message": "QR no encontrado"
  }
  ```
* **400 Bad Request** (sin archivo `image`)

  ```json
  {
    "httpCode": 400,
    "error": "Falta el archivo `image`"
  }
  ```
* **500 Internal Server Error**

  ```json
  {
    "httpCode": 500,
    "success": false,
    "error": "<mensaje de error>"
  }
  ```

