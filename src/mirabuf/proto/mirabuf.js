/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const mirabuf = $root.mirabuf = (() => {

    /**
     * Namespace mirabuf.
     * @exports mirabuf
     * @namespace
     */
    const mirabuf = {};

    mirabuf.Assembly = (function() {

        /**
         * Properties of an Assembly.
         * @typedef {Object} mirabuf.Assembly.$Properties
         * @property {mirabuf.Info.$Properties|null} [info] Basic information (name, Author, etc)
         * @property {mirabuf.AssemblyData.$Properties|null} [data] All of the data in the assembly
         * @property {boolean|null} [dynamic] Can it be effected by the simulation dynamically
         * @property {mirabuf.PhysicalProperties.$Properties|null} [physicalData] Overall physical data of the assembly
         * @property {mirabuf.GraphContainer.$Properties|null} [designHierarchy] The Design hierarchy represented by Part Refs - The first object is a root container for all top level items
         * @property {mirabuf.GraphContainer.$Properties|null} [jointHierarchy] The Joint hierarchy for compound shapes
         * @property {mirabuf.Transform.$Properties|null} [transform] The Transform in space currently
         * @property {mirabuf.Thumbnail.$Properties|null} [thumbnail] Optional thumbnail saved from Fusion 360 or scraped from previous configuration
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of an Assembly.
         * @memberof mirabuf
         * @interface IAssembly
         * @augments mirabuf.Assembly.$Properties
         * @deprecated Use mirabuf.Assembly.$Properties instead.
         */

        /**
         * Shape of an Assembly.
         * @typedef {{
         *   info?: mirabuf.Info.$Shape|null;
         *   data?: mirabuf.AssemblyData.$Shape|null;
         *   dynamic?: boolean|null;
         *   physicalData?: mirabuf.PhysicalProperties.$Shape|null;
         *   designHierarchy?: mirabuf.GraphContainer.$Shape|null;
         *   jointHierarchy?: mirabuf.GraphContainer.$Shape|null;
         *   transform?: mirabuf.Transform.$Shape|null;
         *   thumbnail?: mirabuf.Thumbnail.$Shape|null;
         *   $unknowns?: Array.<Uint8Array>;
         * }} mirabuf.Assembly.$Shape
         */

        /**
         * Constructs a new Assembly.
         * @memberof mirabuf
         * @classdesc Assembly
         * Base Design to be interacted with
         * THIS IS THE CURRENT FILE EXPORTED
         * @constructor
         * @param {mirabuf.Assembly.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Assembly = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Basic information (name, Author, etc)
         * @member {mirabuf.Info.$Properties|null|undefined} info
         * @memberof mirabuf.Assembly
         * @instance
         */
        Assembly.prototype.info = null;

        /**
         * All of the data in the assembly
         * @member {mirabuf.AssemblyData.$Properties|null|undefined} data
         * @memberof mirabuf.Assembly
         * @instance
         */
        Assembly.prototype.data = null;

        /**
         * Can it be effected by the simulation dynamically
         * @member {boolean} dynamic
         * @memberof mirabuf.Assembly
         * @instance
         */
        Assembly.prototype.dynamic = false;

        /**
         * Overall physical data of the assembly
         * @member {mirabuf.PhysicalProperties.$Properties|null|undefined} physicalData
         * @memberof mirabuf.Assembly
         * @instance
         */
        Assembly.prototype.physicalData = null;

        /**
         * The Design hierarchy represented by Part Refs - The first object is a root container for all top level items
         * @member {mirabuf.GraphContainer.$Properties|null|undefined} designHierarchy
         * @memberof mirabuf.Assembly
         * @instance
         */
        Assembly.prototype.designHierarchy = null;

        /**
         * The Joint hierarchy for compound shapes
         * @member {mirabuf.GraphContainer.$Properties|null|undefined} jointHierarchy
         * @memberof mirabuf.Assembly
         * @instance
         */
        Assembly.prototype.jointHierarchy = null;

        /**
         * The Transform in space currently
         * @member {mirabuf.Transform.$Properties|null|undefined} transform
         * @memberof mirabuf.Assembly
         * @instance
         */
        Assembly.prototype.transform = null;

        /**
         * Optional thumbnail saved from Fusion 360 or scraped from previous configuration
         * @member {mirabuf.Thumbnail.$Properties|null|undefined} thumbnail
         * @memberof mirabuf.Assembly
         * @instance
         */
        Assembly.prototype.thumbnail = null;

        /**
         * Encodes the specified Assembly message. Does not implicitly {@link mirabuf.Assembly.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Assembly
         * @static
         * @param {mirabuf.Assembly.$Properties} message Assembly message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Assembly.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                $root.mirabuf.AssemblyData.encode(message.data, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.dynamic != null && $Object.hasOwnProperty.call(message, "dynamic") && message.dynamic !== false)
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.dynamic);
            if (message.physicalData != null && $Object.hasOwnProperty.call(message, "physicalData"))
                $root.mirabuf.PhysicalProperties.encode(message.physicalData, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.designHierarchy != null && $Object.hasOwnProperty.call(message, "designHierarchy"))
                $root.mirabuf.GraphContainer.encode(message.designHierarchy, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
            if (message.jointHierarchy != null && $Object.hasOwnProperty.call(message, "jointHierarchy"))
                $root.mirabuf.GraphContainer.encode(message.jointHierarchy, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
            if (message.transform != null && $Object.hasOwnProperty.call(message, "transform"))
                $root.mirabuf.Transform.encode(message.transform, writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
            if (message.thumbnail != null && $Object.hasOwnProperty.call(message, "thumbnail"))
                $root.mirabuf.Thumbnail.encode(message.thumbnail, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes an Assembly message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Assembly
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Assembly & mirabuf.Assembly.$Shape} Assembly
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Assembly.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Assembly(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.data = $root.mirabuf.AssemblyData.decode(reader, reader.uint32(), $undefined, _depth + 1, message.data);
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.bool())
                            message.dynamic = value;
                        else
                            delete message.dynamic;
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.physicalData = $root.mirabuf.PhysicalProperties.decode(reader, reader.uint32(), $undefined, _depth + 1, message.physicalData);
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.designHierarchy = $root.mirabuf.GraphContainer.decode(reader, reader.uint32(), $undefined, _depth + 1, message.designHierarchy);
                        continue;
                    }
                case 6: {
                        if (wireType !== 2)
                            break;
                        message.jointHierarchy = $root.mirabuf.GraphContainer.decode(reader, reader.uint32(), $undefined, _depth + 1, message.jointHierarchy);
                        continue;
                    }
                case 7: {
                        if (wireType !== 2)
                            break;
                        message.transform = $root.mirabuf.Transform.decode(reader, reader.uint32(), $undefined, _depth + 1, message.transform);
                        continue;
                    }
                case 8: {
                        if (wireType !== 2)
                            break;
                        message.thumbnail = $root.mirabuf.Thumbnail.decode(reader, reader.uint32(), $undefined, _depth + 1, message.thumbnail);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Assembly
         * @function getTypeUrl
         * @memberof mirabuf.Assembly
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Assembly.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Assembly";
        };

        return Assembly;
    })();

    mirabuf.AssemblyData = (function() {

        /**
         * Properties of an AssemblyData.
         * @typedef {Object} mirabuf.AssemblyData.$Properties
         * @property {mirabuf.Parts.$Properties|null} [parts] Meshes and Design Objects
         * @property {mirabuf.joint.Joints.$Properties|null} [joints] Joint Definition Set
         * @property {mirabuf.material.Materials.$Properties|null} [materials] Appearance and Physical Material Set
         * @property {mirabuf.signal.Signals.$Properties|null} [signals] AssemblyData signals
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of an AssemblyData.
         * @memberof mirabuf
         * @interface IAssemblyData
         * @augments mirabuf.AssemblyData.$Properties
         * @deprecated Use mirabuf.AssemblyData.$Properties instead.
         */

        /**
         * Shape of an AssemblyData.
         * @typedef {{
         *   parts?: mirabuf.Parts.$Shape|null;
         *   joints?: mirabuf.joint.Joints.$Shape|null;
         *   materials?: mirabuf.material.Materials.$Shape|null;
         *   signals?: mirabuf.signal.Signals.$Shape|null;
         *   $unknowns?: Array.<Uint8Array>;
         * }} mirabuf.AssemblyData.$Shape
         */

        /**
         * Constructs a new AssemblyData.
         * @memberof mirabuf
         * @classdesc Data used to construct the assembly
         * @constructor
         * @param {mirabuf.AssemblyData.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const AssemblyData = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Meshes and Design Objects
         * @member {mirabuf.Parts.$Properties|null|undefined} parts
         * @memberof mirabuf.AssemblyData
         * @instance
         */
        AssemblyData.prototype.parts = null;

        /**
         * Joint Definition Set
         * @member {mirabuf.joint.Joints.$Properties|null|undefined} joints
         * @memberof mirabuf.AssemblyData
         * @instance
         */
        AssemblyData.prototype.joints = null;

        /**
         * Appearance and Physical Material Set
         * @member {mirabuf.material.Materials.$Properties|null|undefined} materials
         * @memberof mirabuf.AssemblyData
         * @instance
         */
        AssemblyData.prototype.materials = null;

        /**
         * AssemblyData signals.
         * @member {mirabuf.signal.Signals.$Properties|null|undefined} signals
         * @memberof mirabuf.AssemblyData
         * @instance
         */
        AssemblyData.prototype.signals = null;

        /**
         * Encodes the specified AssemblyData message. Does not implicitly {@link mirabuf.AssemblyData.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.AssemblyData
         * @static
         * @param {mirabuf.AssemblyData.$Properties} message AssemblyData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AssemblyData.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.parts != null && $Object.hasOwnProperty.call(message, "parts"))
                $root.mirabuf.Parts.encode(message.parts, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.joints != null && $Object.hasOwnProperty.call(message, "joints"))
                $root.mirabuf.joint.Joints.encode(message.joints, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.materials != null && $Object.hasOwnProperty.call(message, "materials"))
                $root.mirabuf.material.Materials.encode(message.materials, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.signals != null && $Object.hasOwnProperty.call(message, "signals"))
                $root.mirabuf.signal.Signals.encode(message.signals, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes an AssemblyData message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.AssemblyData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.AssemblyData & mirabuf.AssemblyData.$Shape} AssemblyData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AssemblyData.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.AssemblyData(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.parts = $root.mirabuf.Parts.decode(reader, reader.uint32(), $undefined, _depth + 1, message.parts);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.joints = $root.mirabuf.joint.Joints.decode(reader, reader.uint32(), $undefined, _depth + 1, message.joints);
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.materials = $root.mirabuf.material.Materials.decode(reader, reader.uint32(), $undefined, _depth + 1, message.materials);
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.signals = $root.mirabuf.signal.Signals.decode(reader, reader.uint32(), $undefined, _depth + 1, message.signals);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for AssemblyData
         * @function getTypeUrl
         * @memberof mirabuf.AssemblyData
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        AssemblyData.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.AssemblyData";
        };

        return AssemblyData;
    })();

    mirabuf.Parts = (function() {

        /**
         * Properties of a Parts.
         * @typedef {Object} mirabuf.Parts.$Properties
         * @property {mirabuf.Info.$Properties|null} [info] Part name, version, GUID
         * @property {Object.<string,mirabuf.PartDefinition.$Properties>|null} [partDefinitions] Map of the Exported Part Definitions
         * @property {Object.<string,mirabuf.PartInstance.$Properties>|null} [partInstances] Map of the Exported Parts that make up the object
         * @property {mirabuf.UserData.$Properties|null} [userData] other associated data that can be used
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Parts.
         * @memberof mirabuf
         * @interface IParts
         * @augments mirabuf.Parts.$Properties
         * @deprecated Use mirabuf.Parts.$Properties instead.
         */

        /**
         * Shape of a Parts.
         * @typedef {{
         *   info?: mirabuf.Info.$Shape|null;
         *   partDefinitions?: Object.<string,mirabuf.PartDefinition.$Shape>|null;
         *   partInstances?: Object.<string,mirabuf.PartInstance.$Shape>|null;
         *   userData?: mirabuf.UserData.$Shape|null;
         *   $unknowns?: Array.<Uint8Array>;
         * }} mirabuf.Parts.$Shape
         */

        /**
         * Constructs a new Parts.
         * @memberof mirabuf
         * @classdesc Represents a Parts.
         * @constructor
         * @param {mirabuf.Parts.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Parts = function (properties) {
            this.partDefinitions = {};
            this.partInstances = {};
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Part name, version, GUID
         * @member {mirabuf.Info.$Properties|null|undefined} info
         * @memberof mirabuf.Parts
         * @instance
         */
        Parts.prototype.info = null;

        /**
         * Map of the Exported Part Definitions
         * @member {Object.<string,mirabuf.PartDefinition.$Properties>} partDefinitions
         * @memberof mirabuf.Parts
         * @instance
         */
        Parts.prototype.partDefinitions = $util.emptyObject;

        /**
         * Map of the Exported Parts that make up the object
         * @member {Object.<string,mirabuf.PartInstance.$Properties>} partInstances
         * @memberof mirabuf.Parts
         * @instance
         */
        Parts.prototype.partInstances = $util.emptyObject;

        /**
         * other associated data that can be used
         * @member {mirabuf.UserData.$Properties|null|undefined} userData
         * @memberof mirabuf.Parts
         * @instance
         */
        Parts.prototype.userData = null;

        /**
         * Encodes the specified Parts message. Does not implicitly {@link mirabuf.Parts.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Parts
         * @static
         * @param {mirabuf.Parts.$Properties} message Parts message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Parts.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.partDefinitions != null && $Object.hasOwnProperty.call(message, "partDefinitions"))
                for (let keys = $Object.keys(message.partDefinitions), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.mirabuf.PartDefinition.encode(message.partDefinitions[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim().ldelim();
                }
            if (message.partInstances != null && $Object.hasOwnProperty.call(message, "partInstances"))
                for (let keys = $Object.keys(message.partInstances), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.mirabuf.PartInstance.encode(message.partInstances[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim().ldelim();
                }
            if (message.userData != null && $Object.hasOwnProperty.call(message, "userData"))
                $root.mirabuf.UserData.encode(message.userData, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a Parts message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Parts
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Parts & mirabuf.Parts.$Shape} Parts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Parts.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Parts(), key, value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if (message.partDefinitions === $util.emptyObject)
                            message.partDefinitions = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.tag();
                            wireType = tag2 & 7;
                            switch (tag2 >>>= 3) {
                            case 1:
                                if (wireType !== 2)
                                    break;
                                key = reader.stringVerify();
                                continue;
                            case 2:
                                if (wireType !== 2)
                                    break;
                                value = $root.mirabuf.PartDefinition.decode(reader, reader.uint32(), $undefined, _depth + 1, value);
                                continue;
                            }
                            reader.skipType(wireType, _depth, tag2);
                        }
                        if (key === "__proto__")
                            $util.makeProp(message.partDefinitions, key);
                        message.partDefinitions[key] = value || new $root.mirabuf.PartDefinition();
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if (message.partInstances === $util.emptyObject)
                            message.partInstances = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.tag();
                            wireType = tag2 & 7;
                            switch (tag2 >>>= 3) {
                            case 1:
                                if (wireType !== 2)
                                    break;
                                key = reader.stringVerify();
                                continue;
                            case 2:
                                if (wireType !== 2)
                                    break;
                                value = $root.mirabuf.PartInstance.decode(reader, reader.uint32(), $undefined, _depth + 1, value);
                                continue;
                            }
                            reader.skipType(wireType, _depth, tag2);
                        }
                        if (key === "__proto__")
                            $util.makeProp(message.partInstances, key);
                        message.partInstances[key] = value || new $root.mirabuf.PartInstance();
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.userData = $root.mirabuf.UserData.decode(reader, reader.uint32(), $undefined, _depth + 1, message.userData);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Parts
         * @function getTypeUrl
         * @memberof mirabuf.Parts
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Parts.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Parts";
        };

        return Parts;
    })();

    mirabuf.PartDefinition = (function() {

        /**
         * Properties of a PartDefinition.
         * @typedef {Object} mirabuf.PartDefinition.$Properties
         * @property {mirabuf.Info.$Properties|null} [info] Information about version - id - name
         * @property {mirabuf.PhysicalProperties.$Properties|null} [physicalData] Physical data associated with Part
         * @property {mirabuf.Transform.$Properties|null} [baseTransform] Base Transform applied - Most Likely Identity Matrix
         * @property {Array.<mirabuf.Body.$Properties>|null} [bodies] Mesh Bodies to populate part
         * @property {boolean|null} [dynamic] Optional value to state whether an object is a dynamic object in a static assembly - all children are also considered overriden
         * @property {number|null} [frictionOverride] Optional value for overriding the friction value 0-1
         * @property {number|null} [massOverride] Optional value for overriding an indiviaul object's mass
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a PartDefinition.
         * @memberof mirabuf
         * @interface IPartDefinition
         * @augments mirabuf.PartDefinition.$Properties
         * @deprecated Use mirabuf.PartDefinition.$Properties instead.
         */

        /**
         * Shape of a PartDefinition.
         * @typedef {{
         *   info?: mirabuf.Info.$Shape|null;
         *   physicalData?: mirabuf.PhysicalProperties.$Shape|null;
         *   baseTransform?: mirabuf.Transform.$Shape|null;
         *   bodies?: Array.<mirabuf.Body.$Shape>|null;
         *   dynamic?: boolean|null;
         *   frictionOverride?: number|null;
         *   massOverride?: number|null;
         *   $unknowns?: Array.<Uint8Array>;
         * }} mirabuf.PartDefinition.$Shape
         */

        /**
         * Constructs a new PartDefinition.
         * @memberof mirabuf
         * @classdesc Part Definition
         * Unique Definition of a part that can be replicated.
         * Useful for keeping the object counter down in the scene.
         * @constructor
         * @param {mirabuf.PartDefinition.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const PartDefinition = function (properties) {
            this.bodies = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Information about version - id - name
         * @member {mirabuf.Info.$Properties|null|undefined} info
         * @memberof mirabuf.PartDefinition
         * @instance
         */
        PartDefinition.prototype.info = null;

        /**
         * Physical data associated with Part
         * @member {mirabuf.PhysicalProperties.$Properties|null|undefined} physicalData
         * @memberof mirabuf.PartDefinition
         * @instance
         */
        PartDefinition.prototype.physicalData = null;

        /**
         * Base Transform applied - Most Likely Identity Matrix
         * @member {mirabuf.Transform.$Properties|null|undefined} baseTransform
         * @memberof mirabuf.PartDefinition
         * @instance
         */
        PartDefinition.prototype.baseTransform = null;

        /**
         * Mesh Bodies to populate part
         * @member {Array.<mirabuf.Body.$Properties>} bodies
         * @memberof mirabuf.PartDefinition
         * @instance
         */
        PartDefinition.prototype.bodies = $util.emptyArray;

        /**
         * Optional value to state whether an object is a dynamic object in a static assembly - all children are also considered overriden
         * @member {boolean} dynamic
         * @memberof mirabuf.PartDefinition
         * @instance
         */
        PartDefinition.prototype.dynamic = false;

        /**
         * Optional value for overriding the friction value 0-1
         * @member {number} frictionOverride
         * @memberof mirabuf.PartDefinition
         * @instance
         */
        PartDefinition.prototype.frictionOverride = 0;

        /**
         * Optional value for overriding an indiviaul object's mass
         * @member {number} massOverride
         * @memberof mirabuf.PartDefinition
         * @instance
         */
        PartDefinition.prototype.massOverride = 0;

        /**
         * Encodes the specified PartDefinition message. Does not implicitly {@link mirabuf.PartDefinition.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.PartDefinition
         * @static
         * @param {mirabuf.PartDefinition.$Properties} message PartDefinition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PartDefinition.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.physicalData != null && $Object.hasOwnProperty.call(message, "physicalData"))
                $root.mirabuf.PhysicalProperties.encode(message.physicalData, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.baseTransform != null && $Object.hasOwnProperty.call(message, "baseTransform"))
                $root.mirabuf.Transform.encode(message.baseTransform, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.bodies != null && message.bodies.length)
                for (let i = 0; i < message.bodies.length; ++i)
                    $root.mirabuf.Body.encode(message.bodies[i], writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.dynamic != null && $Object.hasOwnProperty.call(message, "dynamic") && message.dynamic !== false)
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.dynamic);
            if (message.frictionOverride != null && $Object.hasOwnProperty.call(message, "frictionOverride") && !$Object.is(message.frictionOverride, 0))
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.frictionOverride);
            if (message.massOverride != null && $Object.hasOwnProperty.call(message, "massOverride") && !$Object.is(message.massOverride, 0))
                writer.uint32(/* id 7, wireType 5 =*/61).float(message.massOverride);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a PartDefinition message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.PartDefinition
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.PartDefinition & mirabuf.PartDefinition.$Shape} PartDefinition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PartDefinition.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.PartDefinition(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.physicalData = $root.mirabuf.PhysicalProperties.decode(reader, reader.uint32(), $undefined, _depth + 1, message.physicalData);
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.baseTransform = $root.mirabuf.Transform.decode(reader, reader.uint32(), $undefined, _depth + 1, message.baseTransform);
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        if (!(message.bodies && message.bodies.length))
                            message.bodies = [];
                        message.bodies.push($root.mirabuf.Body.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.bool())
                            message.dynamic = value;
                        else
                            delete message.dynamic;
                        continue;
                    }
                case 6: {
                        if (wireType !== 5)
                            break;
                        if (!$Object.is(value = reader.float(), 0))
                            message.frictionOverride = value;
                        else
                            delete message.frictionOverride;
                        continue;
                    }
                case 7: {
                        if (wireType !== 5)
                            break;
                        if (!$Object.is(value = reader.float(), 0))
                            message.massOverride = value;
                        else
                            delete message.massOverride;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for PartDefinition
         * @function getTypeUrl
         * @memberof mirabuf.PartDefinition
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        PartDefinition.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.PartDefinition";
        };

        return PartDefinition;
    })();

    mirabuf.PartInstance = (function() {

        /**
         * Properties of a PartInstance.
         * @typedef {Object} mirabuf.PartInstance.$Properties
         * @property {mirabuf.Info.$Properties|null} [info] PartInstance info
         * @property {string|null} [partDefinitionReference] Reference to the Part Definition defined in Assembly Data
         * @property {mirabuf.Transform.$Properties|null} [transform] Overriding the object transform (moves the part from the def) - in design hierarchy context
         * @property {mirabuf.Transform.$Properties|null} [globalTransform] Position transform from a global scope
         * @property {Array.<string>|null} [joints] Joints that interact with this element
         * @property {string|null} [appearance] PartInstance appearance
         * @property {string|null} [physicalMaterial] Physical Material Reference to link to `Materials->PhysicalMaterial->Info->id`
         * @property {boolean|null} [skipCollider] Flag that if enabled indicates we should skip generating a collider, defaults to FALSE or undefined
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a PartInstance.
         * @memberof mirabuf
         * @interface IPartInstance
         * @augments mirabuf.PartInstance.$Properties
         * @deprecated Use mirabuf.PartInstance.$Properties instead.
         */

        /**
         * Shape of a PartInstance.
         * @typedef {mirabuf.PartInstance.$Properties} mirabuf.PartInstance.$Shape
         */

        /**
         * Constructs a new PartInstance.
         * @memberof mirabuf
         * @classdesc Represents a PartInstance.
         * @constructor
         * @param {mirabuf.PartInstance.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const PartInstance = function (properties) {
            this.joints = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * PartInstance info.
         * @member {mirabuf.Info.$Properties|null|undefined} info
         * @memberof mirabuf.PartInstance
         * @instance
         */
        PartInstance.prototype.info = null;

        /**
         * Reference to the Part Definition defined in Assembly Data
         * @member {string} partDefinitionReference
         * @memberof mirabuf.PartInstance
         * @instance
         */
        PartInstance.prototype.partDefinitionReference = "";

        /**
         * Overriding the object transform (moves the part from the def) - in design hierarchy context
         * @member {mirabuf.Transform.$Properties|null|undefined} transform
         * @memberof mirabuf.PartInstance
         * @instance
         */
        PartInstance.prototype.transform = null;

        /**
         * Position transform from a global scope
         * @member {mirabuf.Transform.$Properties|null|undefined} globalTransform
         * @memberof mirabuf.PartInstance
         * @instance
         */
        PartInstance.prototype.globalTransform = null;

        /**
         * Joints that interact with this element
         * @member {Array.<string>} joints
         * @memberof mirabuf.PartInstance
         * @instance
         */
        PartInstance.prototype.joints = $util.emptyArray;

        /**
         * PartInstance appearance.
         * @member {string} appearance
         * @memberof mirabuf.PartInstance
         * @instance
         */
        PartInstance.prototype.appearance = "";

        /**
         * Physical Material Reference to link to `Materials->PhysicalMaterial->Info->id`
         * @member {string} physicalMaterial
         * @memberof mirabuf.PartInstance
         * @instance
         */
        PartInstance.prototype.physicalMaterial = "";

        /**
         * Flag that if enabled indicates we should skip generating a collider, defaults to FALSE or undefined
         * @member {boolean} skipCollider
         * @memberof mirabuf.PartInstance
         * @instance
         */
        PartInstance.prototype.skipCollider = false;

        /**
         * Encodes the specified PartInstance message. Does not implicitly {@link mirabuf.PartInstance.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.PartInstance
         * @static
         * @param {mirabuf.PartInstance.$Properties} message PartInstance message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PartInstance.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.partDefinitionReference != null && $Object.hasOwnProperty.call(message, "partDefinitionReference") && message.partDefinitionReference !== "")
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.partDefinitionReference);
            if (message.transform != null && $Object.hasOwnProperty.call(message, "transform"))
                $root.mirabuf.Transform.encode(message.transform, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.globalTransform != null && $Object.hasOwnProperty.call(message, "globalTransform"))
                $root.mirabuf.Transform.encode(message.globalTransform, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.joints != null && message.joints.length)
                for (let i = 0; i < message.joints.length; ++i)
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.joints[i]);
            if (message.appearance != null && $Object.hasOwnProperty.call(message, "appearance") && message.appearance !== "")
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.appearance);
            if (message.physicalMaterial != null && $Object.hasOwnProperty.call(message, "physicalMaterial") && message.physicalMaterial !== "")
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.physicalMaterial);
            if (message.skipCollider != null && $Object.hasOwnProperty.call(message, "skipCollider") && message.skipCollider !== false)
                writer.uint32(/* id 8, wireType 0 =*/64).bool(message.skipCollider);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a PartInstance message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.PartInstance
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.PartInstance & mirabuf.PartInstance.$Shape} PartInstance
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PartInstance.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.PartInstance(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.partDefinitionReference = value;
                        else
                            delete message.partDefinitionReference;
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.transform = $root.mirabuf.Transform.decode(reader, reader.uint32(), $undefined, _depth + 1, message.transform);
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.globalTransform = $root.mirabuf.Transform.decode(reader, reader.uint32(), $undefined, _depth + 1, message.globalTransform);
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        if (!(message.joints && message.joints.length))
                            message.joints = [];
                        message.joints.push(reader.stringVerify());
                        continue;
                    }
                case 6: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.appearance = value;
                        else
                            delete message.appearance;
                        continue;
                    }
                case 7: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.physicalMaterial = value;
                        else
                            delete message.physicalMaterial;
                        continue;
                    }
                case 8: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.bool())
                            message.skipCollider = value;
                        else
                            delete message.skipCollider;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for PartInstance
         * @function getTypeUrl
         * @memberof mirabuf.PartInstance
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        PartInstance.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.PartInstance";
        };

        return PartInstance;
    })();

    mirabuf.Body = (function() {

        /**
         * Properties of a Body.
         * @typedef {Object} mirabuf.Body.$Properties
         * @property {mirabuf.Info.$Properties|null} [info] Body info
         * @property {string|null} [part] Reference to Part Definition
         * @property {mirabuf.TriangleMesh.$Properties|null} [triangleMesh] Triangle Mesh for rendering
         * @property {string|null} [appearanceOverride] Override Visual Appearance for the body
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Body.
         * @memberof mirabuf
         * @interface IBody
         * @augments mirabuf.Body.$Properties
         * @deprecated Use mirabuf.Body.$Properties instead.
         */

        /**
         * Shape of a Body.
         * @typedef {{
         *   info?: mirabuf.Info.$Shape|null;
         *   part?: string|null;
         *   triangleMesh?: mirabuf.TriangleMesh.$Shape|null;
         *   appearanceOverride?: string|null;
         *   $unknowns?: Array.<Uint8Array>;
         * }} mirabuf.Body.$Shape
         */

        /**
         * Constructs a new Body.
         * @memberof mirabuf
         * @classdesc Represents a Body.
         * @constructor
         * @param {mirabuf.Body.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Body = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Body info.
         * @member {mirabuf.Info.$Properties|null|undefined} info
         * @memberof mirabuf.Body
         * @instance
         */
        Body.prototype.info = null;

        /**
         * Reference to Part Definition
         * @member {string} part
         * @memberof mirabuf.Body
         * @instance
         */
        Body.prototype.part = "";

        /**
         * Triangle Mesh for rendering
         * @member {mirabuf.TriangleMesh.$Properties|null|undefined} triangleMesh
         * @memberof mirabuf.Body
         * @instance
         */
        Body.prototype.triangleMesh = null;

        /**
         * Override Visual Appearance for the body
         * @member {string} appearanceOverride
         * @memberof mirabuf.Body
         * @instance
         */
        Body.prototype.appearanceOverride = "";

        /**
         * Encodes the specified Body message. Does not implicitly {@link mirabuf.Body.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Body
         * @static
         * @param {mirabuf.Body.$Properties} message Body message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Body.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.part != null && $Object.hasOwnProperty.call(message, "part") && message.part !== "")
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.part);
            if (message.triangleMesh != null && $Object.hasOwnProperty.call(message, "triangleMesh"))
                $root.mirabuf.TriangleMesh.encode(message.triangleMesh, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.appearanceOverride != null && $Object.hasOwnProperty.call(message, "appearanceOverride") && message.appearanceOverride !== "")
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.appearanceOverride);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a Body message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Body
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Body & mirabuf.Body.$Shape} Body
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Body.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Body(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.part = value;
                        else
                            delete message.part;
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.triangleMesh = $root.mirabuf.TriangleMesh.decode(reader, reader.uint32(), $undefined, _depth + 1, message.triangleMesh);
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.appearanceOverride = value;
                        else
                            delete message.appearanceOverride;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Body
         * @function getTypeUrl
         * @memberof mirabuf.Body
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Body.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Body";
        };

        return Body;
    })();

    mirabuf.TriangleMesh = (function() {

        /**
         * Properties of a TriangleMesh.
         * @typedef {Object} mirabuf.TriangleMesh.$Properties
         * @property {mirabuf.Info.$Properties|null} [info] TriangleMesh info
         * @property {boolean|null} [hasVolume] Is this object a Plane ? (Does it have volume)
         * @property {string|null} [materialReference] Rendered Appearance properties referenced from Assembly Data
         * @property {mirabuf.Mesh.$Properties|null} [mesh] Stored as true types, inidicies, verts, uv
         * @property {mirabuf.BinaryMesh.$Properties|null} [bmesh] Stored as binary data in bytes
         * @property {"mesh"|"bmesh"} [meshType] What kind of Mesh Data exists in this Triangle Mesh
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a TriangleMesh.
         * @memberof mirabuf
         * @interface ITriangleMesh
         * @augments mirabuf.TriangleMesh.$Properties
         * @deprecated Use mirabuf.TriangleMesh.$Properties instead.
         */

        /**
         * Narrowed shape of a TriangleMesh.
         * @typedef {{
         *   info?: mirabuf.Info.$Shape|null;
         *   hasVolume?: boolean|null;
         *   materialReference?: string|null;
         *   mesh?: mirabuf.Mesh.$Shape|null;
         *   bmesh?: mirabuf.BinaryMesh.$Shape|null;
         *   $unknowns?: Array.<Uint8Array>;
         * } & (
         *   ({ meshType?: undefined; mesh?: null; bmesh?: null }|{ meshType?: "mesh"; mesh: mirabuf.Mesh.$Shape; bmesh?: null }|{ meshType?: "bmesh"; mesh?: null; bmesh: mirabuf.BinaryMesh.$Shape })
         * )} mirabuf.TriangleMesh.$Shape
         */

        /**
         * Constructs a new TriangleMesh.
         * @memberof mirabuf
         * @classdesc Traingle Mesh for Storing Display Mesh data
         * @constructor
         * @param {mirabuf.TriangleMesh.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const TriangleMesh = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * TriangleMesh info.
         * @member {mirabuf.Info.$Properties|null|undefined} info
         * @memberof mirabuf.TriangleMesh
         * @instance
         */
        TriangleMesh.prototype.info = null;

        /**
         * Is this object a Plane ? (Does it have volume)
         * @member {boolean} hasVolume
         * @memberof mirabuf.TriangleMesh
         * @instance
         */
        TriangleMesh.prototype.hasVolume = false;

        /**
         * Rendered Appearance properties referenced from Assembly Data
         * @member {string} materialReference
         * @memberof mirabuf.TriangleMesh
         * @instance
         */
        TriangleMesh.prototype.materialReference = "";

        /**
         * Stored as true types, inidicies, verts, uv
         * @member {mirabuf.Mesh.$Properties|null|undefined} mesh
         * @memberof mirabuf.TriangleMesh
         * @instance
         */
        TriangleMesh.prototype.mesh = null;

        /**
         * Stored as binary data in bytes
         * @member {mirabuf.BinaryMesh.$Properties|null|undefined} bmesh
         * @memberof mirabuf.TriangleMesh
         * @instance
         */
        TriangleMesh.prototype.bmesh = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        /**
         * What kind of Mesh Data exists in this Triangle Mesh
         * @member {"mesh"|"bmesh"|undefined} meshType
         * @memberof mirabuf.TriangleMesh
         * @instance
         */
        $Object.defineProperty(TriangleMesh.prototype, "meshType", {
            get: $util.oneOfGetter($oneOfFields = ["mesh", "bmesh"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Encodes the specified TriangleMesh message. Does not implicitly {@link mirabuf.TriangleMesh.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.TriangleMesh
         * @static
         * @param {mirabuf.TriangleMesh.$Properties} message TriangleMesh message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TriangleMesh.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.hasVolume != null && $Object.hasOwnProperty.call(message, "hasVolume") && message.hasVolume !== false)
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.hasVolume);
            if (message.materialReference != null && $Object.hasOwnProperty.call(message, "materialReference") && message.materialReference !== "")
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.materialReference);
            if (message.mesh != null && $Object.hasOwnProperty.call(message, "mesh"))
                $root.mirabuf.Mesh.encode(message.mesh, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
            if (message.bmesh != null && $Object.hasOwnProperty.call(message, "bmesh"))
                $root.mirabuf.BinaryMesh.encode(message.bmesh, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a TriangleMesh message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.TriangleMesh
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.TriangleMesh & mirabuf.TriangleMesh.$Shape} TriangleMesh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TriangleMesh.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.TriangleMesh(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.bool())
                            message.hasVolume = value;
                        else
                            delete message.hasVolume;
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.materialReference = value;
                        else
                            delete message.materialReference;
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        message.mesh = $root.mirabuf.Mesh.decode(reader, reader.uint32(), $undefined, _depth + 1, message.mesh);
                        message.meshType = "mesh";
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.bmesh = $root.mirabuf.BinaryMesh.decode(reader, reader.uint32(), $undefined, _depth + 1, message.bmesh);
                        message.meshType = "bmesh";
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for TriangleMesh
         * @function getTypeUrl
         * @memberof mirabuf.TriangleMesh
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TriangleMesh.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.TriangleMesh";
        };

        return TriangleMesh;
    })();

    mirabuf.Mesh = (function() {

        /**
         * Properties of a Mesh.
         * @typedef {Object} mirabuf.Mesh.$Properties
         * @property {Array.<number>|null} [verts] Tri Mesh Verts vec3
         * @property {Array.<number>|null} [normals] Tri Mesh Normals vec3
         * @property {Array.<number>|null} [uv] Tri Mesh uv Mapping vec2
         * @property {Array.<number>|null} [indices] Tri Mesh indicies (Vert Map)
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Mesh.
         * @memberof mirabuf
         * @interface IMesh
         * @augments mirabuf.Mesh.$Properties
         * @deprecated Use mirabuf.Mesh.$Properties instead.
         */

        /**
         * Shape of a Mesh.
         * @typedef {mirabuf.Mesh.$Properties} mirabuf.Mesh.$Shape
         */

        /**
         * Constructs a new Mesh.
         * @memberof mirabuf
         * @classdesc Mesh Data stored as generic Data Structure
         * @constructor
         * @param {mirabuf.Mesh.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Mesh = function (properties) {
            this.verts = [];
            this.normals = [];
            this.uv = [];
            this.indices = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Tri Mesh Verts vec3
         * @member {Array.<number>} verts
         * @memberof mirabuf.Mesh
         * @instance
         */
        Mesh.prototype.verts = $util.emptyArray;

        /**
         * Tri Mesh Normals vec3
         * @member {Array.<number>} normals
         * @memberof mirabuf.Mesh
         * @instance
         */
        Mesh.prototype.normals = $util.emptyArray;

        /**
         * Tri Mesh uv Mapping vec2
         * @member {Array.<number>} uv
         * @memberof mirabuf.Mesh
         * @instance
         */
        Mesh.prototype.uv = $util.emptyArray;

        /**
         * Tri Mesh indicies (Vert Map)
         * @member {Array.<number>} indices
         * @memberof mirabuf.Mesh
         * @instance
         */
        Mesh.prototype.indices = $util.emptyArray;

        /**
         * Encodes the specified Mesh message. Does not implicitly {@link mirabuf.Mesh.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Mesh
         * @static
         * @param {mirabuf.Mesh.$Properties} message Mesh message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Mesh.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.verts != null && message.verts.length)
                writer.uint32(/* id 1, wireType 2 =*/10).floats(message.verts);
            if (message.normals != null && message.normals.length)
                writer.uint32(/* id 2, wireType 2 =*/18).floats(message.normals);
            if (message.uv != null && message.uv.length)
                writer.uint32(/* id 3, wireType 2 =*/26).floats(message.uv);
            if (message.indices != null && message.indices.length)
                writer.uint32(/* id 4, wireType 2 =*/34).int32s(message.indices);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a Mesh message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Mesh
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Mesh & mirabuf.Mesh.$Shape} Mesh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Mesh.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Mesh();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType === 2) {
                            if (!(message.verts && message.verts.length))
                                message.verts = [];
                            reader.floats(message.verts);
                            continue;
                        }
                        if (wireType !== 5)
                            break;
                        if (!(message.verts && message.verts.length))
                            message.verts = [];
                        message.verts.push(reader.float());
                        continue;
                    }
                case 2: {
                        if (wireType === 2) {
                            if (!(message.normals && message.normals.length))
                                message.normals = [];
                            reader.floats(message.normals);
                            continue;
                        }
                        if (wireType !== 5)
                            break;
                        if (!(message.normals && message.normals.length))
                            message.normals = [];
                        message.normals.push(reader.float());
                        continue;
                    }
                case 3: {
                        if (wireType === 2) {
                            if (!(message.uv && message.uv.length))
                                message.uv = [];
                            reader.floats(message.uv);
                            continue;
                        }
                        if (wireType !== 5)
                            break;
                        if (!(message.uv && message.uv.length))
                            message.uv = [];
                        message.uv.push(reader.float());
                        continue;
                    }
                case 4: {
                        if (wireType === 2) {
                            if (!(message.indices && message.indices.length))
                                message.indices = [];
                            reader.int32s(message.indices);
                            continue;
                        }
                        if (wireType !== 0)
                            break;
                        if (!(message.indices && message.indices.length))
                            message.indices = [];
                        message.indices.push(reader.int32());
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Mesh
         * @function getTypeUrl
         * @memberof mirabuf.Mesh
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Mesh.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Mesh";
        };

        return Mesh;
    })();

    mirabuf.BinaryMesh = (function() {

        /**
         * Properties of a BinaryMesh.
         * @typedef {Object} mirabuf.BinaryMesh.$Properties
         * @property {Uint8Array|null} [data] BEWARE of ENDIANESS
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a BinaryMesh.
         * @memberof mirabuf
         * @interface IBinaryMesh
         * @augments mirabuf.BinaryMesh.$Properties
         * @deprecated Use mirabuf.BinaryMesh.$Properties instead.
         */

        /**
         * Shape of a BinaryMesh.
         * @typedef {mirabuf.BinaryMesh.$Properties} mirabuf.BinaryMesh.$Shape
         */

        /**
         * Constructs a new BinaryMesh.
         * @memberof mirabuf
         * @classdesc Mesh used for more effective file transfers
         * @constructor
         * @param {mirabuf.BinaryMesh.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const BinaryMesh = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * BEWARE of ENDIANESS
         * @member {Uint8Array} data
         * @memberof mirabuf.BinaryMesh
         * @instance
         */
        BinaryMesh.prototype.data = $util.newBuffer([]);

        /**
         * Encodes the specified BinaryMesh message. Does not implicitly {@link mirabuf.BinaryMesh.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.BinaryMesh
         * @static
         * @param {mirabuf.BinaryMesh.$Properties} message BinaryMesh message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BinaryMesh.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.data != null && $Object.hasOwnProperty.call(message, "data") && message.data.length)
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a BinaryMesh message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.BinaryMesh
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.BinaryMesh & mirabuf.BinaryMesh.$Shape} BinaryMesh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BinaryMesh.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.BinaryMesh(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.bytes()).length)
                            message.data = value;
                        else
                            delete message.data;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for BinaryMesh
         * @function getTypeUrl
         * @memberof mirabuf.BinaryMesh
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        BinaryMesh.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.BinaryMesh";
        };

        return BinaryMesh;
    })();

    mirabuf.Node = (function() {

        /**
         * Properties of a Node.
         * @typedef {Object} mirabuf.Node.$Properties
         * @property {string|null} [value] the reference ID for whatever kind of graph this is
         * @property {Array.<mirabuf.Node.$Properties>|null} [children] the children for the given leaf
         * @property {mirabuf.UserData.$Properties|null} [userData] other associated data that can be used
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Node.
         * @memberof mirabuf
         * @interface INode
         * @augments mirabuf.Node.$Properties
         * @deprecated Use mirabuf.Node.$Properties instead.
         */

        /**
         * Shape of a Node.
         * @typedef {mirabuf.Node.$Properties} mirabuf.Node.$Shape
         */

        /**
         * Constructs a new Node.
         * @memberof mirabuf
         * @classdesc Represents a Node.
         * @constructor
         * @param {mirabuf.Node.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Node = function (properties) {
            this.children = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * the reference ID for whatever kind of graph this is
         * @member {string} value
         * @memberof mirabuf.Node
         * @instance
         */
        Node.prototype.value = "";

        /**
         * the children for the given leaf
         * @member {Array.<mirabuf.Node.$Properties>} children
         * @memberof mirabuf.Node
         * @instance
         */
        Node.prototype.children = $util.emptyArray;

        /**
         * other associated data that can be used
         * @member {mirabuf.UserData.$Properties|null|undefined} userData
         * @memberof mirabuf.Node
         * @instance
         */
        Node.prototype.userData = null;

        /**
         * Encodes the specified Node message. Does not implicitly {@link mirabuf.Node.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Node
         * @static
         * @param {mirabuf.Node.$Properties} message Node message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Node.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.value != null && $Object.hasOwnProperty.call(message, "value") && message.value !== "")
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
            if (message.children != null && message.children.length)
                for (let i = 0; i < message.children.length; ++i)
                    $root.mirabuf.Node.encode(message.children[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
            if (message.userData != null && $Object.hasOwnProperty.call(message, "userData"))
                $root.mirabuf.UserData.encode(message.userData, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a Node message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Node
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Node & mirabuf.Node.$Shape} Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Node.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Node(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.value = value;
                        else
                            delete message.value;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if (!(message.children && message.children.length))
                            message.children = [];
                        message.children.push($root.mirabuf.Node.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        message.userData = $root.mirabuf.UserData.decode(reader, reader.uint32(), $undefined, _depth + 1, message.userData);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Node
         * @function getTypeUrl
         * @memberof mirabuf.Node
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Node.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Node";
        };

        return Node;
    })();

    mirabuf.GraphContainer = (function() {

        /**
         * Properties of a GraphContainer.
         * @typedef {Object} mirabuf.GraphContainer.$Properties
         * @property {Array.<mirabuf.Node.$Properties>|null} [nodes] GraphContainer nodes
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a GraphContainer.
         * @memberof mirabuf
         * @interface IGraphContainer
         * @augments mirabuf.GraphContainer.$Properties
         * @deprecated Use mirabuf.GraphContainer.$Properties instead.
         */

        /**
         * Shape of a GraphContainer.
         * @typedef {mirabuf.GraphContainer.$Properties} mirabuf.GraphContainer.$Shape
         */

        /**
         * Constructs a new GraphContainer.
         * @memberof mirabuf
         * @classdesc Represents a GraphContainer.
         * @constructor
         * @param {mirabuf.GraphContainer.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const GraphContainer = function (properties) {
            this.nodes = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * GraphContainer nodes.
         * @member {Array.<mirabuf.Node.$Properties>} nodes
         * @memberof mirabuf.GraphContainer
         * @instance
         */
        GraphContainer.prototype.nodes = $util.emptyArray;

        /**
         * Encodes the specified GraphContainer message. Does not implicitly {@link mirabuf.GraphContainer.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.GraphContainer
         * @static
         * @param {mirabuf.GraphContainer.$Properties} message GraphContainer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GraphContainer.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.nodes != null && message.nodes.length)
                for (let i = 0; i < message.nodes.length; ++i)
                    $root.mirabuf.Node.encode(message.nodes[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a GraphContainer message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.GraphContainer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.GraphContainer & mirabuf.GraphContainer.$Shape} GraphContainer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GraphContainer.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.GraphContainer();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.nodes && message.nodes.length))
                            message.nodes = [];
                        message.nodes.push($root.mirabuf.Node.decode(reader, reader.uint32(), $undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for GraphContainer
         * @function getTypeUrl
         * @memberof mirabuf.GraphContainer
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        GraphContainer.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.GraphContainer";
        };

        return GraphContainer;
    })();

    mirabuf.UserData = (function() {

        /**
         * Properties of a UserData.
         * @typedef {Object} mirabuf.UserData.$Properties
         * @property {Object.<string,string>|null} [data] e.g. data["wheel"] = "yes"
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a UserData.
         * @memberof mirabuf
         * @interface IUserData
         * @augments mirabuf.UserData.$Properties
         * @deprecated Use mirabuf.UserData.$Properties instead.
         */

        /**
         * Shape of a UserData.
         * @typedef {mirabuf.UserData.$Properties} mirabuf.UserData.$Shape
         */

        /**
         * Constructs a new UserData.
         * @memberof mirabuf
         * @classdesc UserData
         * 
         * Arbitrary data to append to a given message in map form
         * @constructor
         * @param {mirabuf.UserData.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const UserData = function (properties) {
            this.data = {};
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * e.g. data["wheel"] = "yes"
         * @member {Object.<string,string>} data
         * @memberof mirabuf.UserData
         * @instance
         */
        UserData.prototype.data = $util.emptyObject;

        /**
         * Encodes the specified UserData message. Does not implicitly {@link mirabuf.UserData.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.UserData
         * @static
         * @param {mirabuf.UserData.$Properties} message UserData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserData.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.data != null && $Object.hasOwnProperty.call(message, "data"))
                for (let keys = $Object.keys(message.data), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.data[keys[i]]).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a UserData message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.UserData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.UserData & mirabuf.UserData.$Shape} UserData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserData.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.UserData(), key, value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (message.data === $util.emptyObject)
                            message.data = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.tag();
                            wireType = tag2 & 7;
                            switch (tag2 >>>= 3) {
                            case 1:
                                if (wireType !== 2)
                                    break;
                                key = reader.stringVerify();
                                continue;
                            case 2:
                                if (wireType !== 2)
                                    break;
                                value = reader.stringVerify();
                                continue;
                            }
                            reader.skipType(wireType, _depth, tag2);
                        }
                        if (key === "__proto__")
                            $util.makeProp(message.data, key);
                        message.data[key] = value;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for UserData
         * @function getTypeUrl
         * @memberof mirabuf.UserData
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        UserData.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.UserData";
        };

        return UserData;
    })();

    mirabuf.Vector3 = (function() {

        /**
         * Properties of a Vector3.
         * @typedef {Object} mirabuf.Vector3.$Properties
         * @property {number|null} [x] Vector3 x
         * @property {number|null} [y] Vector3 y
         * @property {number|null} [z] Vector3 z
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Vector3.
         * @memberof mirabuf
         * @interface IVector3
         * @augments mirabuf.Vector3.$Properties
         * @deprecated Use mirabuf.Vector3.$Properties instead.
         */

        /**
         * Shape of a Vector3.
         * @typedef {mirabuf.Vector3.$Properties} mirabuf.Vector3.$Shape
         */

        /**
         * Constructs a new Vector3.
         * @memberof mirabuf
         * @classdesc Represents a Vector3.
         * @constructor
         * @param {mirabuf.Vector3.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Vector3 = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Vector3 x.
         * @member {number} x
         * @memberof mirabuf.Vector3
         * @instance
         */
        Vector3.prototype.x = 0;

        /**
         * Vector3 y.
         * @member {number} y
         * @memberof mirabuf.Vector3
         * @instance
         */
        Vector3.prototype.y = 0;

        /**
         * Vector3 z.
         * @member {number} z
         * @memberof mirabuf.Vector3
         * @instance
         */
        Vector3.prototype.z = 0;

        /**
         * Encodes the specified Vector3 message. Does not implicitly {@link mirabuf.Vector3.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Vector3
         * @static
         * @param {mirabuf.Vector3.$Properties} message Vector3 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Vector3.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.x != null && $Object.hasOwnProperty.call(message, "x") && !$Object.is(message.x, 0))
                writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
            if (message.y != null && $Object.hasOwnProperty.call(message, "y") && !$Object.is(message.y, 0))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
            if (message.z != null && $Object.hasOwnProperty.call(message, "z") && !$Object.is(message.z, 0))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.z);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a Vector3 message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Vector3
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Vector3 & mirabuf.Vector3.$Shape} Vector3
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Vector3.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Vector3(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 5)
                            break;
                        if (!$Object.is(value = reader.float(), 0))
                            message.x = value;
                        else
                            delete message.x;
                        continue;
                    }
                case 2: {
                        if (wireType !== 5)
                            break;
                        if (!$Object.is(value = reader.float(), 0))
                            message.y = value;
                        else
                            delete message.y;
                        continue;
                    }
                case 3: {
                        if (wireType !== 5)
                            break;
                        if (!$Object.is(value = reader.float(), 0))
                            message.z = value;
                        else
                            delete message.z;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Vector3
         * @function getTypeUrl
         * @memberof mirabuf.Vector3
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Vector3.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Vector3";
        };

        return Vector3;
    })();

    mirabuf.PhysicalProperties = (function() {

        /**
         * Properties of a PhysicalProperties.
         * @typedef {Object} mirabuf.PhysicalProperties.$Properties
         * @property {number|null} [density] kg per cubic cm kg/(cm^3)
         * @property {number|null} [mass] kg
         * @property {number|null} [volume] cm^3
         * @property {number|null} [area] cm^2
         * @property {mirabuf.Vector3.$Properties|null} [com] non-negative? Vec3
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a PhysicalProperties.
         * @memberof mirabuf
         * @interface IPhysicalProperties
         * @augments mirabuf.PhysicalProperties.$Properties
         * @deprecated Use mirabuf.PhysicalProperties.$Properties instead.
         */

        /**
         * Shape of a PhysicalProperties.
         * @typedef {mirabuf.PhysicalProperties.$Properties} mirabuf.PhysicalProperties.$Shape
         */

        /**
         * Constructs a new PhysicalProperties.
         * @memberof mirabuf
         * @classdesc Represents a PhysicalProperties.
         * @constructor
         * @param {mirabuf.PhysicalProperties.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const PhysicalProperties = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * kg per cubic cm kg/(cm^3)
         * @member {number} density
         * @memberof mirabuf.PhysicalProperties
         * @instance
         */
        PhysicalProperties.prototype.density = 0;

        /**
         * kg
         * @member {number} mass
         * @memberof mirabuf.PhysicalProperties
         * @instance
         */
        PhysicalProperties.prototype.mass = 0;

        /**
         * cm^3
         * @member {number} volume
         * @memberof mirabuf.PhysicalProperties
         * @instance
         */
        PhysicalProperties.prototype.volume = 0;

        /**
         * cm^2
         * @member {number} area
         * @memberof mirabuf.PhysicalProperties
         * @instance
         */
        PhysicalProperties.prototype.area = 0;

        /**
         * non-negative? Vec3
         * @member {mirabuf.Vector3.$Properties|null|undefined} com
         * @memberof mirabuf.PhysicalProperties
         * @instance
         */
        PhysicalProperties.prototype.com = null;

        /**
         * Encodes the specified PhysicalProperties message. Does not implicitly {@link mirabuf.PhysicalProperties.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.PhysicalProperties
         * @static
         * @param {mirabuf.PhysicalProperties.$Properties} message PhysicalProperties message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PhysicalProperties.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.density != null && $Object.hasOwnProperty.call(message, "density") && !$Object.is(message.density, 0))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.density);
            if (message.mass != null && $Object.hasOwnProperty.call(message, "mass") && !$Object.is(message.mass, 0))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.mass);
            if (message.volume != null && $Object.hasOwnProperty.call(message, "volume") && !$Object.is(message.volume, 0))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.volume);
            if (message.area != null && $Object.hasOwnProperty.call(message, "area") && !$Object.is(message.area, 0))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.area);
            if (message.com != null && $Object.hasOwnProperty.call(message, "com"))
                $root.mirabuf.Vector3.encode(message.com, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a PhysicalProperties message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.PhysicalProperties
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.PhysicalProperties & mirabuf.PhysicalProperties.$Shape} PhysicalProperties
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PhysicalProperties.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.PhysicalProperties(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 1)
                            break;
                        if (!$Object.is(value = reader.double(), 0))
                            message.density = value;
                        else
                            delete message.density;
                        continue;
                    }
                case 2: {
                        if (wireType !== 1)
                            break;
                        if (!$Object.is(value = reader.double(), 0))
                            message.mass = value;
                        else
                            delete message.mass;
                        continue;
                    }
                case 3: {
                        if (wireType !== 1)
                            break;
                        if (!$Object.is(value = reader.double(), 0))
                            message.volume = value;
                        else
                            delete message.volume;
                        continue;
                    }
                case 4: {
                        if (wireType !== 1)
                            break;
                        if (!$Object.is(value = reader.double(), 0))
                            message.area = value;
                        else
                            delete message.area;
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.com = $root.mirabuf.Vector3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.com);
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for PhysicalProperties
         * @function getTypeUrl
         * @memberof mirabuf.PhysicalProperties
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        PhysicalProperties.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.PhysicalProperties";
        };

        return PhysicalProperties;
    })();

    mirabuf.Transform = (function() {

        /**
         * Properties of a Transform.
         * @typedef {Object} mirabuf.Transform.$Properties
         * @property {Array.<number>|null} [spatialMatrix] Transform spatialMatrix
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Transform.
         * @memberof mirabuf
         * @interface ITransform
         * @augments mirabuf.Transform.$Properties
         * @deprecated Use mirabuf.Transform.$Properties instead.
         */

        /**
         * Shape of a Transform.
         * @typedef {mirabuf.Transform.$Properties} mirabuf.Transform.$Shape
         */

        /**
         * Constructs a new Transform.
         * @memberof mirabuf
         * @classdesc Transform
         * 
         * Data needed to apply scale, position, and rotational changes
         * @constructor
         * @param {mirabuf.Transform.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Transform = function (properties) {
            this.spatialMatrix = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Transform spatialMatrix.
         * @member {Array.<number>} spatialMatrix
         * @memberof mirabuf.Transform
         * @instance
         */
        Transform.prototype.spatialMatrix = $util.emptyArray;

        /**
         * Encodes the specified Transform message. Does not implicitly {@link mirabuf.Transform.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Transform
         * @static
         * @param {mirabuf.Transform.$Properties} message Transform message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transform.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.spatialMatrix != null && message.spatialMatrix.length)
                writer.uint32(/* id 1, wireType 2 =*/10).floats(message.spatialMatrix);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a Transform message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Transform
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Transform & mirabuf.Transform.$Shape} Transform
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transform.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Transform();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType === 2) {
                            if (!(message.spatialMatrix && message.spatialMatrix.length))
                                message.spatialMatrix = [];
                            reader.floats(message.spatialMatrix);
                            continue;
                        }
                        if (wireType !== 5)
                            break;
                        if (!(message.spatialMatrix && message.spatialMatrix.length))
                            message.spatialMatrix = [];
                        message.spatialMatrix.push(reader.float());
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Transform
         * @function getTypeUrl
         * @memberof mirabuf.Transform
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Transform.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Transform";
        };

        return Transform;
    })();

    mirabuf.Color = (function() {

        /**
         * Properties of a Color.
         * @typedef {Object} mirabuf.Color.$Properties
         * @property {number|null} [R] Color R
         * @property {number|null} [G] Color G
         * @property {number|null} [B] Color B
         * @property {number|null} [A] Color A
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Color.
         * @memberof mirabuf
         * @interface IColor
         * @augments mirabuf.Color.$Properties
         * @deprecated Use mirabuf.Color.$Properties instead.
         */

        /**
         * Shape of a Color.
         * @typedef {mirabuf.Color.$Properties} mirabuf.Color.$Shape
         */

        /**
         * Constructs a new Color.
         * @memberof mirabuf
         * @classdesc Represents a Color.
         * @constructor
         * @param {mirabuf.Color.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Color = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Color R.
         * @member {number} R
         * @memberof mirabuf.Color
         * @instance
         */
        Color.prototype.R = 0;

        /**
         * Color G.
         * @member {number} G
         * @memberof mirabuf.Color
         * @instance
         */
        Color.prototype.G = 0;

        /**
         * Color B.
         * @member {number} B
         * @memberof mirabuf.Color
         * @instance
         */
        Color.prototype.B = 0;

        /**
         * Color A.
         * @member {number} A
         * @memberof mirabuf.Color
         * @instance
         */
        Color.prototype.A = 0;

        /**
         * Encodes the specified Color message. Does not implicitly {@link mirabuf.Color.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Color
         * @static
         * @param {mirabuf.Color.$Properties} message Color message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Color.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.R != null && $Object.hasOwnProperty.call(message, "R") && message.R !== 0)
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.R);
            if (message.G != null && $Object.hasOwnProperty.call(message, "G") && message.G !== 0)
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.G);
            if (message.B != null && $Object.hasOwnProperty.call(message, "B") && message.B !== 0)
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.B);
            if (message.A != null && $Object.hasOwnProperty.call(message, "A") && message.A !== 0)
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.A);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a Color message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Color
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Color & mirabuf.Color.$Shape} Color
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Color.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Color(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.int32())
                            message.R = value;
                        else
                            delete message.R;
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.int32())
                            message.G = value;
                        else
                            delete message.G;
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.int32())
                            message.B = value;
                        else
                            delete message.B;
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.int32())
                            message.A = value;
                        else
                            delete message.A;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Color
         * @function getTypeUrl
         * @memberof mirabuf.Color
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Color.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Color";
        };

        return Color;
    })();

    /**
     * Axis enum.
     * @name mirabuf.Axis
     * @enum {number}
     * @property {number} X=0 X value
     * @property {number} Y=1 Y value
     * @property {number} Z=2 Z value
     */
    mirabuf.Axis = (function() {
        const valuesById = $Object.create(null), values = $Object.create(valuesById);
        values[valuesById[0] = "X"] = 0;
        values[valuesById[1] = "Y"] = 1;
        values[valuesById[2] = "Z"] = 2;
        return values;
    })();

    mirabuf.Info = (function() {

        /**
         * Properties of an Info.
         * @typedef {Object} mirabuf.Info.$Properties
         * @property {string|null} [GUID] Info GUID
         * @property {string|null} [name] Info name
         * @property {number|null} [version] Info version
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of an Info.
         * @memberof mirabuf
         * @interface IInfo
         * @augments mirabuf.Info.$Properties
         * @deprecated Use mirabuf.Info.$Properties instead.
         */

        /**
         * Shape of an Info.
         * @typedef {mirabuf.Info.$Properties} mirabuf.Info.$Shape
         */

        /**
         * Constructs a new Info.
         * @memberof mirabuf
         * @classdesc Defines basic fields for almost all objects
         * The location where you can access the GUID for a reference
         * @constructor
         * @param {mirabuf.Info.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Info = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Info GUID.
         * @member {string} GUID
         * @memberof mirabuf.Info
         * @instance
         */
        Info.prototype.GUID = "";

        /**
         * Info name.
         * @member {string} name
         * @memberof mirabuf.Info
         * @instance
         */
        Info.prototype.name = "";

        /**
         * Info version.
         * @member {number} version
         * @memberof mirabuf.Info
         * @instance
         */
        Info.prototype.version = 0;

        /**
         * Encodes the specified Info message. Does not implicitly {@link mirabuf.Info.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Info
         * @static
         * @param {mirabuf.Info.$Properties} message Info message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Info.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.GUID != null && $Object.hasOwnProperty.call(message, "GUID") && message.GUID !== "")
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.GUID);
            if (message.name != null && $Object.hasOwnProperty.call(message, "name") && message.name !== "")
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.version != null && $Object.hasOwnProperty.call(message, "version") && message.version !== 0)
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.version);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes an Info message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Info
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Info & mirabuf.Info.$Shape} Info
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Info.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Info(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.GUID = value;
                        else
                            delete message.GUID;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.name = value;
                        else
                            delete message.name;
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.uint32())
                            message.version = value;
                        else
                            delete message.version;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Info
         * @function getTypeUrl
         * @memberof mirabuf.Info
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Info.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Info";
        };

        return Info;
    })();

    mirabuf.Thumbnail = (function() {

        /**
         * Properties of a Thumbnail.
         * @typedef {Object} mirabuf.Thumbnail.$Properties
         * @property {number|null} [width] Image Width
         * @property {number|null} [height] Image Height
         * @property {string|null} [extension] Image Extension - ex. (.png, .bitmap, .jpeg)
         * @property {boolean|null} [transparent] Transparency - true from fusion when correctly configured
         * @property {Uint8Array|null} [data] Data as read from the file in bytes[] form
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Thumbnail.
         * @memberof mirabuf
         * @interface IThumbnail
         * @augments mirabuf.Thumbnail.$Properties
         * @deprecated Use mirabuf.Thumbnail.$Properties instead.
         */

        /**
         * Shape of a Thumbnail.
         * @typedef {mirabuf.Thumbnail.$Properties} mirabuf.Thumbnail.$Shape
         */

        /**
         * Constructs a new Thumbnail.
         * @memberof mirabuf
         * @classdesc A basic Thumbnail to be encoded in the file
         * Most of the Time Fusion can encode the file with transparency as PNG not bitmap
         * @constructor
         * @param {mirabuf.Thumbnail.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Thumbnail = function (properties) {
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Image Width
         * @member {number} width
         * @memberof mirabuf.Thumbnail
         * @instance
         */
        Thumbnail.prototype.width = 0;

        /**
         * Image Height
         * @member {number} height
         * @memberof mirabuf.Thumbnail
         * @instance
         */
        Thumbnail.prototype.height = 0;

        /**
         * Image Extension - ex. (.png, .bitmap, .jpeg)
         * @member {string} extension
         * @memberof mirabuf.Thumbnail
         * @instance
         */
        Thumbnail.prototype.extension = "";

        /**
         * Transparency - true from fusion when correctly configured
         * @member {boolean} transparent
         * @memberof mirabuf.Thumbnail
         * @instance
         */
        Thumbnail.prototype.transparent = false;

        /**
         * Data as read from the file in bytes[] form
         * @member {Uint8Array} data
         * @memberof mirabuf.Thumbnail
         * @instance
         */
        Thumbnail.prototype.data = $util.newBuffer([]);

        /**
         * Encodes the specified Thumbnail message. Does not implicitly {@link mirabuf.Thumbnail.verify|verify} messages.
         * @function encode
         * @memberof mirabuf.Thumbnail
         * @static
         * @param {mirabuf.Thumbnail.$Properties} message Thumbnail message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Thumbnail.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.width != null && $Object.hasOwnProperty.call(message, "width") && message.width !== 0)
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.width);
            if (message.height != null && $Object.hasOwnProperty.call(message, "height") && message.height !== 0)
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.height);
            if (message.extension != null && $Object.hasOwnProperty.call(message, "extension") && message.extension !== "")
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.extension);
            if (message.transparent != null && $Object.hasOwnProperty.call(message, "transparent") && message.transparent !== false)
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.transparent);
            if (message.data != null && $Object.hasOwnProperty.call(message, "data") && message.data.length)
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.data);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Decodes a Thumbnail message from the specified reader or buffer.
         * @function decode
         * @memberof mirabuf.Thumbnail
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {mirabuf.Thumbnail & mirabuf.Thumbnail.$Shape} Thumbnail
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Thumbnail.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.Thumbnail(), value;
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.int32())
                            message.width = value;
                        else
                            delete message.width;
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.int32())
                            message.height = value;
                        else
                            delete message.height;
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.stringVerify()).length)
                            message.extension = value;
                        else
                            delete message.extension;
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.bool())
                            message.transparent = value;
                        else
                            delete message.transparent;
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.bytes()).length)
                            message.data = value;
                        else
                            delete message.data;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Gets the type url for Thumbnail
         * @function getTypeUrl
         * @memberof mirabuf.Thumbnail
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Thumbnail.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/mirabuf.Thumbnail";
        };

        return Thumbnail;
    })();

    mirabuf.joint = (function() {

        /**
         * Namespace joint.
         * @memberof mirabuf
         * @namespace
         */
        const joint = {};

        joint.Joints = (function() {

            /**
             * Properties of a Joints.
             * @typedef {Object} mirabuf.joint.Joints.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] name, version, uid
             * @property {Object.<string,mirabuf.joint.Joint.$Properties>|null} [jointDefinitions] Unique Joint Implementations
             * @property {Object.<string,mirabuf.joint.JointInstance.$Properties>|null} [jointInstances] Instances of the Joint Implementations
             * @property {Array.<mirabuf.joint.RigidGroup.$Properties>|null} [rigidGroups] Rigidgroups ?
             * @property {Object.<string,mirabuf.motor.Motor.$Properties>|null} [motorDefinitions] Collection of all Motors exported
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Joints.
             * @memberof mirabuf.joint
             * @interface IJoints
             * @augments mirabuf.joint.Joints.$Properties
             * @deprecated Use mirabuf.joint.Joints.$Properties instead.
             */

            /**
             * Shape of a Joints.
             * @typedef {{
             *   info?: mirabuf.Info.$Shape|null;
             *   jointDefinitions?: Object.<string,mirabuf.joint.Joint.$Shape>|null;
             *   jointInstances?: Object.<string,mirabuf.joint.JointInstance.$Shape>|null;
             *   rigidGroups?: Array.<mirabuf.joint.RigidGroup.$Shape>|null;
             *   motorDefinitions?: Object.<string,mirabuf.motor.Motor.$Shape>|null;
             *   $unknowns?: Array.<Uint8Array>;
             * }} mirabuf.joint.Joints.$Shape
             */

            /**
             * Constructs a new Joints.
             * @memberof mirabuf.joint
             * @classdesc Joints
             * A way to define the motion between various group connections
             * @constructor
             * @param {mirabuf.joint.Joints.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Joints = function (properties) {
                this.jointDefinitions = {};
                this.jointInstances = {};
                this.rigidGroups = [];
                this.motorDefinitions = {};
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * name, version, uid
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.joint.Joints
             * @instance
             */
            Joints.prototype.info = null;

            /**
             * Unique Joint Implementations
             * @member {Object.<string,mirabuf.joint.Joint.$Properties>} jointDefinitions
             * @memberof mirabuf.joint.Joints
             * @instance
             */
            Joints.prototype.jointDefinitions = $util.emptyObject;

            /**
             * Instances of the Joint Implementations
             * @member {Object.<string,mirabuf.joint.JointInstance.$Properties>} jointInstances
             * @memberof mirabuf.joint.Joints
             * @instance
             */
            Joints.prototype.jointInstances = $util.emptyObject;

            /**
             * Rigidgroups ?
             * @member {Array.<mirabuf.joint.RigidGroup.$Properties>} rigidGroups
             * @memberof mirabuf.joint.Joints
             * @instance
             */
            Joints.prototype.rigidGroups = $util.emptyArray;

            /**
             * Collection of all Motors exported
             * @member {Object.<string,mirabuf.motor.Motor.$Properties>} motorDefinitions
             * @memberof mirabuf.joint.Joints
             * @instance
             */
            Joints.prototype.motorDefinitions = $util.emptyObject;

            /**
             * Encodes the specified Joints message. Does not implicitly {@link mirabuf.joint.Joints.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.Joints
             * @static
             * @param {mirabuf.joint.Joints.$Properties} message Joints message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Joints.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.jointDefinitions != null && $Object.hasOwnProperty.call(message, "jointDefinitions"))
                    for (let keys = $Object.keys(message.jointDefinitions), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.mirabuf.joint.Joint.encode(message.jointDefinitions[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim().ldelim();
                    }
                if (message.jointInstances != null && $Object.hasOwnProperty.call(message, "jointInstances"))
                    for (let keys = $Object.keys(message.jointInstances), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.mirabuf.joint.JointInstance.encode(message.jointInstances[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim().ldelim();
                    }
                if (message.rigidGroups != null && message.rigidGroups.length)
                    for (let i = 0; i < message.rigidGroups.length; ++i)
                        $root.mirabuf.joint.RigidGroup.encode(message.rigidGroups[i], writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                if (message.motorDefinitions != null && $Object.hasOwnProperty.call(message, "motorDefinitions"))
                    for (let keys = $Object.keys(message.motorDefinitions), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 5, wireType 2 =*/42).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.mirabuf.motor.Motor.encode(message.motorDefinitions[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim().ldelim();
                    }
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Joints message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.Joints
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.Joints & mirabuf.joint.Joints.$Shape} Joints
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Joints.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.Joints(), key, value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if (message.jointDefinitions === $util.emptyObject)
                                message.jointDefinitions = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                let tag2 = reader.tag();
                                wireType = tag2 & 7;
                                switch (tag2 >>>= 3) {
                                case 1:
                                    if (wireType !== 2)
                                        break;
                                    key = reader.stringVerify();
                                    continue;
                                case 2:
                                    if (wireType !== 2)
                                        break;
                                    value = $root.mirabuf.joint.Joint.decode(reader, reader.uint32(), $undefined, _depth + 1, value);
                                    continue;
                                }
                                reader.skipType(wireType, _depth, tag2);
                            }
                            if (key === "__proto__")
                                $util.makeProp(message.jointDefinitions, key);
                            message.jointDefinitions[key] = value || new $root.mirabuf.joint.Joint();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if (message.jointInstances === $util.emptyObject)
                                message.jointInstances = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                let tag2 = reader.tag();
                                wireType = tag2 & 7;
                                switch (tag2 >>>= 3) {
                                case 1:
                                    if (wireType !== 2)
                                        break;
                                    key = reader.stringVerify();
                                    continue;
                                case 2:
                                    if (wireType !== 2)
                                        break;
                                    value = $root.mirabuf.joint.JointInstance.decode(reader, reader.uint32(), $undefined, _depth + 1, value);
                                    continue;
                                }
                                reader.skipType(wireType, _depth, tag2);
                            }
                            if (key === "__proto__")
                                $util.makeProp(message.jointInstances, key);
                            message.jointInstances[key] = value || new $root.mirabuf.joint.JointInstance();
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            if (!(message.rigidGroups && message.rigidGroups.length))
                                message.rigidGroups = [];
                            message.rigidGroups.push($root.mirabuf.joint.RigidGroup.decode(reader, reader.uint32(), $undefined, _depth + 1));
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            if (message.motorDefinitions === $util.emptyObject)
                                message.motorDefinitions = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                let tag2 = reader.tag();
                                wireType = tag2 & 7;
                                switch (tag2 >>>= 3) {
                                case 1:
                                    if (wireType !== 2)
                                        break;
                                    key = reader.stringVerify();
                                    continue;
                                case 2:
                                    if (wireType !== 2)
                                        break;
                                    value = $root.mirabuf.motor.Motor.decode(reader, reader.uint32(), $undefined, _depth + 1, value);
                                    continue;
                                }
                                reader.skipType(wireType, _depth, tag2);
                            }
                            if (key === "__proto__")
                                $util.makeProp(message.motorDefinitions, key);
                            message.motorDefinitions[key] = value || new $root.mirabuf.motor.Motor();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Joints
             * @function getTypeUrl
             * @memberof mirabuf.joint.Joints
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Joints.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.Joints";
            };

            return Joints;
        })();

        /**
         * JointMotion enum.
         * @name mirabuf.joint.JointMotion
         * @enum {number}
         * @property {number} RIGID=0 RIGID value
         * @property {number} REVOLUTE=1 REVOLUTE value
         * @property {number} SLIDER=2 SLIDER value
         * @property {number} CYLINDRICAL=3 CYLINDRICAL value
         * @property {number} PINSLOT=4 PINSLOT value
         * @property {number} PLANAR=5 PLANAR value
         * @property {number} BALL=6 BALL value
         * @property {number} CUSTOM=7 CUSTOM value
         */
        joint.JointMotion = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "RIGID"] = 0;
            values[valuesById[1] = "REVOLUTE"] = 1;
            values[valuesById[2] = "SLIDER"] = 2;
            values[valuesById[3] = "CYLINDRICAL"] = 3;
            values[valuesById[4] = "PINSLOT"] = 4;
            values[valuesById[5] = "PLANAR"] = 5;
            values[valuesById[6] = "BALL"] = 6;
            values[valuesById[7] = "CUSTOM"] = 7;
            return values;
        })();

        joint.JointInstance = (function() {

            /**
             * Properties of a JointInstance.
             * @typedef {Object} mirabuf.joint.JointInstance.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] JointInstance info
             * @property {boolean|null} [isEndEffector] JointInstance isEndEffector
             * @property {string|null} [parentPart] JointInstance parentPart
             * @property {string|null} [childPart] JointInstance childPart
             * @property {string|null} [jointReference] JointInstance jointReference
             * @property {mirabuf.Vector3.$Properties|null} [offset] JointInstance offset
             * @property {mirabuf.GraphContainer.$Properties|null} [parts] JointInstance parts
             * @property {string|null} [signalReference] JointInstance signalReference
             * @property {Array.<mirabuf.joint.MotionLink.$Properties>|null} [motionLink] JointInstance motionLink
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a JointInstance.
             * @memberof mirabuf.joint
             * @interface IJointInstance
             * @augments mirabuf.joint.JointInstance.$Properties
             * @deprecated Use mirabuf.joint.JointInstance.$Properties instead.
             */

            /**
             * Shape of a JointInstance.
             * @typedef {mirabuf.joint.JointInstance.$Properties} mirabuf.joint.JointInstance.$Shape
             */

            /**
             * Constructs a new JointInstance.
             * @memberof mirabuf.joint
             * @classdesc Instance of a Joint that has a defined motion and limits.
             * Instancing helps with identifiy closed loop systems.
             * @constructor
             * @param {mirabuf.joint.JointInstance.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const JointInstance = function (properties) {
                this.motionLink = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * JointInstance info.
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.info = null;

            /**
             * JointInstance isEndEffector.
             * @member {boolean} isEndEffector
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.isEndEffector = false;

            /**
             * JointInstance parentPart.
             * @member {string} parentPart
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.parentPart = "";

            /**
             * JointInstance childPart.
             * @member {string} childPart
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.childPart = "";

            /**
             * JointInstance jointReference.
             * @member {string} jointReference
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.jointReference = "";

            /**
             * JointInstance offset.
             * @member {mirabuf.Vector3.$Properties|null|undefined} offset
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.offset = null;

            /**
             * JointInstance parts.
             * @member {mirabuf.GraphContainer.$Properties|null|undefined} parts
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.parts = null;

            /**
             * JointInstance signalReference.
             * @member {string} signalReference
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.signalReference = "";

            /**
             * JointInstance motionLink.
             * @member {Array.<mirabuf.joint.MotionLink.$Properties>} motionLink
             * @memberof mirabuf.joint.JointInstance
             * @instance
             */
            JointInstance.prototype.motionLink = $util.emptyArray;

            /**
             * Encodes the specified JointInstance message. Does not implicitly {@link mirabuf.joint.JointInstance.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.JointInstance
             * @static
             * @param {mirabuf.joint.JointInstance.$Properties} message JointInstance message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JointInstance.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.isEndEffector != null && $Object.hasOwnProperty.call(message, "isEndEffector") && message.isEndEffector !== false)
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isEndEffector);
                if (message.parentPart != null && $Object.hasOwnProperty.call(message, "parentPart") && message.parentPart !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.parentPart);
                if (message.childPart != null && $Object.hasOwnProperty.call(message, "childPart") && message.childPart !== "")
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.childPart);
                if (message.jointReference != null && $Object.hasOwnProperty.call(message, "jointReference") && message.jointReference !== "")
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.jointReference);
                if (message.offset != null && $Object.hasOwnProperty.call(message, "offset"))
                    $root.mirabuf.Vector3.encode(message.offset, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                if (message.parts != null && $Object.hasOwnProperty.call(message, "parts"))
                    $root.mirabuf.GraphContainer.encode(message.parts, writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
                if (message.signalReference != null && $Object.hasOwnProperty.call(message, "signalReference") && message.signalReference !== "")
                    writer.uint32(/* id 8, wireType 2 =*/66).string(message.signalReference);
                if (message.motionLink != null && message.motionLink.length)
                    for (let i = 0; i < message.motionLink.length; ++i)
                        $root.mirabuf.joint.MotionLink.encode(message.motionLink[i], writer.uint32(/* id 9, wireType 2 =*/74).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a JointInstance message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.JointInstance
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.JointInstance & mirabuf.joint.JointInstance.$Shape} JointInstance
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JointInstance.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.JointInstance(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.bool())
                                message.isEndEffector = value;
                            else
                                delete message.isEndEffector;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.parentPart = value;
                            else
                                delete message.parentPart;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.childPart = value;
                            else
                                delete message.childPart;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.jointReference = value;
                            else
                                delete message.jointReference;
                            continue;
                        }
                    case 6: {
                            if (wireType !== 2)
                                break;
                            message.offset = $root.mirabuf.Vector3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.offset);
                            continue;
                        }
                    case 7: {
                            if (wireType !== 2)
                                break;
                            message.parts = $root.mirabuf.GraphContainer.decode(reader, reader.uint32(), $undefined, _depth + 1, message.parts);
                            continue;
                        }
                    case 8: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.signalReference = value;
                            else
                                delete message.signalReference;
                            continue;
                        }
                    case 9: {
                            if (wireType !== 2)
                                break;
                            if (!(message.motionLink && message.motionLink.length))
                                message.motionLink = [];
                            message.motionLink.push($root.mirabuf.joint.MotionLink.decode(reader, reader.uint32(), $undefined, _depth + 1));
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for JointInstance
             * @function getTypeUrl
             * @memberof mirabuf.joint.JointInstance
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            JointInstance.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.JointInstance";
            };

            return JointInstance;
        })();

        joint.MotionLink = (function() {

            /**
             * Properties of a MotionLink.
             * @typedef {Object} mirabuf.joint.MotionLink.$Properties
             * @property {string|null} [jointInstance] MotionLink jointInstance
             * @property {number|null} [ratio] MotionLink ratio
             * @property {boolean|null} [reversed] MotionLink reversed
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a MotionLink.
             * @memberof mirabuf.joint
             * @interface IMotionLink
             * @augments mirabuf.joint.MotionLink.$Properties
             * @deprecated Use mirabuf.joint.MotionLink.$Properties instead.
             */

            /**
             * Shape of a MotionLink.
             * @typedef {mirabuf.joint.MotionLink.$Properties} mirabuf.joint.MotionLink.$Shape
             */

            /**
             * Constructs a new MotionLink.
             * @memberof mirabuf.joint
             * @classdesc Motion Link Feature
             * Enables the restriction on a joint to a certain range of motion as it is relative to another joint
             * This is useful for moving parts restricted by belts and gears
             * @constructor
             * @param {mirabuf.joint.MotionLink.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const MotionLink = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * MotionLink jointInstance.
             * @member {string} jointInstance
             * @memberof mirabuf.joint.MotionLink
             * @instance
             */
            MotionLink.prototype.jointInstance = "";

            /**
             * MotionLink ratio.
             * @member {number} ratio
             * @memberof mirabuf.joint.MotionLink
             * @instance
             */
            MotionLink.prototype.ratio = 0;

            /**
             * MotionLink reversed.
             * @member {boolean} reversed
             * @memberof mirabuf.joint.MotionLink
             * @instance
             */
            MotionLink.prototype.reversed = false;

            /**
             * Encodes the specified MotionLink message. Does not implicitly {@link mirabuf.joint.MotionLink.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.MotionLink
             * @static
             * @param {mirabuf.joint.MotionLink.$Properties} message MotionLink message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MotionLink.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.jointInstance != null && $Object.hasOwnProperty.call(message, "jointInstance") && message.jointInstance !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.jointInstance);
                if (message.ratio != null && $Object.hasOwnProperty.call(message, "ratio") && !$Object.is(message.ratio, 0))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.ratio);
                if (message.reversed != null && $Object.hasOwnProperty.call(message, "reversed") && message.reversed !== false)
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.reversed);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a MotionLink message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.MotionLink
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.MotionLink & mirabuf.joint.MotionLink.$Shape} MotionLink
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MotionLink.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.MotionLink(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.jointInstance = value;
                            else
                                delete message.jointInstance;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.ratio = value;
                            else
                                delete message.ratio;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.bool())
                                message.reversed = value;
                            else
                                delete message.reversed;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for MotionLink
             * @function getTypeUrl
             * @memberof mirabuf.joint.MotionLink
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            MotionLink.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.MotionLink";
            };

            return MotionLink;
        })();

        joint.Joint = (function() {

            /**
             * Properties of a Joint.
             * @typedef {Object} mirabuf.joint.Joint.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] Joint name, ID, version, etc
             * @property {mirabuf.Vector3.$Properties|null} [origin] Joint origin
             * @property {mirabuf.joint.JointMotion|null} [jointMotionType] Joint jointMotionType
             * @property {number|null} [breakMagnitude] Joint breakMagnitude
             * @property {mirabuf.joint.RotationalJoint.$Properties|null} [rotational] ONEOF rotational joint
             * @property {mirabuf.joint.PrismaticJoint.$Properties|null} [prismatic] ONEOF prismatic joint
             * @property {mirabuf.joint.CustomJoint.$Properties|null} [custom] ONEOF custom joint
             * @property {mirabuf.UserData.$Properties|null} [userData] Additional information someone can query or store relative to your joint.
             * @property {string|null} [motorReference] Motor definition reference to lookup in joints collection
             * @property {"rotational"|"prismatic"|"custom"} [JointMotion] Joint JointMotion
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Joint.
             * @memberof mirabuf.joint
             * @interface IJoint
             * @augments mirabuf.joint.Joint.$Properties
             * @deprecated Use mirabuf.joint.Joint.$Properties instead.
             */

            /**
             * Narrowed shape of a Joint.
             * @typedef {{
             *   info?: mirabuf.Info.$Shape|null;
             *   origin?: mirabuf.Vector3.$Shape|null;
             *   jointMotionType?: mirabuf.joint.JointMotion|null;
             *   breakMagnitude?: number|null;
             *   rotational?: mirabuf.joint.RotationalJoint.$Shape|null;
             *   prismatic?: mirabuf.joint.PrismaticJoint.$Shape|null;
             *   custom?: mirabuf.joint.CustomJoint.$Shape|null;
             *   userData?: mirabuf.UserData.$Shape|null;
             *   motorReference?: string|null;
             *   $unknowns?: Array.<Uint8Array>;
             * } & (
             *   ({ JointMotion?: undefined; rotational?: null; prismatic?: null; custom?: null }|{ JointMotion?: "rotational"; rotational: mirabuf.joint.RotationalJoint.$Shape; prismatic?: null; custom?: null }|{ JointMotion?: "prismatic"; rotational?: null; prismatic: mirabuf.joint.PrismaticJoint.$Shape; custom?: null }|{ JointMotion?: "custom"; rotational?: null; prismatic?: null; custom: mirabuf.joint.CustomJoint.$Shape })
             * )} mirabuf.joint.Joint.$Shape
             */

            /**
             * Constructs a new Joint.
             * @memberof mirabuf.joint
             * @classdesc A unqiue implementation of a joint motion
             * Contains information about motion but not assembly relation
             * NOTE: A spring motion is a joint with no driver
             * @constructor
             * @param {mirabuf.joint.Joint.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Joint = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Joint name, ID, version, etc
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.info = null;

            /**
             * Joint origin.
             * @member {mirabuf.Vector3.$Properties|null|undefined} origin
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.origin = null;

            /**
             * Joint jointMotionType.
             * @member {mirabuf.joint.JointMotion} jointMotionType
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.jointMotionType = 0;

            /**
             * Joint breakMagnitude.
             * @member {number} breakMagnitude
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.breakMagnitude = 0;

            /**
             * ONEOF rotational joint
             * @member {mirabuf.joint.RotationalJoint.$Properties|null|undefined} rotational
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.rotational = null;

            /**
             * ONEOF prismatic joint
             * @member {mirabuf.joint.PrismaticJoint.$Properties|null|undefined} prismatic
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.prismatic = null;

            /**
             * ONEOF custom joint
             * @member {mirabuf.joint.CustomJoint.$Properties|null|undefined} custom
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.custom = null;

            /**
             * Additional information someone can query or store relative to your joint.
             * @member {mirabuf.UserData.$Properties|null|undefined} userData
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.userData = null;

            /**
             * Motor definition reference to lookup in joints collection
             * @member {string} motorReference
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            Joint.prototype.motorReference = "";

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * Joint JointMotion.
             * @member {"rotational"|"prismatic"|"custom"|undefined} JointMotion
             * @memberof mirabuf.joint.Joint
             * @instance
             */
            $Object.defineProperty(Joint.prototype, "JointMotion", {
                get: $util.oneOfGetter($oneOfFields = ["rotational", "prismatic", "custom"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Encodes the specified Joint message. Does not implicitly {@link mirabuf.joint.Joint.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.Joint
             * @static
             * @param {mirabuf.joint.Joint.$Properties} message Joint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Joint.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.origin != null && $Object.hasOwnProperty.call(message, "origin"))
                    $root.mirabuf.Vector3.encode(message.origin, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.jointMotionType != null && $Object.hasOwnProperty.call(message, "jointMotionType") && message.jointMotionType !== 0)
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.jointMotionType);
                if (message.breakMagnitude != null && $Object.hasOwnProperty.call(message, "breakMagnitude") && !$Object.is(message.breakMagnitude, 0))
                    writer.uint32(/* id 4, wireType 5 =*/37).float(message.breakMagnitude);
                if (message.rotational != null && $Object.hasOwnProperty.call(message, "rotational"))
                    $root.mirabuf.joint.RotationalJoint.encode(message.rotational, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                if (message.prismatic != null && $Object.hasOwnProperty.call(message, "prismatic"))
                    $root.mirabuf.joint.PrismaticJoint.encode(message.prismatic, writer.uint32(/* id 6, wireType 2 =*/50).fork(), _depth + 1).ldelim();
                if (message.custom != null && $Object.hasOwnProperty.call(message, "custom"))
                    $root.mirabuf.joint.CustomJoint.encode(message.custom, writer.uint32(/* id 7, wireType 2 =*/58).fork(), _depth + 1).ldelim();
                if (message.userData != null && $Object.hasOwnProperty.call(message, "userData"))
                    $root.mirabuf.UserData.encode(message.userData, writer.uint32(/* id 8, wireType 2 =*/66).fork(), _depth + 1).ldelim();
                if (message.motorReference != null && $Object.hasOwnProperty.call(message, "motorReference") && message.motorReference !== "")
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.motorReference);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Joint message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.Joint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.Joint & mirabuf.joint.Joint.$Shape} Joint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Joint.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.Joint(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.origin = $root.mirabuf.Vector3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.origin);
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.jointMotionType = value;
                            else
                                delete message.jointMotionType;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.breakMagnitude = value;
                            else
                                delete message.breakMagnitude;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.rotational = $root.mirabuf.joint.RotationalJoint.decode(reader, reader.uint32(), $undefined, _depth + 1, message.rotational);
                            message.JointMotion = "rotational";
                            continue;
                        }
                    case 6: {
                            if (wireType !== 2)
                                break;
                            message.prismatic = $root.mirabuf.joint.PrismaticJoint.decode(reader, reader.uint32(), $undefined, _depth + 1, message.prismatic);
                            message.JointMotion = "prismatic";
                            continue;
                        }
                    case 7: {
                            if (wireType !== 2)
                                break;
                            message.custom = $root.mirabuf.joint.CustomJoint.decode(reader, reader.uint32(), $undefined, _depth + 1, message.custom);
                            message.JointMotion = "custom";
                            continue;
                        }
                    case 8: {
                            if (wireType !== 2)
                                break;
                            message.userData = $root.mirabuf.UserData.decode(reader, reader.uint32(), $undefined, _depth + 1, message.userData);
                            continue;
                        }
                    case 9: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.motorReference = value;
                            else
                                delete message.motorReference;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Joint
             * @function getTypeUrl
             * @memberof mirabuf.joint.Joint
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Joint.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.Joint";
            };

            return Joint;
        })();

        joint.Dynamics = (function() {

            /**
             * Properties of a Dynamics.
             * @typedef {Object} mirabuf.joint.Dynamics.$Properties
             * @property {number|null} [damping] Damping effect on a given joint motion
             * @property {number|null} [friction] Friction effect on a given joint motion
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Dynamics.
             * @memberof mirabuf.joint
             * @interface IDynamics
             * @augments mirabuf.joint.Dynamics.$Properties
             * @deprecated Use mirabuf.joint.Dynamics.$Properties instead.
             */

            /**
             * Shape of a Dynamics.
             * @typedef {mirabuf.joint.Dynamics.$Properties} mirabuf.joint.Dynamics.$Shape
             */

            /**
             * Constructs a new Dynamics.
             * @memberof mirabuf.joint
             * @classdesc Dynamics specify the mechanical effects on the motion.
             * @constructor
             * @param {mirabuf.joint.Dynamics.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Dynamics = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Damping effect on a given joint motion
             * @member {number} damping
             * @memberof mirabuf.joint.Dynamics
             * @instance
             */
            Dynamics.prototype.damping = 0;

            /**
             * Friction effect on a given joint motion
             * @member {number} friction
             * @memberof mirabuf.joint.Dynamics
             * @instance
             */
            Dynamics.prototype.friction = 0;

            /**
             * Encodes the specified Dynamics message. Does not implicitly {@link mirabuf.joint.Dynamics.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.Dynamics
             * @static
             * @param {mirabuf.joint.Dynamics.$Properties} message Dynamics message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Dynamics.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.damping != null && $Object.hasOwnProperty.call(message, "damping") && !$Object.is(message.damping, 0))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.damping);
                if (message.friction != null && $Object.hasOwnProperty.call(message, "friction") && !$Object.is(message.friction, 0))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.friction);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Dynamics message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.Dynamics
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.Dynamics & mirabuf.joint.Dynamics.$Shape} Dynamics
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Dynamics.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.Dynamics(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.damping = value;
                            else
                                delete message.damping;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.friction = value;
                            else
                                delete message.friction;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Dynamics
             * @function getTypeUrl
             * @memberof mirabuf.joint.Dynamics
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Dynamics.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.Dynamics";
            };

            return Dynamics;
        })();

        joint.Limits = (function() {

            /**
             * Properties of a Limits.
             * @typedef {Object} mirabuf.joint.Limits.$Properties
             * @property {number|null} [lower] Lower Limit corresponds to default displacement
             * @property {number|null} [upper] Upper Limit is the joint extent
             * @property {number|null} [velocity] Velocity Max in m/s^2 (angular for rotational)
             * @property {number|null} [effort] Effort is the absolute force a joint can apply for a given instant - ROS has a great article on it http://wiki.ros.org/pr2_controller_manager/safety_limits
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Limits.
             * @memberof mirabuf.joint
             * @interface ILimits
             * @augments mirabuf.joint.Limits.$Properties
             * @deprecated Use mirabuf.joint.Limits.$Properties instead.
             */

            /**
             * Shape of a Limits.
             * @typedef {mirabuf.joint.Limits.$Properties} mirabuf.joint.Limits.$Shape
             */

            /**
             * Constructs a new Limits.
             * @memberof mirabuf.joint
             * @classdesc Limits specify the mechanical range of a given joint.
             * 
             * TODO: Add units
             * @constructor
             * @param {mirabuf.joint.Limits.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Limits = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Lower Limit corresponds to default displacement
             * @member {number} lower
             * @memberof mirabuf.joint.Limits
             * @instance
             */
            Limits.prototype.lower = 0;

            /**
             * Upper Limit is the joint extent
             * @member {number} upper
             * @memberof mirabuf.joint.Limits
             * @instance
             */
            Limits.prototype.upper = 0;

            /**
             * Velocity Max in m/s^2 (angular for rotational)
             * @member {number} velocity
             * @memberof mirabuf.joint.Limits
             * @instance
             */
            Limits.prototype.velocity = 0;

            /**
             * Effort is the absolute force a joint can apply for a given instant - ROS has a great article on it http://wiki.ros.org/pr2_controller_manager/safety_limits
             * @member {number} effort
             * @memberof mirabuf.joint.Limits
             * @instance
             */
            Limits.prototype.effort = 0;

            /**
             * Encodes the specified Limits message. Does not implicitly {@link mirabuf.joint.Limits.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.Limits
             * @static
             * @param {mirabuf.joint.Limits.$Properties} message Limits message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Limits.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.lower != null && $Object.hasOwnProperty.call(message, "lower") && !$Object.is(message.lower, 0))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.lower);
                if (message.upper != null && $Object.hasOwnProperty.call(message, "upper") && !$Object.is(message.upper, 0))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.upper);
                if (message.velocity != null && $Object.hasOwnProperty.call(message, "velocity") && !$Object.is(message.velocity, 0))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.velocity);
                if (message.effort != null && $Object.hasOwnProperty.call(message, "effort") && !$Object.is(message.effort, 0))
                    writer.uint32(/* id 4, wireType 5 =*/37).float(message.effort);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Limits message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.Limits
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.Limits & mirabuf.joint.Limits.$Shape} Limits
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Limits.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.Limits(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.lower = value;
                            else
                                delete message.lower;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.upper = value;
                            else
                                delete message.upper;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.velocity = value;
                            else
                                delete message.velocity;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.effort = value;
                            else
                                delete message.effort;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Limits
             * @function getTypeUrl
             * @memberof mirabuf.joint.Limits
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Limits.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.Limits";
            };

            return Limits;
        })();

        joint.Safety = (function() {

            /**
             * Properties of a Safety.
             * @typedef {Object} mirabuf.joint.Safety.$Properties
             * @property {number|null} [lowerLimit] Lower software limit
             * @property {number|null} [upperLimit] Upper Software limit
             * @property {number|null} [kPosition] Relation between position and velocity limit
             * @property {number|null} [kVelocity] Relation between effort and velocity limit
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Safety.
             * @memberof mirabuf.joint
             * @interface ISafety
             * @augments mirabuf.joint.Safety.$Properties
             * @deprecated Use mirabuf.joint.Safety.$Properties instead.
             */

            /**
             * Shape of a Safety.
             * @typedef {mirabuf.joint.Safety.$Properties} mirabuf.joint.Safety.$Shape
             */

            /**
             * Constructs a new Safety.
             * @memberof mirabuf.joint
             * @classdesc Safety switch configuration for a given joint.
             * Can usefully indicate a bounds issue.
             * Inspired by the URDF implementation.
             * 
             * This should really just be created by the controller.
             * http://wiki.ros.org/pr2_controller_manager/safety_limits
             * @constructor
             * @param {mirabuf.joint.Safety.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Safety = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Lower software limit
             * @member {number} lowerLimit
             * @memberof mirabuf.joint.Safety
             * @instance
             */
            Safety.prototype.lowerLimit = 0;

            /**
             * Upper Software limit
             * @member {number} upperLimit
             * @memberof mirabuf.joint.Safety
             * @instance
             */
            Safety.prototype.upperLimit = 0;

            /**
             * Relation between position and velocity limit
             * @member {number} kPosition
             * @memberof mirabuf.joint.Safety
             * @instance
             */
            Safety.prototype.kPosition = 0;

            /**
             * Relation between effort and velocity limit
             * @member {number} kVelocity
             * @memberof mirabuf.joint.Safety
             * @instance
             */
            Safety.prototype.kVelocity = 0;

            /**
             * Encodes the specified Safety message. Does not implicitly {@link mirabuf.joint.Safety.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.Safety
             * @static
             * @param {mirabuf.joint.Safety.$Properties} message Safety message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Safety.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.lowerLimit != null && $Object.hasOwnProperty.call(message, "lowerLimit") && !$Object.is(message.lowerLimit, 0))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.lowerLimit);
                if (message.upperLimit != null && $Object.hasOwnProperty.call(message, "upperLimit") && !$Object.is(message.upperLimit, 0))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.upperLimit);
                if (message.kPosition != null && $Object.hasOwnProperty.call(message, "kPosition") && !$Object.is(message.kPosition, 0))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.kPosition);
                if (message.kVelocity != null && $Object.hasOwnProperty.call(message, "kVelocity") && !$Object.is(message.kVelocity, 0))
                    writer.uint32(/* id 4, wireType 5 =*/37).float(message.kVelocity);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Safety message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.Safety
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.Safety & mirabuf.joint.Safety.$Shape} Safety
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Safety.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.Safety(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.lowerLimit = value;
                            else
                                delete message.lowerLimit;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.upperLimit = value;
                            else
                                delete message.upperLimit;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.kPosition = value;
                            else
                                delete message.kPosition;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.kVelocity = value;
                            else
                                delete message.kVelocity;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Safety
             * @function getTypeUrl
             * @memberof mirabuf.joint.Safety
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Safety.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.Safety";
            };

            return Safety;
        })();

        joint.DOF = (function() {

            /**
             * Properties of a DOF.
             * @typedef {Object} mirabuf.joint.DOF.$Properties
             * @property {string|null} [name] In case you want to name this degree of freedom
             * @property {mirabuf.Vector3.$Properties|null} [axis] Axis the degree of freedom is pivoting by
             * @property {mirabuf.Axis|null} [pivotDirection] Direction the axis vector is offset from - this has an incorrect naming scheme
             * @property {mirabuf.joint.Dynamics.$Properties|null} [dynamics] Dynamic properties of this joint pivot
             * @property {mirabuf.joint.Limits.$Properties|null} [limits] Limits of this freedom
             * @property {number|null} [value] Current value of the DOF
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a DOF.
             * @memberof mirabuf.joint
             * @interface IDOF
             * @augments mirabuf.joint.DOF.$Properties
             * @deprecated Use mirabuf.joint.DOF.$Properties instead.
             */

            /**
             * Shape of a DOF.
             * @typedef {mirabuf.joint.DOF.$Properties} mirabuf.joint.DOF.$Shape
             */

            /**
             * Constructs a new DOF.
             * @memberof mirabuf.joint
             * @classdesc DOF - representing the construction of a joint motion
             * @constructor
             * @param {mirabuf.joint.DOF.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const DOF = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * In case you want to name this degree of freedom
             * @member {string} name
             * @memberof mirabuf.joint.DOF
             * @instance
             */
            DOF.prototype.name = "";

            /**
             * Axis the degree of freedom is pivoting by
             * @member {mirabuf.Vector3.$Properties|null|undefined} axis
             * @memberof mirabuf.joint.DOF
             * @instance
             */
            DOF.prototype.axis = null;

            /**
             * Direction the axis vector is offset from - this has an incorrect naming scheme
             * @member {mirabuf.Axis} pivotDirection
             * @memberof mirabuf.joint.DOF
             * @instance
             */
            DOF.prototype.pivotDirection = 0;

            /**
             * Dynamic properties of this joint pivot
             * @member {mirabuf.joint.Dynamics.$Properties|null|undefined} dynamics
             * @memberof mirabuf.joint.DOF
             * @instance
             */
            DOF.prototype.dynamics = null;

            /**
             * Limits of this freedom
             * @member {mirabuf.joint.Limits.$Properties|null|undefined} limits
             * @memberof mirabuf.joint.DOF
             * @instance
             */
            DOF.prototype.limits = null;

            /**
             * Current value of the DOF
             * @member {number} value
             * @memberof mirabuf.joint.DOF
             * @instance
             */
            DOF.prototype.value = 0;

            /**
             * Encodes the specified DOF message. Does not implicitly {@link mirabuf.joint.DOF.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.DOF
             * @static
             * @param {mirabuf.joint.DOF.$Properties} message DOF message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DOF.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.name != null && $Object.hasOwnProperty.call(message, "name") && message.name !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.axis != null && $Object.hasOwnProperty.call(message, "axis"))
                    $root.mirabuf.Vector3.encode(message.axis, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.pivotDirection != null && $Object.hasOwnProperty.call(message, "pivotDirection") && message.pivotDirection !== 0)
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.pivotDirection);
                if (message.dynamics != null && $Object.hasOwnProperty.call(message, "dynamics"))
                    $root.mirabuf.joint.Dynamics.encode(message.dynamics, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                if (message.limits != null && $Object.hasOwnProperty.call(message, "limits"))
                    $root.mirabuf.joint.Limits.encode(message.limits, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                if (message.value != null && $Object.hasOwnProperty.call(message, "value") && !$Object.is(message.value, 0))
                    writer.uint32(/* id 6, wireType 5 =*/53).float(message.value);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a DOF message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.DOF
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.DOF & mirabuf.joint.DOF.$Shape} DOF
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DOF.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.DOF(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.name = value;
                            else
                                delete message.name;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.axis = $root.mirabuf.Vector3.decode(reader, reader.uint32(), $undefined, _depth + 1, message.axis);
                            continue;
                        }
                    case 3: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.pivotDirection = value;
                            else
                                delete message.pivotDirection;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.dynamics = $root.mirabuf.joint.Dynamics.decode(reader, reader.uint32(), $undefined, _depth + 1, message.dynamics);
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.limits = $root.mirabuf.joint.Limits.decode(reader, reader.uint32(), $undefined, _depth + 1, message.limits);
                            continue;
                        }
                    case 6: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.value = value;
                            else
                                delete message.value;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for DOF
             * @function getTypeUrl
             * @memberof mirabuf.joint.DOF
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            DOF.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.DOF";
            };

            return DOF;
        })();

        joint.CustomJoint = (function() {

            /**
             * Properties of a CustomJoint.
             * @typedef {Object} mirabuf.joint.CustomJoint.$Properties
             * @property {Array.<mirabuf.joint.DOF.$Properties>|null} [dofs] A list of degrees of freedom that the joint can contain
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a CustomJoint.
             * @memberof mirabuf.joint
             * @interface ICustomJoint
             * @augments mirabuf.joint.CustomJoint.$Properties
             * @deprecated Use mirabuf.joint.CustomJoint.$Properties instead.
             */

            /**
             * Shape of a CustomJoint.
             * @typedef {mirabuf.joint.CustomJoint.$Properties} mirabuf.joint.CustomJoint.$Shape
             */

            /**
             * Constructs a new CustomJoint.
             * @memberof mirabuf.joint
             * @classdesc CustomJoint is a joint with N degrees of freedom specified.
             * There should be input validation to handle max freedom case.
             * @constructor
             * @param {mirabuf.joint.CustomJoint.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const CustomJoint = function (properties) {
                this.dofs = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * A list of degrees of freedom that the joint can contain
             * @member {Array.<mirabuf.joint.DOF.$Properties>} dofs
             * @memberof mirabuf.joint.CustomJoint
             * @instance
             */
            CustomJoint.prototype.dofs = $util.emptyArray;

            /**
             * Encodes the specified CustomJoint message. Does not implicitly {@link mirabuf.joint.CustomJoint.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.CustomJoint
             * @static
             * @param {mirabuf.joint.CustomJoint.$Properties} message CustomJoint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CustomJoint.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.dofs != null && message.dofs.length)
                    for (let i = 0; i < message.dofs.length; ++i)
                        $root.mirabuf.joint.DOF.encode(message.dofs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a CustomJoint message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.CustomJoint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.CustomJoint & mirabuf.joint.CustomJoint.$Shape} CustomJoint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CustomJoint.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.CustomJoint();
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if (!(message.dofs && message.dofs.length))
                                message.dofs = [];
                            message.dofs.push($root.mirabuf.joint.DOF.decode(reader, reader.uint32(), $undefined, _depth + 1));
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for CustomJoint
             * @function getTypeUrl
             * @memberof mirabuf.joint.CustomJoint
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            CustomJoint.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.CustomJoint";
            };

            return CustomJoint;
        })();

        joint.RotationalJoint = (function() {

            /**
             * Properties of a RotationalJoint.
             * @typedef {Object} mirabuf.joint.RotationalJoint.$Properties
             * @property {mirabuf.joint.DOF.$Properties|null} [rotationalFreedom] RotationalJoint rotationalFreedom
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a RotationalJoint.
             * @memberof mirabuf.joint
             * @interface IRotationalJoint
             * @augments mirabuf.joint.RotationalJoint.$Properties
             * @deprecated Use mirabuf.joint.RotationalJoint.$Properties instead.
             */

            /**
             * Shape of a RotationalJoint.
             * @typedef {mirabuf.joint.RotationalJoint.$Properties} mirabuf.joint.RotationalJoint.$Shape
             */

            /**
             * Constructs a new RotationalJoint.
             * @memberof mirabuf.joint
             * @classdesc RotationalJoint describes a joint with rotational translation.
             * This is the exact same as prismatic for now.
             * @constructor
             * @param {mirabuf.joint.RotationalJoint.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const RotationalJoint = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * RotationalJoint rotationalFreedom.
             * @member {mirabuf.joint.DOF.$Properties|null|undefined} rotationalFreedom
             * @memberof mirabuf.joint.RotationalJoint
             * @instance
             */
            RotationalJoint.prototype.rotationalFreedom = null;

            /**
             * Encodes the specified RotationalJoint message. Does not implicitly {@link mirabuf.joint.RotationalJoint.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.RotationalJoint
             * @static
             * @param {mirabuf.joint.RotationalJoint.$Properties} message RotationalJoint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RotationalJoint.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.rotationalFreedom != null && $Object.hasOwnProperty.call(message, "rotationalFreedom"))
                    $root.mirabuf.joint.DOF.encode(message.rotationalFreedom, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a RotationalJoint message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.RotationalJoint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.RotationalJoint & mirabuf.joint.RotationalJoint.$Shape} RotationalJoint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RotationalJoint.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.RotationalJoint(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.rotationalFreedom = $root.mirabuf.joint.DOF.decode(reader, reader.uint32(), $undefined, _depth + 1, message.rotationalFreedom);
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for RotationalJoint
             * @function getTypeUrl
             * @memberof mirabuf.joint.RotationalJoint
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            RotationalJoint.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.RotationalJoint";
            };

            return RotationalJoint;
        })();

        joint.BallJoint = (function() {

            /**
             * Properties of a BallJoint.
             * @typedef {Object} mirabuf.joint.BallJoint.$Properties
             * @property {mirabuf.joint.DOF.$Properties|null} [yaw] BallJoint yaw
             * @property {mirabuf.joint.DOF.$Properties|null} [pitch] BallJoint pitch
             * @property {mirabuf.joint.DOF.$Properties|null} [rotation] BallJoint rotation
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a BallJoint.
             * @memberof mirabuf.joint
             * @interface IBallJoint
             * @augments mirabuf.joint.BallJoint.$Properties
             * @deprecated Use mirabuf.joint.BallJoint.$Properties instead.
             */

            /**
             * Shape of a BallJoint.
             * @typedef {mirabuf.joint.BallJoint.$Properties} mirabuf.joint.BallJoint.$Shape
             */

            /**
             * Constructs a new BallJoint.
             * @memberof mirabuf.joint
             * @classdesc Represents a BallJoint.
             * @constructor
             * @param {mirabuf.joint.BallJoint.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const BallJoint = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * BallJoint yaw.
             * @member {mirabuf.joint.DOF.$Properties|null|undefined} yaw
             * @memberof mirabuf.joint.BallJoint
             * @instance
             */
            BallJoint.prototype.yaw = null;

            /**
             * BallJoint pitch.
             * @member {mirabuf.joint.DOF.$Properties|null|undefined} pitch
             * @memberof mirabuf.joint.BallJoint
             * @instance
             */
            BallJoint.prototype.pitch = null;

            /**
             * BallJoint rotation.
             * @member {mirabuf.joint.DOF.$Properties|null|undefined} rotation
             * @memberof mirabuf.joint.BallJoint
             * @instance
             */
            BallJoint.prototype.rotation = null;

            /**
             * Encodes the specified BallJoint message. Does not implicitly {@link mirabuf.joint.BallJoint.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.BallJoint
             * @static
             * @param {mirabuf.joint.BallJoint.$Properties} message BallJoint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BallJoint.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.yaw != null && $Object.hasOwnProperty.call(message, "yaw"))
                    $root.mirabuf.joint.DOF.encode(message.yaw, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.pitch != null && $Object.hasOwnProperty.call(message, "pitch"))
                    $root.mirabuf.joint.DOF.encode(message.pitch, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.rotation != null && $Object.hasOwnProperty.call(message, "rotation"))
                    $root.mirabuf.joint.DOF.encode(message.rotation, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a BallJoint message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.BallJoint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.BallJoint & mirabuf.joint.BallJoint.$Shape} BallJoint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BallJoint.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.BallJoint(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.yaw = $root.mirabuf.joint.DOF.decode(reader, reader.uint32(), $undefined, _depth + 1, message.yaw);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.pitch = $root.mirabuf.joint.DOF.decode(reader, reader.uint32(), $undefined, _depth + 1, message.pitch);
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.rotation = $root.mirabuf.joint.DOF.decode(reader, reader.uint32(), $undefined, _depth + 1, message.rotation);
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for BallJoint
             * @function getTypeUrl
             * @memberof mirabuf.joint.BallJoint
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            BallJoint.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.BallJoint";
            };

            return BallJoint;
        })();

        joint.PrismaticJoint = (function() {

            /**
             * Properties of a PrismaticJoint.
             * @typedef {Object} mirabuf.joint.PrismaticJoint.$Properties
             * @property {mirabuf.joint.DOF.$Properties|null} [prismaticFreedom] PrismaticJoint prismaticFreedom
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a PrismaticJoint.
             * @memberof mirabuf.joint
             * @interface IPrismaticJoint
             * @augments mirabuf.joint.PrismaticJoint.$Properties
             * @deprecated Use mirabuf.joint.PrismaticJoint.$Properties instead.
             */

            /**
             * Shape of a PrismaticJoint.
             * @typedef {mirabuf.joint.PrismaticJoint.$Properties} mirabuf.joint.PrismaticJoint.$Shape
             */

            /**
             * Constructs a new PrismaticJoint.
             * @memberof mirabuf.joint
             * @classdesc Prismatic Joint describes a motion that translates the position in a single axis
             * @constructor
             * @param {mirabuf.joint.PrismaticJoint.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const PrismaticJoint = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * PrismaticJoint prismaticFreedom.
             * @member {mirabuf.joint.DOF.$Properties|null|undefined} prismaticFreedom
             * @memberof mirabuf.joint.PrismaticJoint
             * @instance
             */
            PrismaticJoint.prototype.prismaticFreedom = null;

            /**
             * Encodes the specified PrismaticJoint message. Does not implicitly {@link mirabuf.joint.PrismaticJoint.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.PrismaticJoint
             * @static
             * @param {mirabuf.joint.PrismaticJoint.$Properties} message PrismaticJoint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PrismaticJoint.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.prismaticFreedom != null && $Object.hasOwnProperty.call(message, "prismaticFreedom"))
                    $root.mirabuf.joint.DOF.encode(message.prismaticFreedom, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a PrismaticJoint message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.PrismaticJoint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.PrismaticJoint & mirabuf.joint.PrismaticJoint.$Shape} PrismaticJoint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PrismaticJoint.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.PrismaticJoint(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.prismaticFreedom = $root.mirabuf.joint.DOF.decode(reader, reader.uint32(), $undefined, _depth + 1, message.prismaticFreedom);
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for PrismaticJoint
             * @function getTypeUrl
             * @memberof mirabuf.joint.PrismaticJoint
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            PrismaticJoint.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.PrismaticJoint";
            };

            return PrismaticJoint;
        })();

        joint.RigidGroup = (function() {

            /**
             * Properties of a RigidGroup.
             * @typedef {Object} mirabuf.joint.RigidGroup.$Properties
             * @property {string|null} [name] RigidGroup name
             * @property {Array.<string>|null} [occurrences] RigidGroup occurrences
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a RigidGroup.
             * @memberof mirabuf.joint
             * @interface IRigidGroup
             * @augments mirabuf.joint.RigidGroup.$Properties
             * @deprecated Use mirabuf.joint.RigidGroup.$Properties instead.
             */

            /**
             * Shape of a RigidGroup.
             * @typedef {mirabuf.joint.RigidGroup.$Properties} mirabuf.joint.RigidGroup.$Shape
             */

            /**
             * Constructs a new RigidGroup.
             * @memberof mirabuf.joint
             * @classdesc Represents a RigidGroup.
             * @constructor
             * @param {mirabuf.joint.RigidGroup.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const RigidGroup = function (properties) {
                this.occurrences = [];
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * RigidGroup name.
             * @member {string} name
             * @memberof mirabuf.joint.RigidGroup
             * @instance
             */
            RigidGroup.prototype.name = "";

            /**
             * RigidGroup occurrences.
             * @member {Array.<string>} occurrences
             * @memberof mirabuf.joint.RigidGroup
             * @instance
             */
            RigidGroup.prototype.occurrences = $util.emptyArray;

            /**
             * Encodes the specified RigidGroup message. Does not implicitly {@link mirabuf.joint.RigidGroup.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.joint.RigidGroup
             * @static
             * @param {mirabuf.joint.RigidGroup.$Properties} message RigidGroup message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RigidGroup.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.name != null && $Object.hasOwnProperty.call(message, "name") && message.name !== "")
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.occurrences != null && message.occurrences.length)
                    for (let i = 0; i < message.occurrences.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.occurrences[i]);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a RigidGroup message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.joint.RigidGroup
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.joint.RigidGroup & mirabuf.joint.RigidGroup.$Shape} RigidGroup
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RigidGroup.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.joint.RigidGroup(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.name = value;
                            else
                                delete message.name;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if (!(message.occurrences && message.occurrences.length))
                                message.occurrences = [];
                            message.occurrences.push(reader.stringVerify());
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for RigidGroup
             * @function getTypeUrl
             * @memberof mirabuf.joint.RigidGroup
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            RigidGroup.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.joint.RigidGroup";
            };

            return RigidGroup;
        })();

        return joint;
    })();

    mirabuf.motor = (function() {

        /**
         * Namespace motor.
         * @memberof mirabuf
         * @namespace
         */
        const motor = {};

        /**
         * Duty Cycles for electric motors
         * Affects the dynamic output of the motor
         * https://www.news.benevelli-group.com/index.php/en/88-what-motor-duty-cycle.html
         * These each have associated data we are not going to use right now
         * @name mirabuf.motor.DutyCycles
         * @enum {number}
         * @property {number} CONTINUOUS_RUNNING=0 S1
         * @property {number} SHORT_TIME=1 S2
         * @property {number} INTERMITTENT_PERIODIC=2 S3
         * @property {number} CONTINUOUS_PERIODIC=3 S6 Continuous Operation with Periodic Duty
         */
        motor.DutyCycles = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "CONTINUOUS_RUNNING"] = 0;
            values[valuesById[1] = "SHORT_TIME"] = 1;
            values[valuesById[2] = "INTERMITTENT_PERIODIC"] = 2;
            values[valuesById[3] = "CONTINUOUS_PERIODIC"] = 3;
            return values;
        })();

        motor.Motor = (function() {

            /**
             * Properties of a Motor.
             * @typedef {Object} mirabuf.motor.Motor.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] Motor info
             * @property {mirabuf.motor.DCMotor.$Properties|null} [dcMotor] Motor dcMotor
             * @property {mirabuf.motor.SimpleMotor.$Properties|null} [simpleMotor] Motor simpleMotor
             * @property {"dcMotor"|"simpleMotor"} [motorType] Motor motorType
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Motor.
             * @memberof mirabuf.motor
             * @interface IMotor
             * @augments mirabuf.motor.Motor.$Properties
             * @deprecated Use mirabuf.motor.Motor.$Properties instead.
             */

            /**
             * Narrowed shape of a Motor.
             * @typedef {{
             *   info?: mirabuf.Info.$Shape|null;
             *   dcMotor?: mirabuf.motor.DCMotor.$Shape|null;
             *   simpleMotor?: mirabuf.motor.SimpleMotor.$Shape|null;
             *   $unknowns?: Array.<Uint8Array>;
             * } & (
             *   ({ motorType?: undefined; dcMotor?: null; simpleMotor?: null }|{ motorType?: "dcMotor"; dcMotor: mirabuf.motor.DCMotor.$Shape; simpleMotor?: null }|{ motorType?: "simpleMotor"; dcMotor?: null; simpleMotor: mirabuf.motor.SimpleMotor.$Shape })
             * )} mirabuf.motor.Motor.$Shape
             */

            /**
             * Constructs a new Motor.
             * @memberof mirabuf.motor
             * @classdesc A Motor should determine the relationship between an input and joint motion
             * Could represent something like a DC Motor relationship
             * @constructor
             * @param {mirabuf.motor.Motor.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Motor = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Motor info.
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.motor.Motor
             * @instance
             */
            Motor.prototype.info = null;

            /**
             * Motor dcMotor.
             * @member {mirabuf.motor.DCMotor.$Properties|null|undefined} dcMotor
             * @memberof mirabuf.motor.Motor
             * @instance
             */
            Motor.prototype.dcMotor = null;

            /**
             * Motor simpleMotor.
             * @member {mirabuf.motor.SimpleMotor.$Properties|null|undefined} simpleMotor
             * @memberof mirabuf.motor.Motor
             * @instance
             */
            Motor.prototype.simpleMotor = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * Motor motorType.
             * @member {"dcMotor"|"simpleMotor"|undefined} motorType
             * @memberof mirabuf.motor.Motor
             * @instance
             */
            $Object.defineProperty(Motor.prototype, "motorType", {
                get: $util.oneOfGetter($oneOfFields = ["dcMotor", "simpleMotor"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Encodes the specified Motor message. Does not implicitly {@link mirabuf.motor.Motor.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.motor.Motor
             * @static
             * @param {mirabuf.motor.Motor.$Properties} message Motor message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Motor.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.dcMotor != null && $Object.hasOwnProperty.call(message, "dcMotor"))
                    $root.mirabuf.motor.DCMotor.encode(message.dcMotor, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.simpleMotor != null && $Object.hasOwnProperty.call(message, "simpleMotor"))
                    $root.mirabuf.motor.SimpleMotor.encode(message.simpleMotor, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Motor message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.motor.Motor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.motor.Motor & mirabuf.motor.Motor.$Shape} Motor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Motor.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.motor.Motor(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.dcMotor = $root.mirabuf.motor.DCMotor.decode(reader, reader.uint32(), $undefined, _depth + 1, message.dcMotor);
                            message.motorType = "dcMotor";
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.simpleMotor = $root.mirabuf.motor.SimpleMotor.decode(reader, reader.uint32(), $undefined, _depth + 1, message.simpleMotor);
                            message.motorType = "simpleMotor";
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Motor
             * @function getTypeUrl
             * @memberof mirabuf.motor.Motor
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Motor.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.motor.Motor";
            };

            return Motor;
        })();

        motor.SimpleMotor = (function() {

            /**
             * Properties of a SimpleMotor.
             * @typedef {Object} mirabuf.motor.SimpleMotor.$Properties
             * @property {number|null} [stallTorque] Torque at 0 rpm with a inverse linear relationship to max_velocity
             * @property {number|null} [maxVelocity] The target velocity in RPM, will use stall_torque relationship to reach each step
             * @property {number|null} [brakingConstant] (Optional) 0 - 1, the relationship of stall_torque used to perserve the position of this motor
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a SimpleMotor.
             * @memberof mirabuf.motor
             * @interface ISimpleMotor
             * @augments mirabuf.motor.SimpleMotor.$Properties
             * @deprecated Use mirabuf.motor.SimpleMotor.$Properties instead.
             */

            /**
             * Shape of a SimpleMotor.
             * @typedef {mirabuf.motor.SimpleMotor.$Properties} mirabuf.motor.SimpleMotor.$Shape
             */

            /**
             * Constructs a new SimpleMotor.
             * @memberof mirabuf.motor
             * @classdesc SimpleMotor Configuration
             * Very easy motor used to simulate joints without specifying a real motor
             * Can set braking_constant - stall_torque - and max_velocity
             * Assumes you are solving using a velocity constraint for a joint and not a acceleration constraint
             * @constructor
             * @param {mirabuf.motor.SimpleMotor.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const SimpleMotor = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Torque at 0 rpm with a inverse linear relationship to max_velocity
             * @member {number} stallTorque
             * @memberof mirabuf.motor.SimpleMotor
             * @instance
             */
            SimpleMotor.prototype.stallTorque = 0;

            /**
             * The target velocity in RPM, will use stall_torque relationship to reach each step
             * @member {number} maxVelocity
             * @memberof mirabuf.motor.SimpleMotor
             * @instance
             */
            SimpleMotor.prototype.maxVelocity = 0;

            /**
             * (Optional) 0 - 1, the relationship of stall_torque used to perserve the position of this motor
             * @member {number} brakingConstant
             * @memberof mirabuf.motor.SimpleMotor
             * @instance
             */
            SimpleMotor.prototype.brakingConstant = 0;

            /**
             * Encodes the specified SimpleMotor message. Does not implicitly {@link mirabuf.motor.SimpleMotor.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.motor.SimpleMotor
             * @static
             * @param {mirabuf.motor.SimpleMotor.$Properties} message SimpleMotor message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SimpleMotor.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.stallTorque != null && $Object.hasOwnProperty.call(message, "stallTorque") && !$Object.is(message.stallTorque, 0))
                    writer.uint32(/* id 1, wireType 5 =*/13).float(message.stallTorque);
                if (message.maxVelocity != null && $Object.hasOwnProperty.call(message, "maxVelocity") && !$Object.is(message.maxVelocity, 0))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.maxVelocity);
                if (message.brakingConstant != null && $Object.hasOwnProperty.call(message, "brakingConstant") && !$Object.is(message.brakingConstant, 0))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.brakingConstant);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a SimpleMotor message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.motor.SimpleMotor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.motor.SimpleMotor & mirabuf.motor.SimpleMotor.$Shape} SimpleMotor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SimpleMotor.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.motor.SimpleMotor(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.stallTorque = value;
                            else
                                delete message.stallTorque;
                            continue;
                        }
                    case 2: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.maxVelocity = value;
                            else
                                delete message.maxVelocity;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.brakingConstant = value;
                            else
                                delete message.brakingConstant;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for SimpleMotor
             * @function getTypeUrl
             * @memberof mirabuf.motor.SimpleMotor
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            SimpleMotor.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.motor.SimpleMotor";
            };

            return SimpleMotor;
        })();

        motor.DCMotor = (function() {

            /**
             * Properties of a DCMotor.
             * @typedef {Object} mirabuf.motor.DCMotor.$Properties
             * @property {string|null} [referenceUrl] Reference for purchase page or spec sheet
             * @property {number|null} [torqueConstant] m-Nm/Amp
             * @property {number|null} [emfConstant] mV/rad/sec
             * @property {number|null} [resistance] Resistance of Motor - Optional if other values are known
             * @property {number|null} [maximumEffeciency] measure in percentage of 100 - generally around 60 - measured under optimal load
             * @property {number|null} [maximumPower] measured in Watts
             * @property {mirabuf.motor.DutyCycles|null} [dutyCycle] Stated Duty Cycle of motor
             * @property {mirabuf.motor.DCMotor.Advanced.$Properties|null} [advanced] Optional data that can give a better relationship to the simulation
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a DCMotor.
             * @memberof mirabuf.motor
             * @interface IDCMotor
             * @augments mirabuf.motor.DCMotor.$Properties
             * @deprecated Use mirabuf.motor.DCMotor.$Properties instead.
             */

            /**
             * Shape of a DCMotor.
             * @typedef {mirabuf.motor.DCMotor.$Properties} mirabuf.motor.DCMotor.$Shape
             */

            /**
             * Constructs a new DCMotor.
             * @memberof mirabuf.motor
             * @classdesc DCMotor Configuration
             * Parameters to simulate a DC Electric Motor
             * Still needs some more but overall they are most of the parameters we can use
             * @constructor
             * @param {mirabuf.motor.DCMotor.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const DCMotor = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Reference for purchase page or spec sheet
             * @member {string} referenceUrl
             * @memberof mirabuf.motor.DCMotor
             * @instance
             */
            DCMotor.prototype.referenceUrl = "";

            /**
             * m-Nm/Amp
             * @member {number} torqueConstant
             * @memberof mirabuf.motor.DCMotor
             * @instance
             */
            DCMotor.prototype.torqueConstant = 0;

            /**
             * mV/rad/sec
             * @member {number} emfConstant
             * @memberof mirabuf.motor.DCMotor
             * @instance
             */
            DCMotor.prototype.emfConstant = 0;

            /**
             * Resistance of Motor - Optional if other values are known
             * @member {number} resistance
             * @memberof mirabuf.motor.DCMotor
             * @instance
             */
            DCMotor.prototype.resistance = 0;

            /**
             * measure in percentage of 100 - generally around 60 - measured under optimal load
             * @member {number} maximumEffeciency
             * @memberof mirabuf.motor.DCMotor
             * @instance
             */
            DCMotor.prototype.maximumEffeciency = 0;

            /**
             * measured in Watts
             * @member {number} maximumPower
             * @memberof mirabuf.motor.DCMotor
             * @instance
             */
            DCMotor.prototype.maximumPower = 0;

            /**
             * Stated Duty Cycle of motor
             * @member {mirabuf.motor.DutyCycles} dutyCycle
             * @memberof mirabuf.motor.DCMotor
             * @instance
             */
            DCMotor.prototype.dutyCycle = 0;

            /**
             * Optional data that can give a better relationship to the simulation
             * @member {mirabuf.motor.DCMotor.Advanced.$Properties|null|undefined} advanced
             * @memberof mirabuf.motor.DCMotor
             * @instance
             */
            DCMotor.prototype.advanced = null;

            /**
             * Encodes the specified DCMotor message. Does not implicitly {@link mirabuf.motor.DCMotor.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.motor.DCMotor
             * @static
             * @param {mirabuf.motor.DCMotor.$Properties} message DCMotor message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DCMotor.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.referenceUrl != null && $Object.hasOwnProperty.call(message, "referenceUrl") && message.referenceUrl !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.referenceUrl);
                if (message.torqueConstant != null && $Object.hasOwnProperty.call(message, "torqueConstant") && !$Object.is(message.torqueConstant, 0))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.torqueConstant);
                if (message.emfConstant != null && $Object.hasOwnProperty.call(message, "emfConstant") && !$Object.is(message.emfConstant, 0))
                    writer.uint32(/* id 4, wireType 5 =*/37).float(message.emfConstant);
                if (message.resistance != null && $Object.hasOwnProperty.call(message, "resistance") && !$Object.is(message.resistance, 0))
                    writer.uint32(/* id 5, wireType 5 =*/45).float(message.resistance);
                if (message.maximumEffeciency != null && $Object.hasOwnProperty.call(message, "maximumEffeciency") && message.maximumEffeciency !== 0)
                    writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.maximumEffeciency);
                if (message.maximumPower != null && $Object.hasOwnProperty.call(message, "maximumPower") && message.maximumPower !== 0)
                    writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.maximumPower);
                if (message.dutyCycle != null && $Object.hasOwnProperty.call(message, "dutyCycle") && message.dutyCycle !== 0)
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.dutyCycle);
                if (message.advanced != null && $Object.hasOwnProperty.call(message, "advanced"))
                    $root.mirabuf.motor.DCMotor.Advanced.encode(message.advanced, writer.uint32(/* id 16, wireType 2 =*/130).fork(), _depth + 1).ldelim();
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a DCMotor message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.motor.DCMotor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.motor.DCMotor & mirabuf.motor.DCMotor.$Shape} DCMotor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DCMotor.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.motor.DCMotor(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.referenceUrl = value;
                            else
                                delete message.referenceUrl;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.torqueConstant = value;
                            else
                                delete message.torqueConstant;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.emfConstant = value;
                            else
                                delete message.emfConstant;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.resistance = value;
                            else
                                delete message.resistance;
                            continue;
                        }
                    case 6: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.uint32())
                                message.maximumEffeciency = value;
                            else
                                delete message.maximumEffeciency;
                            continue;
                        }
                    case 7: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.uint32())
                                message.maximumPower = value;
                            else
                                delete message.maximumPower;
                            continue;
                        }
                    case 8: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.dutyCycle = value;
                            else
                                delete message.dutyCycle;
                            continue;
                        }
                    case 16: {
                            if (wireType !== 2)
                                break;
                            message.advanced = $root.mirabuf.motor.DCMotor.Advanced.decode(reader, reader.uint32(), $undefined, _depth + 1, message.advanced);
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for DCMotor
             * @function getTypeUrl
             * @memberof mirabuf.motor.DCMotor
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            DCMotor.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.motor.DCMotor";
            };

            DCMotor.Advanced = (function() {

                /**
                 * Properties of an Advanced.
                 * @typedef {Object} mirabuf.motor.DCMotor.Advanced.$Properties
                 * @property {number|null} [freeCurrent] measured in AMPs
                 * @property {number|null} [freeSpeed] measured in RPM
                 * @property {number|null} [stallCurrent] measure in AMPs
                 * @property {number|null} [stallTorque] measured in Nm
                 * @property {number|null} [inputVoltage] measured in Volts DC
                 * @property {number|null} [resistanceVariation] between (K * (N / 4)) and (K * ((N-2) / 4)) where N is number of poles - leave at 0 if unknown
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an Advanced.
                 * @memberof mirabuf.motor.DCMotor
                 * @interface IAdvanced
                 * @augments mirabuf.motor.DCMotor.Advanced.$Properties
                 * @deprecated Use mirabuf.motor.DCMotor.Advanced.$Properties instead.
                 */

                /**
                 * Shape of an Advanced.
                 * @typedef {mirabuf.motor.DCMotor.Advanced.$Properties} mirabuf.motor.DCMotor.Advanced.$Shape
                 */

                /**
                 * Constructs a new Advanced.
                 * @memberof mirabuf.motor.DCMotor
                 * @classdesc Information usually found on datasheet
                 * @constructor
                 * @param {mirabuf.motor.DCMotor.Advanced.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Advanced = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * measured in AMPs
                 * @member {number} freeCurrent
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @instance
                 */
                Advanced.prototype.freeCurrent = 0;

                /**
                 * measured in RPM
                 * @member {number} freeSpeed
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @instance
                 */
                Advanced.prototype.freeSpeed = 0;

                /**
                 * measure in AMPs
                 * @member {number} stallCurrent
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @instance
                 */
                Advanced.prototype.stallCurrent = 0;

                /**
                 * measured in Nm
                 * @member {number} stallTorque
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @instance
                 */
                Advanced.prototype.stallTorque = 0;

                /**
                 * measured in Volts DC
                 * @member {number} inputVoltage
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @instance
                 */
                Advanced.prototype.inputVoltage = 0;

                /**
                 * between (K * (N / 4)) and (K * ((N-2) / 4)) where N is number of poles - leave at 0 if unknown
                 * @member {number} resistanceVariation
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @instance
                 */
                Advanced.prototype.resistanceVariation = 0;

                /**
                 * Encodes the specified Advanced message. Does not implicitly {@link mirabuf.motor.DCMotor.Advanced.verify|verify} messages.
                 * @function encode
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @static
                 * @param {mirabuf.motor.DCMotor.Advanced.$Properties} message Advanced message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Advanced.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.freeCurrent != null && $Object.hasOwnProperty.call(message, "freeCurrent") && !$Object.is(message.freeCurrent, 0))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.freeCurrent);
                    if (message.freeSpeed != null && $Object.hasOwnProperty.call(message, "freeSpeed") && message.freeSpeed !== 0)
                        writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.freeSpeed);
                    if (message.stallCurrent != null && $Object.hasOwnProperty.call(message, "stallCurrent") && !$Object.is(message.stallCurrent, 0))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.stallCurrent);
                    if (message.stallTorque != null && $Object.hasOwnProperty.call(message, "stallTorque") && !$Object.is(message.stallTorque, 0))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.stallTorque);
                    if (message.inputVoltage != null && $Object.hasOwnProperty.call(message, "inputVoltage") && message.inputVoltage !== 0)
                        writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.inputVoltage);
                    if (message.resistanceVariation != null && $Object.hasOwnProperty.call(message, "resistanceVariation") && !$Object.is(message.resistanceVariation, 0))
                        writer.uint32(/* id 7, wireType 5 =*/61).float(message.resistanceVariation);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes an Advanced message from the specified reader or buffer.
                 * @function decode
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mirabuf.motor.DCMotor.Advanced & mirabuf.motor.DCMotor.Advanced.$Shape} Advanced
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Advanced.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.motor.DCMotor.Advanced(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.freeCurrent = value;
                                else
                                    delete message.freeCurrent;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.freeSpeed = value;
                                else
                                    delete message.freeSpeed;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.stallCurrent = value;
                                else
                                    delete message.stallCurrent;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.stallTorque = value;
                                else
                                    delete message.stallTorque;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.uint32())
                                    message.inputVoltage = value;
                                else
                                    delete message.inputVoltage;
                                continue;
                            }
                        case 7: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.resistanceVariation = value;
                                else
                                    delete message.resistanceVariation;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Gets the type url for Advanced
                 * @function getTypeUrl
                 * @memberof mirabuf.motor.DCMotor.Advanced
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Advanced.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/mirabuf.motor.DCMotor.Advanced";
                };

                return Advanced;
            })();

            return DCMotor;
        })();

        return motor;
    })();

    mirabuf.material = (function() {

        /**
         * Namespace material.
         * @memberof mirabuf
         * @namespace
         */
        const material = {};

        material.Materials = (function() {

            /**
             * Properties of a Materials.
             * @typedef {Object} mirabuf.material.Materials.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] Identifiable information (id, name, version)
             * @property {Object.<string,mirabuf.material.PhysicalMaterial.$Properties>|null} [physicalMaterials] Map of Physical Materials
             * @property {Object.<string,mirabuf.material.Appearance.$Properties>|null} [appearances] Map of Appearances that are purely visual
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Materials.
             * @memberof mirabuf.material
             * @interface IMaterials
             * @augments mirabuf.material.Materials.$Properties
             * @deprecated Use mirabuf.material.Materials.$Properties instead.
             */

            /**
             * Shape of a Materials.
             * @typedef {mirabuf.material.Materials.$Properties} mirabuf.material.Materials.$Shape
             */

            /**
             * Constructs a new Materials.
             * @memberof mirabuf.material
             * @classdesc Represents a File or Set of Materials with Appearances and Physical Data
             * 
             * Can be Stored in AssemblyData
             * @constructor
             * @param {mirabuf.material.Materials.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Materials = function (properties) {
                this.physicalMaterials = {};
                this.appearances = {};
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Identifiable information (id, name, version)
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.material.Materials
             * @instance
             */
            Materials.prototype.info = null;

            /**
             * Map of Physical Materials
             * @member {Object.<string,mirabuf.material.PhysicalMaterial.$Properties>} physicalMaterials
             * @memberof mirabuf.material.Materials
             * @instance
             */
            Materials.prototype.physicalMaterials = $util.emptyObject;

            /**
             * Map of Appearances that are purely visual
             * @member {Object.<string,mirabuf.material.Appearance.$Properties>} appearances
             * @memberof mirabuf.material.Materials
             * @instance
             */
            Materials.prototype.appearances = $util.emptyObject;

            /**
             * Encodes the specified Materials message. Does not implicitly {@link mirabuf.material.Materials.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.material.Materials
             * @static
             * @param {mirabuf.material.Materials.$Properties} message Materials message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Materials.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.physicalMaterials != null && $Object.hasOwnProperty.call(message, "physicalMaterials"))
                    for (let keys = $Object.keys(message.physicalMaterials), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.mirabuf.material.PhysicalMaterial.encode(message.physicalMaterials[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim().ldelim();
                    }
                if (message.appearances != null && $Object.hasOwnProperty.call(message, "appearances"))
                    for (let keys = $Object.keys(message.appearances), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.mirabuf.material.Appearance.encode(message.appearances[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim().ldelim();
                    }
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Materials message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.material.Materials
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.material.Materials & mirabuf.material.Materials.$Shape} Materials
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Materials.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.material.Materials(), key, value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if (message.physicalMaterials === $util.emptyObject)
                                message.physicalMaterials = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                let tag2 = reader.tag();
                                wireType = tag2 & 7;
                                switch (tag2 >>>= 3) {
                                case 1:
                                    if (wireType !== 2)
                                        break;
                                    key = reader.stringVerify();
                                    continue;
                                case 2:
                                    if (wireType !== 2)
                                        break;
                                    value = $root.mirabuf.material.PhysicalMaterial.decode(reader, reader.uint32(), $undefined, _depth + 1, value);
                                    continue;
                                }
                                reader.skipType(wireType, _depth, tag2);
                            }
                            if (key === "__proto__")
                                $util.makeProp(message.physicalMaterials, key);
                            message.physicalMaterials[key] = value || new $root.mirabuf.material.PhysicalMaterial();
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if (message.appearances === $util.emptyObject)
                                message.appearances = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                let tag2 = reader.tag();
                                wireType = tag2 & 7;
                                switch (tag2 >>>= 3) {
                                case 1:
                                    if (wireType !== 2)
                                        break;
                                    key = reader.stringVerify();
                                    continue;
                                case 2:
                                    if (wireType !== 2)
                                        break;
                                    value = $root.mirabuf.material.Appearance.decode(reader, reader.uint32(), $undefined, _depth + 1, value);
                                    continue;
                                }
                                reader.skipType(wireType, _depth, tag2);
                            }
                            if (key === "__proto__")
                                $util.makeProp(message.appearances, key);
                            message.appearances[key] = value || new $root.mirabuf.material.Appearance();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Materials
             * @function getTypeUrl
             * @memberof mirabuf.material.Materials
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Materials.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.material.Materials";
            };

            return Materials;
        })();

        material.Appearance = (function() {

            /**
             * Properties of an Appearance.
             * @typedef {Object} mirabuf.material.Appearance.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] Identfiable information (id, name, version)
             * @property {mirabuf.Color.$Properties|null} [albedo] albedo map RGBA 0-255
             * @property {number|null} [roughness] roughness value 0-1
             * @property {number|null} [metallic] metallic value 0-1
             * @property {number|null} [specular] specular value 0-1
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of an Appearance.
             * @memberof mirabuf.material
             * @interface IAppearance
             * @augments mirabuf.material.Appearance.$Properties
             * @deprecated Use mirabuf.material.Appearance.$Properties instead.
             */

            /**
             * Shape of an Appearance.
             * @typedef {mirabuf.material.Appearance.$Properties} mirabuf.material.Appearance.$Shape
             */

            /**
             * Constructs a new Appearance.
             * @memberof mirabuf.material
             * @classdesc Contains information on how a object looks
             * Limited to just color for now
             * @constructor
             * @param {mirabuf.material.Appearance.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Appearance = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Identfiable information (id, name, version)
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.material.Appearance
             * @instance
             */
            Appearance.prototype.info = null;

            /**
             * albedo map RGBA 0-255
             * @member {mirabuf.Color.$Properties|null|undefined} albedo
             * @memberof mirabuf.material.Appearance
             * @instance
             */
            Appearance.prototype.albedo = null;

            /**
             * roughness value 0-1
             * @member {number} roughness
             * @memberof mirabuf.material.Appearance
             * @instance
             */
            Appearance.prototype.roughness = 0;

            /**
             * metallic value 0-1
             * @member {number} metallic
             * @memberof mirabuf.material.Appearance
             * @instance
             */
            Appearance.prototype.metallic = 0;

            /**
             * specular value 0-1
             * @member {number} specular
             * @memberof mirabuf.material.Appearance
             * @instance
             */
            Appearance.prototype.specular = 0;

            /**
             * Encodes the specified Appearance message. Does not implicitly {@link mirabuf.material.Appearance.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.material.Appearance
             * @static
             * @param {mirabuf.material.Appearance.$Properties} message Appearance message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Appearance.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.albedo != null && $Object.hasOwnProperty.call(message, "albedo"))
                    $root.mirabuf.Color.encode(message.albedo, writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                if (message.roughness != null && $Object.hasOwnProperty.call(message, "roughness") && !$Object.is(message.roughness, 0))
                    writer.uint32(/* id 3, wireType 1 =*/25).double(message.roughness);
                if (message.metallic != null && $Object.hasOwnProperty.call(message, "metallic") && !$Object.is(message.metallic, 0))
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.metallic);
                if (message.specular != null && $Object.hasOwnProperty.call(message, "specular") && !$Object.is(message.specular, 0))
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.specular);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes an Appearance message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.material.Appearance
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.material.Appearance & mirabuf.material.Appearance.$Shape} Appearance
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Appearance.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.material.Appearance(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            message.albedo = $root.mirabuf.Color.decode(reader, reader.uint32(), $undefined, _depth + 1, message.albedo);
                            continue;
                        }
                    case 3: {
                            if (wireType !== 1)
                                break;
                            if (!$Object.is(value = reader.double(), 0))
                                message.roughness = value;
                            else
                                delete message.roughness;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 1)
                                break;
                            if (!$Object.is(value = reader.double(), 0))
                                message.metallic = value;
                            else
                                delete message.metallic;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 1)
                                break;
                            if (!$Object.is(value = reader.double(), 0))
                                message.specular = value;
                            else
                                delete message.specular;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Appearance
             * @function getTypeUrl
             * @memberof mirabuf.material.Appearance
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Appearance.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.material.Appearance";
            };

            return Appearance;
        })();

        material.PhysicalMaterial = (function() {

            /**
             * Properties of a PhysicalMaterial.
             * @typedef {Object} mirabuf.material.PhysicalMaterial.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] Identifiable information (id, name, version, etc)
             * @property {string|null} [description] short description of physical material
             * @property {mirabuf.material.PhysicalMaterial.Thermal.$Properties|null} [thermal] Thermal Physical properties of the model OPTIONAL
             * @property {mirabuf.material.PhysicalMaterial.Mechanical.$Properties|null} [mechanical] Mechanical properties of the model OPTIONAL
             * @property {mirabuf.material.PhysicalMaterial.Strength.$Properties|null} [strength] Physical Strength properties of the model OPTIONAL
             * @property {number|null} [dynamicFriction] Frictional force for dampening - Interpolate (0-1)
             * @property {number|null} [staticFriction] Frictional force override at stop - Interpolate (0-1)
             * @property {number|null} [restitution] Restitution of the object - Interpolate (0-1)
             * @property {boolean|null} [deformable] should this object deform when encountering large forces - TODO: This needs a proper message and equation field
             * @property {mirabuf.material.PhysicalMaterial.MaterialType|null} [matType] generic type to assign some default params
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a PhysicalMaterial.
             * @memberof mirabuf.material
             * @interface IPhysicalMaterial
             * @augments mirabuf.material.PhysicalMaterial.$Properties
             * @deprecated Use mirabuf.material.PhysicalMaterial.$Properties instead.
             */

            /**
             * Shape of a PhysicalMaterial.
             * @typedef {mirabuf.material.PhysicalMaterial.$Properties} mirabuf.material.PhysicalMaterial.$Shape
             */

            /**
             * Constructs a new PhysicalMaterial.
             * @memberof mirabuf.material
             * @classdesc Data to represent any given Physical Material
             * @constructor
             * @param {mirabuf.material.PhysicalMaterial.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const PhysicalMaterial = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Identifiable information (id, name, version, etc)
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.info = null;

            /**
             * short description of physical material
             * @member {string} description
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.description = "";

            /**
             * Thermal Physical properties of the model OPTIONAL
             * @member {mirabuf.material.PhysicalMaterial.Thermal.$Properties|null|undefined} thermal
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.thermal = null;

            /**
             * Mechanical properties of the model OPTIONAL
             * @member {mirabuf.material.PhysicalMaterial.Mechanical.$Properties|null|undefined} mechanical
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.mechanical = null;

            /**
             * Physical Strength properties of the model OPTIONAL
             * @member {mirabuf.material.PhysicalMaterial.Strength.$Properties|null|undefined} strength
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.strength = null;

            /**
             * Frictional force for dampening - Interpolate (0-1)
             * @member {number} dynamicFriction
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.dynamicFriction = 0;

            /**
             * Frictional force override at stop - Interpolate (0-1)
             * @member {number} staticFriction
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.staticFriction = 0;

            /**
             * Restitution of the object - Interpolate (0-1)
             * @member {number} restitution
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.restitution = 0;

            /**
             * should this object deform when encountering large forces - TODO: This needs a proper message and equation field
             * @member {boolean} deformable
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.deformable = false;

            /**
             * generic type to assign some default params
             * @member {mirabuf.material.PhysicalMaterial.MaterialType} matType
             * @memberof mirabuf.material.PhysicalMaterial
             * @instance
             */
            PhysicalMaterial.prototype.matType = 0;

            /**
             * Encodes the specified PhysicalMaterial message. Does not implicitly {@link mirabuf.material.PhysicalMaterial.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.material.PhysicalMaterial
             * @static
             * @param {mirabuf.material.PhysicalMaterial.$Properties} message PhysicalMaterial message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PhysicalMaterial.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.description != null && $Object.hasOwnProperty.call(message, "description") && message.description !== "")
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
                if (message.thermal != null && $Object.hasOwnProperty.call(message, "thermal"))
                    $root.mirabuf.material.PhysicalMaterial.Thermal.encode(message.thermal, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                if (message.mechanical != null && $Object.hasOwnProperty.call(message, "mechanical"))
                    $root.mirabuf.material.PhysicalMaterial.Mechanical.encode(message.mechanical, writer.uint32(/* id 4, wireType 2 =*/34).fork(), _depth + 1).ldelim();
                if (message.strength != null && $Object.hasOwnProperty.call(message, "strength"))
                    $root.mirabuf.material.PhysicalMaterial.Strength.encode(message.strength, writer.uint32(/* id 5, wireType 2 =*/42).fork(), _depth + 1).ldelim();
                if (message.dynamicFriction != null && $Object.hasOwnProperty.call(message, "dynamicFriction") && !$Object.is(message.dynamicFriction, 0))
                    writer.uint32(/* id 6, wireType 5 =*/53).float(message.dynamicFriction);
                if (message.staticFriction != null && $Object.hasOwnProperty.call(message, "staticFriction") && !$Object.is(message.staticFriction, 0))
                    writer.uint32(/* id 7, wireType 5 =*/61).float(message.staticFriction);
                if (message.restitution != null && $Object.hasOwnProperty.call(message, "restitution") && !$Object.is(message.restitution, 0))
                    writer.uint32(/* id 8, wireType 5 =*/69).float(message.restitution);
                if (message.deformable != null && $Object.hasOwnProperty.call(message, "deformable") && message.deformable !== false)
                    writer.uint32(/* id 9, wireType 0 =*/72).bool(message.deformable);
                if (message.matType != null && $Object.hasOwnProperty.call(message, "matType") && message.matType !== 0)
                    writer.uint32(/* id 10, wireType 0 =*/80).int32(message.matType);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a PhysicalMaterial message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.material.PhysicalMaterial
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.material.PhysicalMaterial & mirabuf.material.PhysicalMaterial.$Shape} PhysicalMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PhysicalMaterial.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.material.PhysicalMaterial(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.description = value;
                            else
                                delete message.description;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            message.thermal = $root.mirabuf.material.PhysicalMaterial.Thermal.decode(reader, reader.uint32(), $undefined, _depth + 1, message.thermal);
                            continue;
                        }
                    case 4: {
                            if (wireType !== 2)
                                break;
                            message.mechanical = $root.mirabuf.material.PhysicalMaterial.Mechanical.decode(reader, reader.uint32(), $undefined, _depth + 1, message.mechanical);
                            continue;
                        }
                    case 5: {
                            if (wireType !== 2)
                                break;
                            message.strength = $root.mirabuf.material.PhysicalMaterial.Strength.decode(reader, reader.uint32(), $undefined, _depth + 1, message.strength);
                            continue;
                        }
                    case 6: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.dynamicFriction = value;
                            else
                                delete message.dynamicFriction;
                            continue;
                        }
                    case 7: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.staticFriction = value;
                            else
                                delete message.staticFriction;
                            continue;
                        }
                    case 8: {
                            if (wireType !== 5)
                                break;
                            if (!$Object.is(value = reader.float(), 0))
                                message.restitution = value;
                            else
                                delete message.restitution;
                            continue;
                        }
                    case 9: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.bool())
                                message.deformable = value;
                            else
                                delete message.deformable;
                            continue;
                        }
                    case 10: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.matType = value;
                            else
                                delete message.matType;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for PhysicalMaterial
             * @function getTypeUrl
             * @memberof mirabuf.material.PhysicalMaterial
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            PhysicalMaterial.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.material.PhysicalMaterial";
            };

            /**
             * MaterialType enum.
             * @name mirabuf.material.PhysicalMaterial.MaterialType
             * @enum {number}
             * @property {number} METAL=0 METAL value
             * @property {number} PLASTIC=1 PLASTIC value
             */
            PhysicalMaterial.MaterialType = (function() {
                const valuesById = $Object.create(null), values = $Object.create(valuesById);
                values[valuesById[0] = "METAL"] = 0;
                values[valuesById[1] = "PLASTIC"] = 1;
                return values;
            })();

            PhysicalMaterial.Thermal = (function() {

                /**
                 * Properties of a Thermal.
                 * @typedef {Object} mirabuf.material.PhysicalMaterial.Thermal.$Properties
                 * @property {number|null} [thermalConductivity] W/(m*K)
                 * @property {number|null} [specificHeat] J/(g*C)
                 * @property {number|null} [thermalExpansionCoefficient] um/(m*C)
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Thermal.
                 * @memberof mirabuf.material.PhysicalMaterial
                 * @interface IThermal
                 * @augments mirabuf.material.PhysicalMaterial.Thermal.$Properties
                 * @deprecated Use mirabuf.material.PhysicalMaterial.Thermal.$Properties instead.
                 */

                /**
                 * Shape of a Thermal.
                 * @typedef {mirabuf.material.PhysicalMaterial.Thermal.$Properties} mirabuf.material.PhysicalMaterial.Thermal.$Shape
                 */

                /**
                 * Constructs a new Thermal.
                 * @memberof mirabuf.material.PhysicalMaterial
                 * @classdesc Thermal Properties Set Definition for Simulation.
                 * @constructor
                 * @param {mirabuf.material.PhysicalMaterial.Thermal.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Thermal = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * W/(m*K)
                 * @member {number} thermalConductivity
                 * @memberof mirabuf.material.PhysicalMaterial.Thermal
                 * @instance
                 */
                Thermal.prototype.thermalConductivity = 0;

                /**
                 * J/(g*C)
                 * @member {number} specificHeat
                 * @memberof mirabuf.material.PhysicalMaterial.Thermal
                 * @instance
                 */
                Thermal.prototype.specificHeat = 0;

                /**
                 * um/(m*C)
                 * @member {number} thermalExpansionCoefficient
                 * @memberof mirabuf.material.PhysicalMaterial.Thermal
                 * @instance
                 */
                Thermal.prototype.thermalExpansionCoefficient = 0;

                /**
                 * Encodes the specified Thermal message. Does not implicitly {@link mirabuf.material.PhysicalMaterial.Thermal.verify|verify} messages.
                 * @function encode
                 * @memberof mirabuf.material.PhysicalMaterial.Thermal
                 * @static
                 * @param {mirabuf.material.PhysicalMaterial.Thermal.$Properties} message Thermal message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Thermal.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.thermalConductivity != null && $Object.hasOwnProperty.call(message, "thermalConductivity") && !$Object.is(message.thermalConductivity, 0))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.thermalConductivity);
                    if (message.specificHeat != null && $Object.hasOwnProperty.call(message, "specificHeat") && !$Object.is(message.specificHeat, 0))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.specificHeat);
                    if (message.thermalExpansionCoefficient != null && $Object.hasOwnProperty.call(message, "thermalExpansionCoefficient") && !$Object.is(message.thermalExpansionCoefficient, 0))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.thermalExpansionCoefficient);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Thermal message from the specified reader or buffer.
                 * @function decode
                 * @memberof mirabuf.material.PhysicalMaterial.Thermal
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mirabuf.material.PhysicalMaterial.Thermal & mirabuf.material.PhysicalMaterial.Thermal.$Shape} Thermal
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Thermal.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.material.PhysicalMaterial.Thermal(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.thermalConductivity = value;
                                else
                                    delete message.thermalConductivity;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.specificHeat = value;
                                else
                                    delete message.specificHeat;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.thermalExpansionCoefficient = value;
                                else
                                    delete message.thermalExpansionCoefficient;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Gets the type url for Thermal
                 * @function getTypeUrl
                 * @memberof mirabuf.material.PhysicalMaterial.Thermal
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Thermal.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/mirabuf.material.PhysicalMaterial.Thermal";
                };

                return Thermal;
            })();

            PhysicalMaterial.Mechanical = (function() {

                /**
                 * Properties of a Mechanical.
                 * @typedef {Object} mirabuf.material.PhysicalMaterial.Mechanical.$Properties
                 * @property {number|null} [youngMod] GPa
                 * @property {number|null} [poissonRatio] ?
                 * @property {number|null} [shearMod] MPa
                 * @property {number|null} [density] g/cm^3
                 * @property {number|null} [dampingCoefficient] ?
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Mechanical.
                 * @memberof mirabuf.material.PhysicalMaterial
                 * @interface IMechanical
                 * @augments mirabuf.material.PhysicalMaterial.Mechanical.$Properties
                 * @deprecated Use mirabuf.material.PhysicalMaterial.Mechanical.$Properties instead.
                 */

                /**
                 * Shape of a Mechanical.
                 * @typedef {mirabuf.material.PhysicalMaterial.Mechanical.$Properties} mirabuf.material.PhysicalMaterial.Mechanical.$Shape
                 */

                /**
                 * Constructs a new Mechanical.
                 * @memberof mirabuf.material.PhysicalMaterial
                 * @classdesc Mechanical Properties Set Definition for Simulation.
                 * @constructor
                 * @param {mirabuf.material.PhysicalMaterial.Mechanical.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Mechanical = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * GPa
                 * @member {number} youngMod
                 * @memberof mirabuf.material.PhysicalMaterial.Mechanical
                 * @instance
                 */
                Mechanical.prototype.youngMod = 0;

                /**
                 * ?
                 * @member {number} poissonRatio
                 * @memberof mirabuf.material.PhysicalMaterial.Mechanical
                 * @instance
                 */
                Mechanical.prototype.poissonRatio = 0;

                /**
                 * MPa
                 * @member {number} shearMod
                 * @memberof mirabuf.material.PhysicalMaterial.Mechanical
                 * @instance
                 */
                Mechanical.prototype.shearMod = 0;

                /**
                 * g/cm^3
                 * @member {number} density
                 * @memberof mirabuf.material.PhysicalMaterial.Mechanical
                 * @instance
                 */
                Mechanical.prototype.density = 0;

                /**
                 * ?
                 * @member {number} dampingCoefficient
                 * @memberof mirabuf.material.PhysicalMaterial.Mechanical
                 * @instance
                 */
                Mechanical.prototype.dampingCoefficient = 0;

                /**
                 * Encodes the specified Mechanical message. Does not implicitly {@link mirabuf.material.PhysicalMaterial.Mechanical.verify|verify} messages.
                 * @function encode
                 * @memberof mirabuf.material.PhysicalMaterial.Mechanical
                 * @static
                 * @param {mirabuf.material.PhysicalMaterial.Mechanical.$Properties} message Mechanical message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Mechanical.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.youngMod != null && $Object.hasOwnProperty.call(message, "youngMod") && !$Object.is(message.youngMod, 0))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.youngMod);
                    if (message.poissonRatio != null && $Object.hasOwnProperty.call(message, "poissonRatio") && !$Object.is(message.poissonRatio, 0))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.poissonRatio);
                    if (message.shearMod != null && $Object.hasOwnProperty.call(message, "shearMod") && !$Object.is(message.shearMod, 0))
                        writer.uint32(/* id 3, wireType 5 =*/29).float(message.shearMod);
                    if (message.density != null && $Object.hasOwnProperty.call(message, "density") && !$Object.is(message.density, 0))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.density);
                    if (message.dampingCoefficient != null && $Object.hasOwnProperty.call(message, "dampingCoefficient") && !$Object.is(message.dampingCoefficient, 0))
                        writer.uint32(/* id 5, wireType 5 =*/45).float(message.dampingCoefficient);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Mechanical message from the specified reader or buffer.
                 * @function decode
                 * @memberof mirabuf.material.PhysicalMaterial.Mechanical
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mirabuf.material.PhysicalMaterial.Mechanical & mirabuf.material.PhysicalMaterial.Mechanical.$Shape} Mechanical
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Mechanical.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.material.PhysicalMaterial.Mechanical(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.youngMod = value;
                                else
                                    delete message.youngMod;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.poissonRatio = value;
                                else
                                    delete message.poissonRatio;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.shearMod = value;
                                else
                                    delete message.shearMod;
                                continue;
                            }
                        case 4: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.density = value;
                                else
                                    delete message.density;
                                continue;
                            }
                        case 5: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.dampingCoefficient = value;
                                else
                                    delete message.dampingCoefficient;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Gets the type url for Mechanical
                 * @function getTypeUrl
                 * @memberof mirabuf.material.PhysicalMaterial.Mechanical
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Mechanical.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/mirabuf.material.PhysicalMaterial.Mechanical";
                };

                return Mechanical;
            })();

            PhysicalMaterial.Strength = (function() {

                /**
                 * Properties of a Strength.
                 * @typedef {Object} mirabuf.material.PhysicalMaterial.Strength.$Properties
                 * @property {number|null} [yieldStrength] MPa
                 * @property {number|null} [tensileStrength] MPa
                 * @property {boolean|null} [thermalTreatment] yes / no
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Strength.
                 * @memberof mirabuf.material.PhysicalMaterial
                 * @interface IStrength
                 * @augments mirabuf.material.PhysicalMaterial.Strength.$Properties
                 * @deprecated Use mirabuf.material.PhysicalMaterial.Strength.$Properties instead.
                 */

                /**
                 * Shape of a Strength.
                 * @typedef {mirabuf.material.PhysicalMaterial.Strength.$Properties} mirabuf.material.PhysicalMaterial.Strength.$Shape
                 */

                /**
                 * Constructs a new Strength.
                 * @memberof mirabuf.material.PhysicalMaterial
                 * @classdesc Strength Properties Set Definition for Simulation.
                 * @constructor
                 * @param {mirabuf.material.PhysicalMaterial.Strength.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Strength = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * MPa
                 * @member {number} yieldStrength
                 * @memberof mirabuf.material.PhysicalMaterial.Strength
                 * @instance
                 */
                Strength.prototype.yieldStrength = 0;

                /**
                 * MPa
                 * @member {number} tensileStrength
                 * @memberof mirabuf.material.PhysicalMaterial.Strength
                 * @instance
                 */
                Strength.prototype.tensileStrength = 0;

                /**
                 * yes / no
                 * @member {boolean} thermalTreatment
                 * @memberof mirabuf.material.PhysicalMaterial.Strength
                 * @instance
                 */
                Strength.prototype.thermalTreatment = false;

                /**
                 * Encodes the specified Strength message. Does not implicitly {@link mirabuf.material.PhysicalMaterial.Strength.verify|verify} messages.
                 * @function encode
                 * @memberof mirabuf.material.PhysicalMaterial.Strength
                 * @static
                 * @param {mirabuf.material.PhysicalMaterial.Strength.$Properties} message Strength message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Strength.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.yieldStrength != null && $Object.hasOwnProperty.call(message, "yieldStrength") && !$Object.is(message.yieldStrength, 0))
                        writer.uint32(/* id 1, wireType 5 =*/13).float(message.yieldStrength);
                    if (message.tensileStrength != null && $Object.hasOwnProperty.call(message, "tensileStrength") && !$Object.is(message.tensileStrength, 0))
                        writer.uint32(/* id 2, wireType 5 =*/21).float(message.tensileStrength);
                    if (message.thermalTreatment != null && $Object.hasOwnProperty.call(message, "thermalTreatment") && message.thermalTreatment !== false)
                        writer.uint32(/* id 3, wireType 0 =*/24).bool(message.thermalTreatment);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Strength message from the specified reader or buffer.
                 * @function decode
                 * @memberof mirabuf.material.PhysicalMaterial.Strength
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mirabuf.material.PhysicalMaterial.Strength & mirabuf.material.PhysicalMaterial.Strength.$Shape} Strength
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Strength.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.material.PhysicalMaterial.Strength(), value;
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.yieldStrength = value;
                                else
                                    delete message.yieldStrength;
                                continue;
                            }
                        case 2: {
                                if (wireType !== 5)
                                    break;
                                if (!$Object.is(value = reader.float(), 0))
                                    message.tensileStrength = value;
                                else
                                    delete message.tensileStrength;
                                continue;
                            }
                        case 3: {
                                if (wireType !== 0)
                                    break;
                                if (value = reader.bool())
                                    message.thermalTreatment = value;
                                else
                                    delete message.thermalTreatment;
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    return message;
                };

                /**
                 * Gets the type url for Strength
                 * @function getTypeUrl
                 * @memberof mirabuf.material.PhysicalMaterial.Strength
                 * @static
                 * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns {string} The type url
                 */
                Strength.getTypeUrl = function(prefix) {
                    if (prefix === $undefined)
                        prefix = "type.googleapis.com";
                    return prefix + "/mirabuf.material.PhysicalMaterial.Strength";
                };

                return Strength;
            })();

            return PhysicalMaterial;
        })();

        return material;
    })();

    mirabuf.signal = (function() {

        /**
         * Namespace signal.
         * @memberof mirabuf
         * @namespace
         */
        const signal = {};

        signal.Signals = (function() {

            /**
             * Properties of a Signals.
             * @typedef {Object} mirabuf.signal.Signals.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] Has identifiable data (id, name, version)
             * @property {Object.<string,mirabuf.signal.Signal.$Properties>|null} [signalMap] Contains a full collection of symbols
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Signals.
             * @memberof mirabuf.signal
             * @interface ISignals
             * @augments mirabuf.signal.Signals.$Properties
             * @deprecated Use mirabuf.signal.Signals.$Properties instead.
             */

            /**
             * Shape of a Signals.
             * @typedef {mirabuf.signal.Signals.$Properties} mirabuf.signal.Signals.$Shape
             */

            /**
             * Constructs a new Signals.
             * @memberof mirabuf.signal
             * @classdesc Signals is a container for all of the potential signals.
             * @constructor
             * @param {mirabuf.signal.Signals.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Signals = function (properties) {
                this.signalMap = {};
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Has identifiable data (id, name, version)
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.signal.Signals
             * @instance
             */
            Signals.prototype.info = null;

            /**
             * Contains a full collection of symbols
             * @member {Object.<string,mirabuf.signal.Signal.$Properties>} signalMap
             * @memberof mirabuf.signal.Signals
             * @instance
             */
            Signals.prototype.signalMap = $util.emptyObject;

            /**
             * Encodes the specified Signals message. Does not implicitly {@link mirabuf.signal.Signals.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.signal.Signals
             * @static
             * @param {mirabuf.signal.Signals.$Properties} message Signals message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Signals.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.signalMap != null && $Object.hasOwnProperty.call(message, "signalMap"))
                    for (let keys = $Object.keys(message.signalMap), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.mirabuf.signal.Signal.encode(message.signalMap[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim().ldelim();
                    }
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Signals message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.signal.Signals
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.signal.Signals & mirabuf.signal.Signals.$Shape} Signals
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Signals.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.signal.Signals(), key, value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 2)
                                break;
                            if (message.signalMap === $util.emptyObject)
                                message.signalMap = {};
                            let end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                let tag2 = reader.tag();
                                wireType = tag2 & 7;
                                switch (tag2 >>>= 3) {
                                case 1:
                                    if (wireType !== 2)
                                        break;
                                    key = reader.stringVerify();
                                    continue;
                                case 2:
                                    if (wireType !== 2)
                                        break;
                                    value = $root.mirabuf.signal.Signal.decode(reader, reader.uint32(), $undefined, _depth + 1, value);
                                    continue;
                                }
                                reader.skipType(wireType, _depth, tag2);
                            }
                            if (key === "__proto__")
                                $util.makeProp(message.signalMap, key);
                            message.signalMap[key] = value || new $root.mirabuf.signal.Signal();
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Signals
             * @function getTypeUrl
             * @memberof mirabuf.signal.Signals
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Signals.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.signal.Signals";
            };

            return Signals;
        })();

        /**
         * IOType is a way to specify Input or Output.
         * @name mirabuf.signal.IOType
         * @enum {number}
         * @property {number} INPUT=0 Input Signal
         * @property {number} OUTPUT=1 Output Signal
         */
        signal.IOType = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "INPUT"] = 0;
            values[valuesById[1] = "OUTPUT"] = 1;
            return values;
        })();

        /**
         * DeviceType needs to be a type of device that has a supported connection
         * As well as a signal frmae but that can come later
         * @name mirabuf.signal.DeviceType
         * @enum {number}
         * @property {number} PWM=0 PWM value
         * @property {number} Digital=1 Digital value
         * @property {number} Analog=2 Analog value
         * @property {number} I2C=3 I2C value
         * @property {number} CANBUS=4 CANBUS value
         * @property {number} CUSTOM=5 CUSTOM value
         */
        signal.DeviceType = (function() {
            const valuesById = $Object.create(null), values = $Object.create(valuesById);
            values[valuesById[0] = "PWM"] = 0;
            values[valuesById[1] = "Digital"] = 1;
            values[valuesById[2] = "Analog"] = 2;
            values[valuesById[3] = "I2C"] = 3;
            values[valuesById[4] = "CANBUS"] = 4;
            values[valuesById[5] = "CUSTOM"] = 5;
            return values;
        })();

        signal.Signal = (function() {

            /**
             * Properties of a Signal.
             * @typedef {Object} mirabuf.signal.Signal.$Properties
             * @property {mirabuf.Info.$Properties|null} [info] Has identifiable data (id, name, version)
             * @property {mirabuf.signal.IOType|null} [io] Is this a Input or Output
             * @property {string|null} [customType] The name of a custom input type that is not listed as a device type
             * @property {number|null} [signalId] ID for a given signal that exists... PWM 2, CANBUS 4
             * @property {mirabuf.signal.DeviceType|null} [deviceType] Enum for device type that should always be set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */

            /**
             * Properties of a Signal.
             * @memberof mirabuf.signal
             * @interface ISignal
             * @augments mirabuf.signal.Signal.$Properties
             * @deprecated Use mirabuf.signal.Signal.$Properties instead.
             */

            /**
             * Shape of a Signal.
             * @typedef {mirabuf.signal.Signal.$Properties} mirabuf.signal.Signal.$Shape
             */

            /**
             * Constructs a new Signal.
             * @memberof mirabuf.signal
             * @classdesc Signal is a way to define a controlling signal.
             * 
             * TODO: Add Origin
             * TODO: Decide how this is linked to a exported object
             * @constructor
             * @param {mirabuf.signal.Signal.$Properties=} [properties] Properties to set
             * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
             */
            const Signal = function (properties) {
                if (properties)
                    for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null && keys[i] !== "__proto__")
                            this[keys[i]] = properties[keys[i]];
            };

            /**
             * Has identifiable data (id, name, version)
             * @member {mirabuf.Info.$Properties|null|undefined} info
             * @memberof mirabuf.signal.Signal
             * @instance
             */
            Signal.prototype.info = null;

            /**
             * Is this a Input or Output
             * @member {mirabuf.signal.IOType} io
             * @memberof mirabuf.signal.Signal
             * @instance
             */
            Signal.prototype.io = 0;

            /**
             * The name of a custom input type that is not listed as a device type
             * @member {string} customType
             * @memberof mirabuf.signal.Signal
             * @instance
             */
            Signal.prototype.customType = "";

            /**
             * ID for a given signal that exists... PWM 2, CANBUS 4
             * @member {number} signalId
             * @memberof mirabuf.signal.Signal
             * @instance
             */
            Signal.prototype.signalId = 0;

            /**
             * Enum for device type that should always be set
             * @member {mirabuf.signal.DeviceType} deviceType
             * @memberof mirabuf.signal.Signal
             * @instance
             */
            Signal.prototype.deviceType = 0;

            /**
             * Encodes the specified Signal message. Does not implicitly {@link mirabuf.signal.Signal.verify|verify} messages.
             * @function encode
             * @memberof mirabuf.signal.Signal
             * @static
             * @param {mirabuf.signal.Signal.$Properties} message Signal message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Signal.encode = function (message, writer, _depth) {
                if (!writer)
                    writer = $Writer.create();
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $util.recursionLimit)
                    throw $Error("max depth exceeded");
                if (message.info != null && $Object.hasOwnProperty.call(message, "info"))
                    $root.mirabuf.Info.encode(message.info, writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                if (message.io != null && $Object.hasOwnProperty.call(message, "io") && message.io !== 0)
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.io);
                if (message.customType != null && $Object.hasOwnProperty.call(message, "customType") && message.customType !== "")
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.customType);
                if (message.signalId != null && $Object.hasOwnProperty.call(message, "signalId") && message.signalId !== 0)
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.signalId);
                if (message.deviceType != null && $Object.hasOwnProperty.call(message, "deviceType") && message.deviceType !== 0)
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.deviceType);
                if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                    for (let i = 0; i < message.$unknowns.length; ++i)
                        writer.raw(message.$unknowns[i]);
                return writer;
            };

            /**
             * Decodes a Signal message from the specified reader or buffer.
             * @function decode
             * @memberof mirabuf.signal.Signal
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {mirabuf.signal.Signal & mirabuf.signal.Signal.$Shape} Signal
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Signal.decode = function (reader, length, _end, _depth, _target) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                if (_depth === $undefined)
                    _depth = 0;
                if (_depth > $Reader.recursionLimit)
                    throw $Error("max depth exceeded");
                let end = length === $undefined ? reader.len : reader.pos + length, message = _target || new $root.mirabuf.signal.Signal(), value;
                while (reader.pos < end) {
                    let start = reader.pos;
                    let tag = reader.tag();
                    if (tag === _end) {
                        _end = $undefined;
                        break;
                    }
                    let wireType = tag & 7;
                    switch (tag >>>= 3) {
                    case 1: {
                            if (wireType !== 2)
                                break;
                            message.info = $root.mirabuf.Info.decode(reader, reader.uint32(), $undefined, _depth + 1, message.info);
                            continue;
                        }
                    case 2: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.io = value;
                            else
                                delete message.io;
                            continue;
                        }
                    case 3: {
                            if (wireType !== 2)
                                break;
                            if ((value = reader.stringVerify()).length)
                                message.customType = value;
                            else
                                delete message.customType;
                            continue;
                        }
                    case 4: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.uint32())
                                message.signalId = value;
                            else
                                delete message.signalId;
                            continue;
                        }
                    case 5: {
                            if (wireType !== 0)
                                break;
                            if (value = reader.int32())
                                message.deviceType = value;
                            else
                                delete message.deviceType;
                            continue;
                        }
                    }
                    reader.skipType(wireType, _depth, tag);
                    if (!reader.discardUnknown) {
                        $util.makeProp(message, "$unknowns", false);
                        (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                    }
                }
                if (_end !== $undefined)
                    throw $Error("missing end group");
                return message;
            };

            /**
             * Gets the type url for Signal
             * @function getTypeUrl
             * @memberof mirabuf.signal.Signal
             * @static
             * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns {string} The type url
             */
            Signal.getTypeUrl = function(prefix) {
                if (prefix === $undefined)
                    prefix = "type.googleapis.com";
                return prefix + "/mirabuf.signal.Signal";
            };

            return Signal;
        })();

        return signal;
    })();

    return mirabuf;
})();

export {
  $root as default
};
