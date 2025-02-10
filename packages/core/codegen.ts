import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  ignoreNoDocuments: false, // for better experience with the watcher
  generates: {
    // Protocol
    "src/data/subgraphs/protocol": {
      preset: "near-operation-file",
      schema:
        "https://api.studio.thegraph.com/query/1726/betswirl-avalanche/v2.0.3",
      documents: ["src/data/subgraphs/protocol/**/*.graphql"],
      presetConfig: {
        extension: ".ts",
        baseTypesPath: "types.ts",
      },
      plugins: ["typescript-operations", "typescript-document-nodes"],
      config: {
        withHooks: false,
        nameSuffix: "Document",
        fragmentSuffix: "Fragment",
        scalars: {
          BigInt: "string",
          BigDecimal: "string",
        },
      },
    },
  },
};

export default config;
