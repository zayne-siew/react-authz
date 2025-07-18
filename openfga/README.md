# OpenFGA Modular Model Sample Store

## Use-Case

This example showcases how to use [modular models](https://openfga.dev/docs/modeling/modular-models) to organize your model across multiple files. It is adapted from the [official OpenFGA documentation](https://github.com/openfga/sample-stores/blob/main/stores/modular/README.md).

It models a simple to-do application with two modules:

- A `core` [module](./core.fga) defines the entity types that are shared across components.
- A `todo` [module](./todo.fga) defines the entity types for the to-do component.

An `fga.mod` [manifest file](./fga.mod) declares all the modules for the model.
The model can be written to an OpenFGA store with the `fga model write --file fga.mod --store-id <store_id>` CLI command.

If you then try to get the model with the `fga model get --format fga --store-id <store_id>` command, OpenFGA will be displayed it as a single combined model, with annotations describing the module that defined each type.

```yaml
model
  schema 1.2

type organization # module: core, file: core.fga
  relations
    define admin: [user]
    define member: [user, organization#member] or admin
    define can_create_todos: member # extended by: module: todo, file: todo.fga
    define can_delete_todos: admin # extended by: module: todo, file: todo.fga
    define can_update_todos: admin # extended by: module: todo, file: todo.fga
    define can_view_todos: member # extended by: module: todo, file: todo.fga

type user # module: core, file: core.fga

type todo # module: todo, file: todo.fga
  relations
    define can_create: can_create_todos from organization
    define can_delete: can_delete_todos from organization
    define can_update: owner or can_update_todos from organization
    define can_view: owner or can_view_todos from organization
    define organization: [organization]
    define owner: [user]
```

The example includes a module definition file + a test file per module.

## Try It Out

1. Set up a local `.env` file from the `.env.example` file with all the relevant variables.

2. Make sure you have the [FGA CLI](https://github.com/openfga/cli/?tab=readme-ov-file#installation) and have successfully [configured OpenFGA](https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga).

Namely, you should run the following commands in the `openfga` directory:

```bash
openfga migrate --datastore-uri "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable" --datastore-engine postgres
openfga run --datastore-uri "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable" --datastore-engine postgres
```

3. In the `openfga` directory: If the OpenFGA model is being initialized, create the OpenFGA store:

```bash
export FGA_STORE_ID=$(fga store create --name "My OpenFGA Model" --model fga.mod --debug | jq -r .store.id)
```

Otherwise, update the authorization model currently loaded:

```bash
fga store list
# {
#   "continuation_token":"",
#   "stores": [
#     {
#       "created_at":"2025-07-18T07:06:34.313704Z",
#       "id":"01K0E5PBE97ERBDABTAVBMGJFS",
#       "name":"My OpenFGA Model",
#       "updated_at":"2025-07-18T07:06:34.313704Z"
#     }
#   ]
# }

# fga model write --store-id $FGA_STORE_ID --file fga.mod
fga model write --store-id 01K0E5PBE97ERBDABTAVBMGJFS --file fga.mod
# {
#   "authorization_model_id":"01K0E7V7F1VG680YKV92H060A7"
# }
```

4. In the `openfga` directory, run the test for each module:

```bash
fga model test --tests core.fga.yaml
fga model test --tests todo.fga.yaml
```
