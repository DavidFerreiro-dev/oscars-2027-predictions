# Oscar Predictions 2027

Aplicación frontend React + Vite para crear una quiniela personal de la 99.ª edición de los Premios Oscar. Incluye búsqueda TMDB, nominados ordenables, guardado local, resumen y exportación.

## Requisitos
- Node.js 20 o superior (recomendado)
- npm
- Un TMDB API Read Access Token (v4)

## Instalación

```bash
cd oscars-2027
npm install
cp .env.example .env
```

Abre `.env` y añade tu token:

```env
VITE_TMDB_ACCESS_TOKEN=TU_TOKEN_DE_LECTURA_TMDB
```

Después inicia el servidor:

```bash
npm run dev
```

Vite mostrará una dirección local, normalmente `http://localhost:5173`.

Para compilar y probar la versión de producción:

```bash
npm run build
npm run preview
```

## Oscar logo
The hero uses the supplied image at `media/oscars.png`. The project is an independent fan experience and is not affiliated with the Academy.

## Uso
- Cambia de categoría desde el menú lateral (en móvil, botón de menú).
- Busca películas o personas en TMDB; los estrenos de 2026 aparecen priorizados entre los resultados de películas.
- Añade candidatos y arrástralos para ordenar tu predicción. El primer puesto es la predicción a ganador.
- La aplicación guarda automáticamente los cambios en `localStorage` del navegador.
- En “Mi quiniela” puedes descargar el JSON o copiar un resumen de texto.
- Si no has configurado el token en `.env`, puedes introducirlo desde Ajustes. Ese token se mantiene solo en el estado de la sesión actual.

## Seguridad y atribución
Las variables `VITE_*` se incorporan al bundle del navegador y no son secretos. Para desplegar públicamente, mueve las peticiones TMDB a un backend/proxy y guarda allí el token. No publiques tu `.env`.

Este producto utiliza la API de TMDB, pero no está respaldado ni certificado por TMDB. Datos e imágenes sujetos a los términos de TMDB.

## Alcance
Se incluyen las 14 categorías especificadas en el encargo. En categorías de interpretación y dirección se puede buscar y añadir personas; puedes indicar la película por la que compite cada persona mediante el campo opcional de asociación de cada candidato.
