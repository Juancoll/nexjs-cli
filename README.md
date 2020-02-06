# nex ecosystem cli

# command 

```
nex [namespace] [commnad] [args]
```

| namespace | command | params | descriptions |
|-- |-- |-- |--|
| ws | generate-ts-client | nex-cli.json file | create javascript wsclient from server package @nexjs/ws decorators |
| ws | generate-cs-client | nex-cli.json file | create c# wsclient from server package @nexjs/ws decorators | 

# ws namespace
## generate-ts-client
### command arguments
### nex-cli.json configuration file
```json
{
    "ws": {
        "generate-ts-client": {
            "outDir": "../template.api.wsclient-ts",
            "packageName": "@template/api.wsclient",
            "packageVersion": "0.0.1",
            "suffix": ".contract.ts",                // files that contains decorators @Rest or @Hub
            "models": {
                "source": "./src/models",
                "importsToRemove": [
                    "@nestjs/swagger"
                ],
                "decoratorsToRemove": [
                    "ApiProperty"
                ]
            }
        }
    }
}
```
