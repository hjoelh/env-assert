#!/usr/bin/env node

import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const configLocation = "./env-assert.config.ts";

const getConfigFileAsJS = async () => {
  // @ts-ignore
  const config = await import("./env-assert.config.js");
  return config;
};

const checkForConfigFile = (): boolean => {
  try {
    fs.readFileSync(configLocation, "utf8");
    return true;
  } catch (e) {
    return false;
  }
};

const attemptTranspileConfigFile = (): boolean => {
  try {
    execSync(
      `npx tsc ${configLocation} --skipLibCheck --outDir ${path.resolve(
        __dirname
      )}`
    );
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const validateConfigFile = (file: any) => {
  if (!file.default?.default) {
    console.log("Config file must export a default export");
    process.exit(1);
  }

  if (!file.default?.default?.required) {
    console.log(
      "The Default export in the config file must have a required property"
    );
    process.exit(1);
  }

  if (Array.isArray(file.default?.default?.required) === false) {
    console.log(
      "The required property in the config file default export must be an array of strings"
    );
    process.exit(1);
  }
};

const exampleConfigFileTxt = `import type { CreateEnvVarsType } from "env-assert";

const required = ["FOO"] as const;
const optional = ["BAR"] as const;

const config = {
  required,
  optional,
};

export default config;

export type EnvVars = CreateEnvVarsType<typeof config>;
`;

const createExampleConfigFile = () => {
  fs.writeFileSync(configLocation, exampleConfigFileTxt);
  console.log("Created an example config file, env-assert-config.ts 🫡");
};

//--------------------------------------------

(async () => {
  if (checkForConfigFile() === false) {
    console.log(
      "Could not find config file, it should be env-assert.config.ts in the root"
    );
    createExampleConfigFile();
    process.exit(1);
  }

  if (attemptTranspileConfigFile() === false) {
    console.log(
      "Failed to transpile config file, please ensure TypeScript is installed and the config file has no errors"
    );
    process.exit(1);
  }

  const configFile = await getConfigFileAsJS();
  validateConfigFile(configFile);

  const requiredEnvVars = configFile.default.default.required as string[];
  const optionalEnvVars = configFile.default.default?.optional as
    | string[]
    | undefined;

  const errorsArray: string[] = [];
  const verifiedArray: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      errorsArray.push(`[ Required Env Var ] ${envVar} is not defined ❌`);
    } else {
      verifiedArray.push(`[ Required Env Var ] ${envVar} is defined ✅`);
    }
  });

  if (verifiedArray.length) {
    verifiedArray.forEach((e) => console.log(e));
  }

  optionalEnvVars?.forEach((optionalEnvVar) => {
    if (!process.env[optionalEnvVar]) {
      console.log(`[ Optional Env Var ] ${optionalEnvVar} is not defined`);
    }
  });

  if (errorsArray.length) {
    errorsArray.forEach((e) => console.log(e));
    process.exit(1);
  }
})();

//--------------------------------------------

export type CreateEnvVarsType<
  T extends {
    required: readonly string[];
    optional?: readonly string[];
  }
> = T extends { optional: readonly string[] }
  ? { [Property in T["required"][number]]: string } & {
      [Property in T["optional"][number]]: string | undefined;
    }
  : { [Property in T["required"][number]]: string };
