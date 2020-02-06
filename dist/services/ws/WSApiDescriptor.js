"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Enumerable = require("linq");
const ts_morph_1 = require("ts-morph");
const upath_1 = require("upath");
const HubDescriptor_1 = require("./HubDescriptor");
const TypesToImport_1 = require("./TypesToImport");
const RestDescriptor_1 = require("./RestDescriptor");
class WSApiDescriptor {
    constructor(sourceDir, targetDir, suffix) {
        this._hubs = [];
        this._rests = [];
        this._sourceDir = sourceDir;
        this._targetDir = targetDir;
        const tsconfig = upath_1.resolve(upath_1.join(sourceDir, '/tsconfig.json'));
        this._project = new ts_morph_1.Project({
            tsConfigFilePath: tsconfig,
        });
        this._contractFiles = this._project
            .getSourceFiles()
            .filter(x => x.getFilePath().endsWith(suffix));
        this._hubs = this.extractHubs();
        this._rests = this.extractRests();
    }
    getServiceDescriptors() {
        const result = new Array();
        const linqHub = Enumerable.from(this._hubs);
        const hubGroupByService = linqHub.groupBy(x => x.service.name);
        hubGroupByService.forEach(group => {
            const key = group.key();
            const value = group.toArray();
            const typesToImport = new TypesToImport_1.TypesToImport();
            value.forEach(x => {
                typesToImport.addIfRequired(x.credentials);
                typesToImport.addIfRequired(x.data);
            });
            result.push({
                service: {
                    name: key,
                    upper: key.replace(/^\w/, c => c.toUpperCase()),
                },
                hub: value,
                rest: [],
                typesToImport,
            });
        });
        const linqRest = Enumerable.from(this._rests);
        const restGroupByService = linqRest.groupBy(x => x.service.name);
        restGroupByService.forEach(group => {
            const key = group.key();
            const value = group.toArray();
            const existingImport = result.find(x => x.service.name == key);
            if (result.find(rest => rest.service.name == key)) {
                value.forEach(rest => {
                    existingImport.typesToImport.addIfRequired(rest.returnType);
                    rest.params.forEach(param => existingImport.typesToImport.addIfRequired(param.type));
                });
                existingImport.rest = value;
            }
            else {
                const typesToImport = new TypesToImport_1.TypesToImport();
                value.forEach(rest => {
                    typesToImport.addIfRequired(rest.returnType);
                    rest.params.forEach(param => typesToImport.addIfRequired(param.type));
                });
                result.push({
                    service: {
                        name: key,
                        upper: key.replace(/^\w/, c => c.toUpperCase()),
                    },
                    hub: [],
                    rest: value,
                    typesToImport,
                });
            }
        });
        result.forEach(service => {
            service.typesToImport.fillTargetPath((source) => {
                const relativePath = upath_1.relative(this._sourceDir, source);
                const path = relativePath.replace('src/', '../../');
                return path;
            });
        });
        return result;
    }
    extractHubs() {
        const result = new Array();
        this._contractFiles.forEach(file => {
            file.getClasses().forEach(classObj => {
                classObj.getProperties().forEach(property => {
                    if (HubDescriptor_1.HubDescriptor.isHub(property)) {
                        const descriptor = new HubDescriptor_1.HubDescriptor(property);
                        result.push(descriptor);
                    }
                });
            });
        });
        return result;
    }
    extractRests() {
        const result = new Array();
        this._contractFiles.forEach(file => {
            file.getClasses().forEach(classObj => {
                classObj.getMethods().forEach(method => {
                    if (RestDescriptor_1.RestDescriptor.isRest(method)) {
                        const descriptor = new RestDescriptor_1.RestDescriptor(method);
                        result.push(descriptor);
                    }
                });
            });
        });
        return result;
    }
}
exports.WSApiDescriptor = WSApiDescriptor;
//# sourceMappingURL=WSApiDescriptor.js.map