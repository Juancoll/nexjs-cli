"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const path_1 = require("path");
class WSReflection {
    constructor() {
        this.importedTypes = [];
        this.hubs = [];
    }
    setup(cwd, suffix) {
        const tsconfig = path_1.resolve(path_1.join(cwd, '/tsconfig.json'));
        const project = new ts_morph_1.Project({
            tsConfigFilePath: tsconfig,
        });
        const files = project.getSourceFiles().filter(x => x.getFilePath().endsWith(suffix));
        files.forEach(file => {
            file.getClasses().forEach(classObj => {
                classObj.getMethods().forEach(method => {
                    if (method.getDecorators().find(x => x.getName() == 'Rest')) {
                        console.log(`rest method ${method.getName()}`);
                    }
                });
                classObj.getProperties().forEach(property => {
                    if (property.getDecorators().find(x => x.getName() == 'Hub')) {
                        const descriptor = this.getHubDescriptor(property);
                        this.hubs.push(descriptor);
                    }
                });
            });
        });
    }
    getServiceDescriptors() {
        const result = [];
        this.hubs.forEach(hub => {
            const service = result.find(svc => svc.name == hub.service.name);
            if (!service) {
                result.push({
                    name: hub.service.name,
                    upper: hub.service.upper,
                    hub: [hub],
                    rest: [],
                    importedTypes: [],
                });
            }
            else {
                service.hub.push(hub);
            }
        });
        result.forEach(service => {
            const importedTypes = [];
            service.hub.forEach(hub => {
                [hub.credentials, hub.data].forEach(type => {
                    this.importType(importedTypes, type);
                });
            });
            service.importedTypes = importedTypes;
        });
        return result;
    }
    importType(types, type) {
        if (type.import && !types.find(x => this.areTypeEquals(x, type))) {
            types.push(type);
        }
    }
    areTypeEquals(a, b) {
        return a.import.path == b.import.path && a.import.type == b.import.type;
    }
    getHubDescriptor(property) {
        const decorator = property.getDecorators().find(x => x.getName() == 'Hub');
        const serviceDecoratorProperty = decorator.getArguments()[0].getProperty('service');
        const serviceLiteralValue = serviceDecoratorProperty.getChildren()[2].getLiteralValue();
        return {
            event: property.getName(),
            service: {
                name: serviceLiteralValue,
                upper: serviceLiteralValue.replace(/^\w/, c => c.toUpperCase()),
            },
            credentials: this.getTypeDescriptor(property.getType().getTypeArguments()[0]),
            data: this.getTypeDescriptor(property.getType().getTypeArguments()[1]),
        };
    }
    getTypeDescriptor(type) {
        const text = type.getText();
        const idxFirst = text.lastIndexOf('("');
        const idxLast = text.lastIndexOf('")');
        let result;
        if (text.indexOf('import("') > -1) {
            result = {
                text: text.substr(idxLast + 3),
                import: {
                    path: text.substr(idxFirst + 2, idxLast - idxFirst - 2),
                    type: type.isArray()
                        ? this.getTypeDescriptor(type.getArrayElementType()).text
                        : text.substr(idxLast + 3),
                },
            };
        }
        else {
            result = { text };
        }
        if (result.import && !this.importedTypes.find(x => x.import == result.import)) {
            this.importedTypes.push(result);
        }
        return result;
    }
}
exports.WSReflection = WSReflection;
//# sourceMappingURL=ws-reflection.js.map