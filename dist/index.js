"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const align_assignments_1 = __importDefault(require("./rules/align-assignments"));
const align_object_properties_1 = __importDefault(require("./rules/align-object-properties"));
module.exports = {
    rules: {
        'align-assignments': align_assignments_1.default,
        'align-object-properties': align_object_properties_1.default
    }
};
//# sourceMappingURL=index.js.map