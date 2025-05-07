import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  ignoreNoDocuments: false, // for better experience with the watcher
  generates: {
    // Protocol types.ts
    "src/data/subgraphs/protocol/documents/types.ts": {
      schema: "https://api.studio.thegraph.com/query/1726/betswirl-avalanche/v2.2.0",
      plugins: ["typescript"],
    },
    // Protocol each query
    "src/data/subgraphs/protocol/documents": {
      preset: "near-operation-file",
      schema: "https://api.studio.thegraph.com/query/1726/betswirl-avalanche/v2.2.0",
      documents: ["src/data/subgraphs/protocol/documents/**/*.graphql"],
      presetConfig: {
        extension: ".ts",
        baseTypesPath: "types.ts",
      },
      plugins: ["typescript-operations", "typescript-document-nodes"],
      config: {
        withHooks: false,
        nameSuffix: "Document",
        fragmentSuffix: "FragmentDoc",
        scalars: {
          BigInt: "string",
          BigDecimal: "string",
        },
      },
    },
  },
};

export default config;
