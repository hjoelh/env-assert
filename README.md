# env-assert
Setup (after install):

    npx env-assert
    yarn env-assert
    pnpm env-assert

---
This will create an example config file

> env-assert.config.ts

Here you can setup your required and optional environment variables  
![CleanShot 2022-11-27 at 8 17 36](https://user-images.githubusercontent.com/68335961/204157796-c323c4a3-28be-46fc-bdb4-9923116d0eb2.png)
# How to use
**Run env-assert before any script**, for example:

    yarn env-assert && yarn build
    

![CleanShot 2022-11-27 at 8 28 20](https://user-images.githubusercontent.com/68335961/204158085-5b1477dc-023b-40f3-abc1-5da906f8d4d8.png)

Pass the type of your config to **CreateEnvVarsType** to receive a type that you can use to extend ProcessEnv, so you know what variables are available. 👌
![CleanShot 2022-11-27 at 8 23 12](https://user-images.githubusercontent.com/68335961/204157903-273ff75e-b9a1-4cfc-bcab-16a5be66b2b3.gif)  
global.d.ts
```typescript
import { EnvVars } from "./env-assert.config";

export declare global {
  declare namespace NodeJS {
    interface ProcessEnv extends EnvVars {}
  }
}

```
