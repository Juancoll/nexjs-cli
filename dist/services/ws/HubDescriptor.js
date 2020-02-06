"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeDescriptor_1 = require("./TypeDescriptor");
class HubDescriptor {
    constructor(property) {
        this.tsProperty = property;
        this.decorator = this.extractDecoratorDescriptor(property);
        this.event = property.getName();
        this.service = this.getServiceName(this.decorator);
        this.credentials = this.getCredentials(property);
        this.data = this.getData(property);
    }
    extractDecoratorDescriptor(property) {
        const decorator = property.getDecorators().find(x => x.getName() == 'Hub');
        if (!decorator) {
            throw new Error('property is not decorated with hub');
        }
        const value = decorator.getArguments()[0];
        const serviceProp = value.getProperty('service');
        const isAuthProp = value.getProperty('isAuth');
        const rolesProp = value.getProperty('roles');
        const selectionProp = value.getProperty('selection');
        const validationProp = value.getProperty('validation');
        return {
            tsDecorator: decorator,
            service: this.getStringLiteral(serviceProp),
            isAuth: isAuthProp
                ? this.getBooleanLiteral(isAuthProp)
                : false,
            roles: rolesProp
                ? this.getStringArrayLiteral(rolesProp)
                : [],
        };
    }
    getServiceName(decorator) {
        return {
            name: decorator.service,
            upper: decorator.service.replace(/^\w/, c => c.toUpperCase()),
        };
    }
    getStringLiteral(literal) {
        return literal.getChildren()[2].getLiteralValue();
    }
    getBooleanLiteral(literal) {
        return literal.getChildren()[2].getLiteralValue();
    }
    getStringArrayLiteral(literal) {
        return eval(literal.getChildren()[2].getText());
    }
    getCredentials(property) {
        return new TypeDescriptor_1.TypeDescriptor(property.getType().getTypeArguments()[0]);
    }
    getData(property) {
        return new TypeDescriptor_1.TypeDescriptor(property.getType().getTypeArguments()[1]);
    }
    static isHub(property) {
        return property.getDecorators().find(x => x.getName() == 'Hub');
    }
}
exports.HubDescriptor = HubDescriptor;
//# sourceMappingURL=HubDescriptor.js.map