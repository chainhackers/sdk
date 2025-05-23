## Screenshot testing
Using [Loki](https://github.com/oblador/loki)

To run screenshot tests, Docker and the Storybook server must be running.

Start Storybook server:
```shell
pnpm storybook
```

Generate initial reference files:
```shell
pnpm loki update
```

Run tests:
```shell
pnpm loki test
```

---

## linting and formatting
Using [Biome](https://biomejs.dev/)

Check linting and formatting:
```shell
pnpm lint
```

Check and fix linting and formatting issues:
```shell
pnpm lint:fix
```

Check linting:
```shell
pnpm biome lint .
```

Check and fix linting issues:
```shell
pnpm biome lint --write .
```

Check formatting:
```shell
pnpm biome format .
```

Check and fix formatting issues:
```shell
pnpm biome format --write .
```

---

## Deploy

```shell
setfacl -R -m u:dev-components:rwx /var/www/betswirl-sdk/
```
