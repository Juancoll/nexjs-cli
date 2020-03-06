# Index
1. [Overview](#overview)
    - [Description](#description)
    - [Cli](#cli)
    - [Installation](#installation)
    - [Running the app](#running-the-app)
    - [Test](#test)
    - [Support](#support)
    - [Stay in touch](#stay-in-touch)
    - [Licence](#licence)
1. [Concepts and howtos](#concepts-and-howtos)
    - [Requires](#requires)
    - [Remove lint](#remove-lint)
    - [Add env variables](#add-env-variables)
    - [Add debug (vscode)](#add-debug-(vscode))
    - [Add Alias](#add-alias)
    - [Add Swagger](#add-swagger)
    - [Create NestJS Components](#create-nestjs-component)
    - [Add Static files](#add-static-files)
    - [Add security](#add-security)
    - [Add Morgan Express Logger midleware](#add-morgan-express-logger-midleware)
    - [Service Importation from another module](#service-importation-from-another-module)
    - [Add Local Authentitication](#add-local-authentitication)
    - [Add JWT Authentification](#add-jwt-authentitication)
    - [Add Validation](#add-validation)
    - [Add Cors](#add-cors)
    - [Role Authentication](#role-authentication)
    - [Add hot reloading for development mode (build with webpack)](#add-hot-reloading-for-development-mode-(build-with-webpack))
    - [Add doc](#add-doc)
    - [Add File Upload](#add-file-upload)
    - [Add Websockets](#add-websockets)
    - [Add Events Bus for Module and services communication](#add-events-bus-for-module-and-services-communication)
    - [Generate client libraries](#generate-client-libraries)
    - [Modules and models structure](@modules-and-models-structure)
1. [Nomenclature](#nomenclature)
1. [Bugs](#bugs)
1. [Todos](#todos)
1. [debug](#debug)

# Overview
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Cli
```bash
npm install -g @nestjs/cli
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

  Nest is [MIT licensed](LICENSE).

# Concepts and Howtos

[top](#index)
## Requires
- install local mongoDB (for users auth). https://www.mongodb.com/download-center/community
- install robo 3T to manage mongo. https://robomongo.org/download
- To fill data execute and run this server, 
  - in swagger execute auth/register (create users)
  - in swagger execute auth/registerMany (create multiple users and admin)
  - in swagger execute auth/registerAllUsers (drop user collection)  

[top](#index)
## Remove TSlint
We use the vscode linter (if not too much warning)
- remove lint.json
- remove format and lint scripts
- remove tslint and prettier packages

[top](#index)
## Add env variables
- execute
```
npm install dotenv-flow --save
npm install cross-env --save-dev
```
- create .env file for common vars
- create .env.production for production mode vars
- create .env.development for development mode vars
- create /src/env.ts for configurations and check variables
```typescript
require('dotenv-flow').config();

if (!process.env.NODE_ENV) throw new Error("Environment NODE_ENV not found.")
console.log("Environment mode = ", process.env.NODE_ENV);

if (!process.env.SERVER_HOST) throw new Error("Environment SERVER_HOST not found.")
if (!process.env.SERVER_PORT) throw new Error("Environment SERVER_PORT not found.")
console.log(`listen on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);

if (!process.env.SERVER_API_DOC) throw new Error("Environment SERVER_API_DOC not found.")
console.log(`listen on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/${process.env.SERVER_API_DOC}`);
```
- in main.ts
```typescript
import "./env";
```
- in package.json
  - in scripts
  ```json
  "scripts": {
      "build": "rimraf dist && tsc -p tsconfig.build.json",
      "start": "ts-node -r tsconfig-paths/register src/main.ts",
      "start:dev": "tsc-watch -p tsconfig.build.json --onSuccess \"node dist/main.js\"",
      "start:debug": "tsc-watch -p tsconfig.build.json --onSuccess \"node --inspect-brk dist/main.js\"",
      "start:prod": "node dist/main.js",
  ```
  - add
  ```json
  "scripts": {
      "build": "cross-env NODE_ENV=production rimraf dist && tsc -p tsconfig.build.json",
      "start": "cross-env NODE_ENV=development ts-node -r tsconfig-paths/register src/main.ts",
      "start:dev": "cross-env NODE_ENV=development tsc-watch -p tsconfig.build.json --onSuccess \"node dist/main.js\"",
      "start:debug": "tsc-watch -p tsconfig.build.json --onSuccess \"node --inspect-brk dist/main.js\"",
      "start:prod": "cross-env NODE_ENV=production node dist/main.js",
  ```

[top](#index)
## Add debug
- add debug configuration
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${workspaceFolder}\\src\\main.ts",
            "preLaunchTask": "tsc: build - tsconfig.json",
            "outFiles": [
                "${workspaceFolder}/dist/**/*.js"
            ],
            "env": {
                "NODE_ENV": "development"
            },
        }
    ]
}
```

## Add Alias 
- in tsconfig.json
```json
{
  ...
  "compilerOptions": {
    ...
    "baseUrl": "./",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  }
}
```
- install 
```
npm install module-alias --save
```
- in package.json add 
```json
{
  ...
  "_moduleAliases":{
    "@": "./dist"
  }
}
``` 
- in ./src/main.ts add
```
import "module-alias/register";
```

[top](#index)
## Add Swagger
- see https://docs.nestjs.com/recipes/swagger

- nestjs tags
  - @ApiUseTag("name") on controller: To group rest api methods
  - @ApiOperation({ operationId: "", title: "", description: "" }) on method: to document method
  - @ApiOkResponse({ type: AuthRegisterResponseDto }) on method: document result data (required for client api generation)
  - @ApiImplicitBody({ name: "", type: [Dto Class], required: true }) on method: add inputs to swagger 
  - @ApiModelProperty({example: '', description: ''}) on properties model: create swagger models
  - @ApiBearerAuth() on method: user Authentication header define on swagger api (for jwt token)
  - @ApiConsumes('multipart/form-data') for methods that require files;
  - add Bearer Auth to swagger documentbuilder
  ```typescript
  // in src/maint.ts
  ...
  const options = new DocumentBuilder()
    .setTitle('Nestjs API title')
    .setDescription('Nestjs API description')
    .setVersion('1.0')
    .addBearerAuth('Authorization', 'header', 'apiKey')
    .setBasePath(process.env.SERVER_BASE_PATH)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  ```
- Recomendations
  - swagger operation id is not defined automaticaly. in @ApiOperation({ id: ""}) you can define it. but if you want to create and automatic operation id "(controller name)_(method name)" use custom decorator @ApiOperationId(). see file ./src/common/decorators/ApiOperationId.decorator.ts
  - Put in every request a operation ID for more consisten swagger definition.
  - Api decorator orders
  ```typescript
    @ApiOperationId()                                         // Required
    @ApiConsumes('multipart/form-data')                       // optional: for files is required with 'multipart/form-data'
    @ApiImplicitFile({ name: "fieldA", required: true })      // optional 
    @ApiImplicitFile({ name: "fieldB", required: true })      // optional: Required if method need params but not defined 
                                                              //   with Body, Param, Query or query. For example if we require 
                                                              //   user and password only for auth purpose but method not use it
    @ApiOkResponse({ type: FileDescriptorDto, isArray: true }) // Required: to generate correct client api
    async myApiRequest(...){
        ... 
    }
  ``` 

[top](#index)
## Create NestJS Components

to see all cli usage see https://docs.nestjs.com/cli/usages

```bash
nest g module [name]
nest g controller [name]
nest g Service [name]
```
Create first module. Controller and Service will be audto included.

[top](#index)
## Add Static files
- install package
```bash
npm install @nestjs/serve-static --save
```
- create public folder and add and index.html
- in file app.module.ts add
```typescript
import { ServeStaticModule } from '@nestjs/serve-static';

...

@Module({
  imports: [
    ...,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    })
  ],
  ...
})
```

[top](#index)
## Add security
see https://docs.nestjs.com/techniques/security
 - Helmet
 - cors 
 ```typescript
app.enableCors({
  origin: true,               // reinject request Heder origin to response header 
  optionsSuccessStatus: 200,  // normal status result on options requests
  credentials: true           // validate requests with credentials
})
 ```

[top](#index)
## Add Morgan Express Logger midleware
see https://github.com/expressjs/morgan
- install package
```bash
npm install morgan --save
```
- in file main.ts add
```typescript
import * as morgan from "morgan";

...

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  app.use(morgan());
  ...
}
```
[top](#index)
## Service Importation from another module
- We have a PlayersModule and an ItemsModule.
- We want to use the ItemsService in the PlayersService

You have to export the ItemsService in the module that provides it:
```typescript
@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService] // Export service
  ^^^^^^^^^^^^^^^^^^^^^^^
})
export class ItemsModule {}
```
and then import it in the module that uses the service:
```typescript
@Module({
  controllers: [PlayersController],
  providers: [PlayersService],
  imports: [ItemsModule] // import module
  ^^^^^^^^^^^^^^^^^^^^^^
})
export class PlayersModule {}
```
[top](#index)
## Add Local Authentitication
- username/password (local strategy), see https://docs.nestjs.com/techniques/authentication
  1. create strategy (see file src/modules/auth/strategies/local.strategy.ts)
  2. Apply Guard on any request (controller) that use username, password in the request
  ```typescript
  @ApiImplicitBody({ 
    name: "request", 
    type: AuthLoginRequestDto, 
    required: true 
  })                                            // force swagger 
  @UseGuards(AuthGuard('local'))                // this is the guard
  @Post('loginWithUserPassword')    
  async loginWithUserPassword(@Request() req) { // get user on request
    console.log(req.user)
    return req.user;  
  }
  ```
  3. But any request must have username/password to be validated, it's why we add sessions

- add sessions to keep user logged
  1. install packages
  ```bash 
  npm install --save @nestjs/passport passport passport-local express-session 
  npm install --save-dev @types/express @types/express-session
  ```
  2. create Guards, on for create the session, the other to confirm if request is authenticate
  ```javascript

  // file ./src/common/guards/auth.local.isAuthenticate.guard.ts
  import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

  @Injectable()
  export class AuthLocalAuthenticatedGuard implements CanActivate {
      async canActivate(context: ExecutionContext) {
          const request = context.switchToHttp().getRequest();
          return request.isAuthenticated();
      }
  }
  ```
  3. Create Session tools (see file ./src/modules/auth/session/session.tools.ts)

  4. create a session serializer (secure session) and register as provider in AuthModule
  ```javascript
  // file ./src/modules/auth/session/session.serializer.ts
  import { PassportSerializer } from '@nestjs/passport';
  import { Injectable } from '@nestjs/common';
  @Injectable()
  export class SessionSerializer extends PassportSerializer {
    serializeUser(user: any, done: (err: Error, user: any) => void): any {
      done(null, user);
    }
    deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
      done(null, payload);
    }
  }

  // file ./src/modules/auth/auth.module.ts
  import { SessionSerializer } from './session/session.serializer';

  @Module({
  ...
    providers: [
      ...,
      SessionSerializer
    ],
  })
  export class AuthModule { }
  ```
  5. configure main.ts
  ```typescript
  // session
  import * as session from 'express-session';
  import * as passport from 'passport';

  // session
  app.use(
    session({
      secret: 'nest cats',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  ```
  6. User autenticate decorators(Guards) and save session
  ```typescript
  @ApiUseTags("auth")
  @Controller('auth')
  @UseInterceptors(ClassSerializerInterceptor) // remove @exclude from models (user password for example)
  export class AuthController {

      constructor(
          private readonly authService: AuthService,
          private readonly userService: UsersService
      ) { }

      //#region [ auth local strategy]
      @ApiImplicitBody({ name: "request", type: AuthLoginRequestDto, required: true })
      @UseGuards(AuthGuard("local"))     // <-- this guard to register session
      @Post('local/login')
      async localLogin(@Request() req) {
        let user = req.user;
        let session = await SessionTools.createSession(req, user);   // save session
        return req.user;
      }

      @UseGuards(AuthLocalAuthenticatedGuard)
      @Post("local/test")   // <-- this guard to force user logged
      async localTest(@Request() req) {
          console.log(req.user)
          return req.user;
      }
      ...
  }
    //#endregion
  ```
[top](#index)
## Add JWT Authentification
- install packages 
```bash
# local
npm install --save @nestjs/passport passport passport-local
npm install --save-dev @types/passport-local 

# jwt 
npm install @nestjs/jwt passport-jwt
npm install @types/passport-jwt --save-dev
```
- create file ./modules/auth/interfaces/jwt-payload.interface.ts
```typescript
export interface JwtPayload {
    email: string;
}
```
- create file ./modules/auth/strategies/jwt.strategy.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'thisismykickasssecretthatiwilltotallychangelater'
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.authService.validateUserByJwt(payload);
        if (!user)  throw new UnauthorizedException();        
        return user;
    }
}
```
- to login we first need email and password (so is the local strategy)
- create token 
```javascript
// in file \src\modules\auth\auth.controller.ts
export class AuthController {
   ...
    @ApiImplicitBody({ name: "JwtLoginDto", type: AuthJWTLoginRequestDto, required: true })
    @UseGuards(AuthGuard('local'))
    @Post("jwt-strategy/login")
    async loginJwtStrategy(
        @Req() req: Request): Promise<AuthJWTLoginResponseDto> {
        try {
            let token = await this.jwtService.sign({ id: payload.id, email: payload.email });
            return new AuthJWTLoginResponseDto({ access_token: token, user: req.user as User });
        }
        catch (err) {
            throw new HttpException(err.message, HttpStatus.UNAUTHORIZED);
        }
    }
}
```
- use jwt authentification in another method

```javascript
// in file \src\modules\auth\auth.controller.ts
export class AuthController {
   ...
    @ApiBearerAuth()                  // say swagger to user the authentication. go to auth button and write Bearer: [token value]
    @UseGuards(AuthGuard('jwt'))      // use jwt authentification
    @Post("jwt-strategy/test")
    async jwtTest(@Req() req: Request) {
        let user = req.user as User;
        console.log("[jwt-strategy/test] user > ", user)
        return user;
    }
}
```
[top](#index)
## Add Validation
to validate we use Pipes (see https://docs.nestjs.com/pipes)
- we want to validate in all request so we will register as global
```javascript
// in src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  ...
  app.useGlobalPipes(new ValidationPipe({ transform: true }));  // validation data
}
```
[top](#index)

## Add Cors
```javascript
// in src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  ...
  app.enableCors();
}
```
[top](#index)
## Role Authentication 
- the request must be authenticate (to have a user with role information). It can be authenticate with local or JWT
- we create a decorator to add role metadata to controller method, like @Roles("admin"). We know that method wan't to be authenticate with role admin.
- we must create a guard that take user from request and compare to Role define by the decorator.
- Apply decorator and guard to request
```javascript 
// in src\common\decorators\roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => return SetMetadata('roles', roles)

// in src\common\guards\role.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const contextRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!contextRoles)            
          return true;
        
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const hasRole = (user: any) => user.roles.some(userRole => contextRoles.indexOf(userRole) != -1);
        
        return user && user.roles && hasRole(user);
    }
}

// use in a controller

// Multiple decorator Guards (Not recomended)
@Controller('auth')
export class AuthController {
    @Roles('admin')
    @UseGuards(RolesGuard)            // BE CAREFULL WITH order OF DECORATORS   (2 EXECUTED)
    @UseGuards(AuthGuard('jwt'))      // BE CAREFULL WITH order OF DECORATORS   (1 EXECUTED)
    @Post("jwt-strategy/test-roles")
    async testRolesJwtStrategy() {
        ...
    }
}

// Recomended solution
@Controller('auth')
export class AuthController {
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'), RolesGuard)      // BE CAREFULL WITH order OF DECORATORS   (1 EXECUTED)
    @Post("jwt-strategy/test-roles")
    async testRolesJwtStrategy() {
        ...
    }
}
```
[top](#index)
## Add hot reloading for development mode (build with webpack)
- see https://docs.nestjs.com/techniques/hot-reload
- see webpack.config.js
- see scripts in package.js
```json
"scripts": {
    "webpack:start-dev": "cross-env NODE_ENV=development node dist/server",
    "webpack:start-prod": "cross-env NODE_ENV=production node dist/server",
    "webpack:dev": "cross-env NODE_ENV=development webpack --config webpack.config.js --watch",
    "webpack:build": "cross-env NODE_ENV=production webpack --config webpack.config.js",
}
```
[top](#index)
## Add doc
see https://docs.nestjs.com/recipes/documentation
see https://compodoc.app/guides/usage.html
1. install package
```
npm i -D @compodoc/compodoc
```
2. create documentation
```
npm run doc
```
3. open http://localhost:8080

4. add to .gitignore /documentation

[top](#index)
## Add File Upload
- install packages
```bash
npm install @nestjs/platform-express --save #if not already installed
npm install @types/multer --save-dev        #typing file 
```
- see documentation https://docs.nestjs.com/techniques/file-upload
- see module files src\modules\files\files.controller.ts
- use multer. see https://github.com/expressjs/multer for all configuration and properties

[top](#index)
## Add Websockets
- install package
```bash
npm install @nestjs/platform-ws --save
```
- see https://docs.nestjs.com/websockets/gateways 
- see module events file src\modules\events\events.gateway.ts
- see /public/index.html  (socket client)
- see main.config.ts (add websocket adapter)
- execute server
- open http://localhost:3000 for client open console
- in morgan logger and socket.io skip routes
```javascript
// in src/main.ts or src/main.config.ts
 app.use(morgan("tiny", { skip: ((req, res) => req.url.startsWith("/socket.io")) }));
```

[top](#index)
## Add Events Bus for Module and services communication
- create Event Bus. see src\modules\events\events.bus.provider.ts 
- emit events. see src\modules\events\events.gateway.ts
- listen events. see src\app.service.ts Listen Event Bus

[top](#index)
## Generate client libraries
- full usage see https://openapi-generator.tech/docs/usage
- Install package (if not installed in devDependenciesja)
```bash
npm install @openapitools/openapi-generator-cli --save-dev
```
- Verify that Java runtime (JRE) is installed and in the path. (see https://www.java.com/es/download/win10.jsp)
- in package.json, add scripts 
```json
  ...
  "scripts":{
    ...  
    "openapi:ts-axios": "openapi-generator generate -g typescript-axios -i ./dist/swagger-spec.json --skip-validate-spec --enable-post-process-file -o ../template-server-nestjs-client-ts-axios-api -c openapi.ts-axios.config.json",
    "openapi:csharp": "  openapi-generator generate -g csharp           -i ./dist/swagger-spec.json --skip-validate-spec --enable-post-process-file -o ../template-server-nestjs-client-csharp-api   -c openapi.csharp.config.json",
    
  }
}
```
- usage: https://openapi-generator.tech/docs/usage#generate
- for typescript axios client
  - output is ../template-server-nestjs-client-ts-axios-api (in package.json scripts "openapi:ts-axios" -o param)
  - config file for typescript-axios is ./openapi.ts-axios.config.json. https://openapi-generator.tech/docs/generators/typescript-axios
- for c# client
  - output is ../template-server-nestjs-client-csharp-api (in package.json scripts "openapi:csharp" -o param)
  - config file for typescript-axios is ./openapi.csharp.config.json. https://openapi-generator.tech/docs/generators/csharp
  - cookies for local authentication is not supported by default. We need to add some code.
    - solution extract from https://github.com/jimschubert/cookies-issue-187
    - Open solution in visual studio.
    - In folder /Client, create a new file ApiClientEx.cs (replace namespaces if required)
    ```csharp
    using RestSharp;
    using System;
    using System.Linq;

    namespace nexgroup.Client
    {
        public partial class ApiClient
        {
            private static String CookieKey = "connect.sid";      
            private String cookie = null;
            partial void InterceptRequest(IRestRequest request)
            {
                if (cookie == null) return;
                Console.WriteLine("Add cookie to request: " + cookie);
                request.AddCookie(CookieKey, cookie);
            }

            partial void InterceptResponse(IRestRequest request, IRestResponse response)
            {
                var setCookie = response.Cookies.FirstOrDefault(c => c.Name == CookieKey);
                if (setCookie != null)
                {
                    cookie = setCookie.Value;
                    Console.WriteLine("Cookie on response: " + cookie);
                }
            }
        }
    }
    ```
    - Build solution
    - if error message appears
      ``` 
      The item "Client\ApiClientEx.cs" was specified more than once in the "Sources" parameter.  Duplicate items are not supported by the "Sources" parameter.	nexgroup
      ``` 			
      - open nexgroup.csproj
      - remove duplicate entry
      ```xml
      <ItemGroup>
        ...
        <Compile Include="Client\ApiClientEx.cs" />
        ...
        <Compile Include="Client\ApiClientEx.cs" />
      </ItemGroup>
      ```
      - save project
      - relaod project in visual studio
      - build
    - When you re-generate client the file doesn't remove. (so you just have to do this one time)
- partial list of clients generator generators (as global information):
```
 - android
 - csharp
 - csharp-netcore
 - javascript
 - objc
 - swift4
 - typescript-axios (see options https://openapi-generator.tech/docs/generators/typescript-axios)
 - typescript-fetch
 - typescript-inversify
 - typescript-jquery
 - typescript-node
 - typescript-rxjs
```

[top](#index)

## Modules and models structure
We have 2 differents aproach
1. Module centered (see user module in this example). Means create models and db providers inside the module
  - For common modules (modules that you will reuse) like auth, user, chat, etc...
  - Just adding this module the api will work, without adding user models to Global models structure, or db providers
1. models centered (see cats module in this example)
  - for specific api modules 
  - its more easy to center models in the same folder

[top](#index)

## Nomenclature
- Controller method decorators
```typescript
//1. Swagger decorators
      @ApiOperationId()
      ... // more @Api swagger decorators
      @ApiOkResponse()

//2. Nest and Common decorators (Guard, roles, pipes)
      @UseGuards(...)
      @Roles("admin")
      ...
//3.  Method definition decorator
      @Get("custom") // Or post 
      async customrequest(...){
          ...
      }
```
- Models decorators
```typescript
class MyModel {
//1. Swagger decorators
      @ApiModelProperty({ example: "123456", required: true }) 

//2. Validation decorators
      @IsString()                                                     
      @MinLength(6)                                                    
      @MaxLength(24)                                                  
      @IsNotEmpty()                                                        
      ...
//3.  DataBase (Typegoose) decorators
      @prop({ required: true })   

//4.  Optional Serialization decorators
      @Exclude()    
      prop1: string   


}
```
- Models and Dto constructors to create model as 
```typescript
const m = new MyModel({propA: "value", propB: "value"}). 

// Add constructor 
export class MyModel extends Typegoose { // this model is used in db{
                                          
    email: string;                           
    password: string;

    public constructor(init?: Partial<MyModel>) {
        super();
        (<any>Object).assign(this, init);
    }
}

```

[top](#index)

## Bugs

- Post methods with DTO Body params not working in SWAGGER 
  - problem: Version of swagger-ui-dist (dependency of swagger-ui-express)
  - solution: you need version "3.23.0" of swagger-ui-dist. Set as dependency with fixed version in package.json
- @ApiImplicitBody({..., isArray:true, , type: String}), @ApiModelProperty({... isArray: true, type: String})
  - problem: swagger crash. not open
  - solution: type: "string" instead type: String. swagger use the type 
- @ApiImplicit[Any]({...}) without isArray property >  set isArray: false
  - problem is not a valid swagger definition json. when isArray: false, we don't write property. validation in openapi throw an error
  - solution: put --skip-validate-spec option in openapi-generator cli

[top](#index)

## Todos

    [ ] secure websocket
    [ ] not working with socket.io client (see \src\chat.html). Cors error
    [x] export swagger descriptor as a json file
    [x] generate clients from swagger descriptor
    [x] test generated client in ts-axios web api
    [x] openapi:ts-axios doen't export correctly type file from swagger. Generate a UNKNOW_TYPE in client lib
    [x] test generated client in c# api
    [x] Error uploading files in c#

[top](#index)

## debug

- npm run start:debug
- vscode start debug


[top](#index)