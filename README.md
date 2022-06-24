# CDK TypeScript: proyecto "Pets Foundation"

Creación de una aplicación para la gestión de fundaciones de mascotas, se utiliza cdk para la infraestructura como código (IaC), separando el desarrollo en varios stacks (dynamo, lambdas, layers, authorizer, api gateway) para facilitar su futuro despliegue y mantención.

## Primero que nada

Asegúrate de que tu cuenta de aws cuente con los permisos necesarios para crear los siguientes recursos:

- DynamoDB Tables
- Lambda functions
- API's Gateway
- S3 Buckets
- SNS
- SES

Tambien recuerda crear el archivo `.env` utilizando como base el `.env.sample` encontrado en la raíz del proyecto.

## Funcionamiento

![cdk_pets_foundation](https://user-images.githubusercontent.com/20530235/175202518-e1c50209-c224-40ad-aea6-e5c4a6fa8412.png)

Los request que contengan un body se almacenan en formato JSON en un bucket S3.
Tras adoptar una mascota, se actualiza su estatus de `unhappy` a `happy`, se emite un evento SNS que activa una lambda y esta notifica vía correo electrónico.

\* **Importante**: en modo sandbox SES solo permite enviar correos desde y para cuentas con identidades verificadas, por lo que se sugiere encarecidamente agregar desde la consola de aws las identidades que se usaran de prueba durante el modo de desarrollo.

La Tabla de dynamoDB está estructurada de la siguiente forma utilizando el _composite key pattern_.

![Foundation_Pet](https://user-images.githubusercontent.com/20530235/175405732-6ef03802-a408-47a9-ba2b-c44b3a5f163a.png)
_Aggregate view_\*

## Endpoints disponibles

Endpoints conectados a lambdas para la creación de una fundación u obtener todas las fundaciones registradas. Require: Header `authorizationToken: allow | deny | unauthorized`

```
/foundations
POST
GET
```

Endpoints conectados a lambdas para agregar una mascota u obtener todas las mascotas registradas para una fundación. Requiere: Header `authorizationToken: allow | deny | unauthorized`, query string params `?pk=<foundation_name>`

```
/pets
POST
GET
```

Endpoints conectados a lambdas para obtener una mascota por `id`, registrada en una fundación, actualizar o liberar (eliminar) una mascota. Requiere: Header `authorizationToken: allow | deny | unauthorized`, query string params `?pk=<foundation_name>`

```
/pets/{petId}
GET
PATCH
DELETE
```

Endpoint conectado a lambda para adoptar una mascota. Requiere: Header `authorizationToken: allow | deny | unauthorized`, query string params `?pk=<foundation_name>`

```
/{petId}/adopt
PATCH

```

Se emite un evento SNS al actualizar el estatus de la mascota, y se envía un email utilizando SES.

## Layers

Crear dentro de la carpeta `src` la siguiente estructura:

```
-/layers
--/custom
---/nodejs
----/node_modules
-----/key-formatter
------index.js
-----/s3-manager
------index.js
--/nodejs
---/node_modules
----package.json
```

Se puede obtener el contenido de los archivos que se muestran en la estructura de carpetas `layers/custom`, en los siguientes gists, [`key-formatter/index.js`](https://gist.github.com/fsjorgeluis/55c4bfa67148034f867155516b319638) y [`s3-manager/index.js`](https://gist.github.com/fsjorgeluis/6c04533e74641af3e6280b28a890ce21).

## Comandos útiles de CDK

- `npm i` instala las dependencias del proyecto.
- `npm run build` transpila código TypeScript a JavaScript.
- `npm run watch` observa cambios y compila.
- `npm run test` ejecuta las pruebas unitarias con jest.
- `cdk bootstrap` puede recibir un perfil `--profile <name>` y empaqueta la app para su futuro deploy.
- `cdk synth` crea una plantilla de CloudFormation utilizando el código del proyecto.
- `cdk deploy` puede recibir `--profile <name>` y contexto `--context | -c <key>=<value>` y un stack especifico o el wildcard `--all`.
- `cdk destroy ` puede recibir `--profile <name>` y contexto `--context | -c <key>=<value>`, destruye los recursos creados.\*
- `cdk diff` puede recibir `--profile <name>` y contexto `--context | -c <key>=<value>`, muestra cambios ocurridos en el proyecto con los desplegados actualmente.

\* **Nota:** por defecto no se eliminan los registros de CloudWatch, tablas de dynamoDB, buckets y su contenido, aunque si se agrega el atributo `removalPolicy` se puede elimiar los elementos: tabla dynamo y bucket s3 para este el último se puede complementar con el atributo `autoDeleteObjects` para vaciar el bucket antes de su eliminación.

## Extras

En la carpeta doc, se encuentra la documentación de la API en formato:

- YAML Swagger/OpenApi
- JSON Swagger/OpenApi
- JSON Postman

## Mejoras por hacer

- Agregar unit test.
- Refactorización de código.
- Agregar pipelines.
