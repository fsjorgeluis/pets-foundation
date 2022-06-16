# CDK TypeScript: proyecto "Pet Foundation"

Creación de una aplicación para la gestión de fundaciones de mascotas, se utiliza cdk para la infraestructura como código (IaC), separando el desarrollo en varios stacks (dynamo, lambdas, layers, authorizer, api gateway) para facilitar su futuro despliegue y mantención.

## Funcionamiento

![cdk_pets_foundation](https://user-images.githubusercontent.com/20530235/174002176-199c6b85-f3e9-489c-aed5-880385540185.png)
Los request se almacenan en formato JSON en un bucket S3.
Tras adoptar una mascota, se actualiza su estatus de `unhappy` a `happy`, se emite un evento SNS llamado: `pet-happy` que notifica vía correo electrónico.

## Endpoints disponibles

Endpoints conectados a lambdas para la creación de una fundación u obtener todas las fundaciones registradas. Require: `Headers authorizationToken: allow`

```
/foundations
POST
GET
```

Endpoints conectados a lambdas para agregar una mascota u obtener todas las mascotas registradas para una fundación. Requiere: `Headers authorizationToken: allow, foundationPK: FOUNDATION#<name>`

```
/pets
POST
GET
```

Endpoints conectados a lambdas para obtener una mascota por `id`, registrada en una fundación, actualizar o liberar (eliminar) una mascota. Requiere: `Headers authorizationToken: allow, foundationPK: FOUNDATION#<name>`

```
/pets/{petId}
GET
PATCH
DELETE
```

Endpoint conectado a lambda para adoptar una mascota. Requiere: `Headers authorizationToken: allow, foundationPK: FOUNDATION#<name>`

```
/{petId}/adopt
PATCH

```

## Comandos utiles de CDK

- `cdk bootstrap` puede recibir un perfil `--profile <name>` y empaqueta la app para su futuro deploy.
- `cdk deploy` puede recibir `--profile <name>` y contexto `--context | -c <key>=<value>` y un stack especifico o el wildcard `--all`.
- `cdk destroy ` puede recibir `--profile <name>` y contexto `--context | -c <key>=<value>`, destruye los recursos creados.\*
- `cdk diff` puede recibir `--profile <name>` y contexto `--context | -c <key>=<value>`, muestra cambios ocurridos en el proyecto con los desplegados actualmente.
- `cdk synth` crea una plantilla de CloudFormation.
- `npm run build` compila typescript a js.
- `npm run watch` observa cambios y compila.
- `npm run test` ejecuta las pruebas unitarias con jest.

\* Nota: por defecto no elimina los registros de CloudWatch, tablas de dynamoDB, buckets y su contenido.
