# Bot de Instagram con Clasificación de Género

Este repositorio contiene un script avanzado de bot de Instagram diseñado para automatizar acciones de seguimiento (follow) y dejar de seguir (unfollow) usuarios basándose en su género. Utiliza un modelo de clasificación XGBoost y los embeddings de OpenAI ADA para determinar el género de los usuarios, con un costo de $0.001 centavos por cada 1000 consultas de género.

## Características

- **Seguimiento de Usuarios (Follow):**
  - Basado en el género determinado por el modelo de clasificación.
  - Ejecuta la acción de seguir en:
    - La lista de seguidores (Followers) de un usuario.
    - La lista de seguidos (Following) de un usuario.
    - La lista de likes en una publicación específica.

- **Dejar de Seguir Usuarios (Unfollow):**
  - Verifica si los usuarios no siguen de vuelta antes de dejar de seguirlos.
  - Opciones de ejecución:
    - `all`: Scrapea en tiempo real todos los seguidos de tu lista y deja de seguir aquellos que no te siguen.
    - `usernamesonlyfollow.json`: Observa y deja de seguir solo a los usuarios recientemente seguidos registrados en el archivo generado por la función de follow.

## Costo y Eficiencia

- El costo de consulta del género es de $0.001 centavos por cada 1000 consultas, asegurando un balance entre eficiencia y costo en el uso del bot.

## Requisitos

- Python 3.x
- Librerías especificadas en `requirements.txt`
- Credenciales válidas de Instagram

## Instalación

Para instalar y configurar el bot, sigue las instrucciones detalladas a continuación:

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/instagram-bot.git

# Navegar al directorio del proyecto
cd instagram-bot
```

## Configuración del Entorno

Antes de ejecutar el bot, es necesario configurar los datos de entorno. Para ello, crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```bash
USERNAME= (usuario propio)
PASSWORD= (contraseña de logeo)
USER_TO_FOLLOW= (usuario a copiar lista)
PHOTO= (photo a copiar lista)

USERAGENT= (Hay uno por defecto, configurar si se quiere)
WIDTH= (Hay uno por defecto, configurar si se quiere)
HEIGHT= (Hay uno por defecto, configurar si se quiere)

OPENAI_API_KEY= (OpenAI key)
Gender= M o F
```

## Despliegue de la API Local del Modelo Predictivo

Para seguir, primero debemos desplegar la API local del modelo predictivo. Sigue estos pasos:

1. Abre una consola y navega a la carpeta de `Embeddings` ubicada en la raíz del proyecto.
2.Crea y activa un entorno virtual en Python:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2.Crea y activa un entorno virtual en Python:

   ```bash
   pip install flask pandas numpy openai==0.28.0 python-dotenv xgboost
   ```

3.Una vez que todas las dependencias estén instaladas, inicia la API con el siguiente comando:

   ```bash
   python3 app.py
   ```
Esto debería crear una API en el localhost usando Flask.

## Instalación de Dependencias y Ejecución del Bot
Una vez levantada la API, abre otra consola y sigue

1.Navega a la carpeta raíz del proyecto.
2.Instala las dependencias necesarias usando pnpm:
   ```bash
pnpm install
```
3.Inicia el bot con el siguiente comando:
   ```bash
pnpm run init
   ```


## Uso del Bot

Al iniciar el bot, se te presentarán las siguientes opciones:

- **Follow:**
  - El bot te consultará si quieres seguir a usuarios de una lista de seguidores (followers) o seguidos (following) de un usuario, o si quieres seguir desde una lista de likes de una foto.
  
- **Unfollow:**
  - El bot te consultará si quieres revisar los unfollow de toda la lista de seguidos propios, scrapeando la lista en tiempo real (`all`), o si prefieres solo revisar los unfollow en la lista de últimos seguidos (`recent`).

- **Exit:**
  - Esta opción permite salir del bot.

A continuación se muestra un ejemplo de cómo se vería la interacción en la consola:

```bash
$ pnpm run init
¿Qué acción deseas realizar?
1. Follow
2. Unfollow
3. Exit

Ingrese el número de la opción deseada: 1

¿Deseas seguir desde?
1. Lista de seguidores de un usuario
2. Lista de seguidos de un usuario
3. Lista de likes de una foto

Ingrese el número de la opción deseada: 2
```
- **1. Follow:** Elige una opción para seguir usuarios:
  - **Lista de seguidores de un usuario:** El bot seguirá a los seguidores del usuario especificado.
  - **Lista de seguidos de un usuario:** El bot seguirá a los usuarios que el usuario especificado está siguiendo.
  - **Lista de likes de una foto:** El bot seguirá a los usuarios que han dado like a una foto específica.

    Para ejecutar la acción de Follow, usa el siguiente comando y sigue las instrucciones en consola:

    ```bash
    $ pnpm run follow
    ```

    Se te preguntará qué lista deseas usar para seguir a otros usuarios. Introduce el número correspondiente a tu elección y el bot comenzará el proceso de seguimiento.

- **2. Unfollow:**
  - **All:** Esta opción permite dejar de seguir a todos los usuarios que actualmente te siguen, pero que tú sigues, y que no te siguen de vuelta. El bot scrapea toda tu lista de seguidos en tiempo real para actualizar y ejecutar esta acción.
  - **Recent:** Solo deja de seguir a los usuarios de la lista `usernamesonlyfollow.json`, que incluye a los usuarios que fueron seguidos recientemente por el bot y que no han seguido de vuelta.

    Para ejecutar la acción de Unfollow, usa el siguiente comando y sigue las instrucciones en consola:

    ```bash
    $ pnpm run unfollow
    ```

    Se te preguntará si deseas revisar toda la lista de seguidos o solo los recientes. Elige la opción adecuada para proceder.

- **3. Exit:**
  - Esta opción termina la ejecución del bot.

    Para salir del programa, simplemente selecciona la opción Exit:

    ```bash
    $ pnpm run exit
    ```

Al ejecutar cada comando, asegúrate de tener configurado correctamente el archivo `.env` con los datos necesarios para el acceso y operación del bot.

