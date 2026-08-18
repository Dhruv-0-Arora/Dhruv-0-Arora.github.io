import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace mirabuf. */
export namespace mirabuf {

    /**
     * Properties of an Assembly.
     * @deprecated Use mirabuf.Assembly.$Properties instead.
     */
    interface IAssembly extends mirabuf.Assembly.$Properties {
    }

    /**
     * Assembly
     * Base Design to be interacted with
     * THIS IS THE CURRENT FILE EXPORTED
     */
    class Assembly {

        /**
         * Constructs a new Assembly.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Assembly.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Basic information (name, Author, etc) */
        info?: (mirabuf.Info.$Properties|null);

        /** All of the data in the assembly */
        data?: (mirabuf.AssemblyData.$Properties|null);

        /** Can it be effected by the simulation dynamically */
        dynamic: boolean;

        /** Overall physical data of the assembly */
        physicalData?: (mirabuf.PhysicalProperties.$Properties|null);

        /** The Design hierarchy represented by Part Refs - The first object is a root container for all top level items */
        designHierarchy?: (mirabuf.GraphContainer.$Properties|null);

        /** The Joint hierarchy for compound shapes */
        jointHierarchy?: (mirabuf.GraphContainer.$Properties|null);

        /** The Transform in space currently */
        transform?: (mirabuf.Transform.$Properties|null);

        /** Optional thumbnail saved from Fusion 360 or scraped from previous configuration */
        thumbnail?: (mirabuf.Thumbnail.$Properties|null);

        /**
         * Encodes the specified Assembly message. Does not implicitly {@link mirabuf.Assembly.verify|verify} messages.
         * @param message Assembly message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Assembly.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Assembly message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Assembly & mirabuf.Assembly.$Shape} Assembly
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Assembly & mirabuf.Assembly.$Shape;

        /**
         * Gets the type url for Assembly
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Assembly {

        /** Properties of an Assembly. */
        interface $Properties {

            /** Basic information (name, Author, etc) */
            info?: (mirabuf.Info.$Properties|null);

            /** All of the data in the assembly */
            data?: (mirabuf.AssemblyData.$Properties|null);

            /** Can it be effected by the simulation dynamically */
            dynamic?: (boolean|null);

            /** Overall physical data of the assembly */
            physicalData?: (mirabuf.PhysicalProperties.$Properties|null);

            /** The Design hierarchy represented by Part Refs - The first object is a root container for all top level items */
            designHierarchy?: (mirabuf.GraphContainer.$Properties|null);

            /** The Joint hierarchy for compound shapes */
            jointHierarchy?: (mirabuf.GraphContainer.$Properties|null);

            /** The Transform in space currently */
            transform?: (mirabuf.Transform.$Properties|null);

            /** Optional thumbnail saved from Fusion 360 or scraped from previous configuration */
            thumbnail?: (mirabuf.Thumbnail.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an Assembly. */
        type $Shape = {
          info?: mirabuf.Info.$Shape|null;
          data?: mirabuf.AssemblyData.$Shape|null;
          dynamic?: boolean|null;
          physicalData?: mirabuf.PhysicalProperties.$Shape|null;
          designHierarchy?: mirabuf.GraphContainer.$Shape|null;
          jointHierarchy?: mirabuf.GraphContainer.$Shape|null;
          transform?: mirabuf.Transform.$Shape|null;
          thumbnail?: mirabuf.Thumbnail.$Shape|null;
          $unknowns?: Uint8Array[];
        };
    }

    /**
     * Properties of an AssemblyData.
     * @deprecated Use mirabuf.AssemblyData.$Properties instead.
     */
    interface IAssemblyData extends mirabuf.AssemblyData.$Properties {
    }

    /** Data used to construct the assembly */
    class AssemblyData {

        /**
         * Constructs a new AssemblyData.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.AssemblyData.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Meshes and Design Objects */
        parts?: (mirabuf.Parts.$Properties|null);

        /** Joint Definition Set */
        joints?: (mirabuf.joint.Joints.$Properties|null);

        /** Appearance and Physical Material Set */
        materials?: (mirabuf.material.Materials.$Properties|null);

        /** AssemblyData signals. */
        signals?: (mirabuf.signal.Signals.$Properties|null);

        /**
         * Encodes the specified AssemblyData message. Does not implicitly {@link mirabuf.AssemblyData.verify|verify} messages.
         * @param message AssemblyData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.AssemblyData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AssemblyData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.AssemblyData & mirabuf.AssemblyData.$Shape} AssemblyData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.AssemblyData & mirabuf.AssemblyData.$Shape;

        /**
         * Gets the type url for AssemblyData
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace AssemblyData {

        /** Properties of an AssemblyData. */
        interface $Properties {

            /** Meshes and Design Objects */
            parts?: (mirabuf.Parts.$Properties|null);

            /** Joint Definition Set */
            joints?: (mirabuf.joint.Joints.$Properties|null);

            /** Appearance and Physical Material Set */
            materials?: (mirabuf.material.Materials.$Properties|null);

            /** AssemblyData signals */
            signals?: (mirabuf.signal.Signals.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an AssemblyData. */
        type $Shape = {
          parts?: mirabuf.Parts.$Shape|null;
          joints?: mirabuf.joint.Joints.$Shape|null;
          materials?: mirabuf.material.Materials.$Shape|null;
          signals?: mirabuf.signal.Signals.$Shape|null;
          $unknowns?: Uint8Array[];
        };
    }

    /**
     * Properties of a Parts.
     * @deprecated Use mirabuf.Parts.$Properties instead.
     */
    interface IParts extends mirabuf.Parts.$Properties {
    }

    /** Represents a Parts. */
    class Parts {

        /**
         * Constructs a new Parts.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Parts.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Part name, version, GUID */
        info?: (mirabuf.Info.$Properties|null);

        /** Map of the Exported Part Definitions */
        partDefinitions: { [k: string]: mirabuf.PartDefinition.$Properties };

        /** Map of the Exported Parts that make up the object */
        partInstances: { [k: string]: mirabuf.PartInstance.$Properties };

        /** other associated data that can be used */
        userData?: (mirabuf.UserData.$Properties|null);

        /**
         * Encodes the specified Parts message. Does not implicitly {@link mirabuf.Parts.verify|verify} messages.
         * @param message Parts message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Parts.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Parts message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Parts & mirabuf.Parts.$Shape} Parts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Parts & mirabuf.Parts.$Shape;

        /**
         * Gets the type url for Parts
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Parts {

        /** Properties of a Parts. */
        interface $Properties {

            /** Part name, version, GUID */
            info?: (mirabuf.Info.$Properties|null);

            /** Map of the Exported Part Definitions */
            partDefinitions?: ({ [k: string]: mirabuf.PartDefinition.$Properties }|null);

            /** Map of the Exported Parts that make up the object */
            partInstances?: ({ [k: string]: mirabuf.PartInstance.$Properties }|null);

            /** other associated data that can be used */
            userData?: (mirabuf.UserData.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Parts. */
        type $Shape = {
          info?: mirabuf.Info.$Shape|null;
          partDefinitions?: { [k: string]: mirabuf.PartDefinition.$Shape }|null;
          partInstances?: { [k: string]: mirabuf.PartInstance.$Shape }|null;
          userData?: mirabuf.UserData.$Shape|null;
          $unknowns?: Uint8Array[];
        };
    }

    /**
     * Properties of a PartDefinition.
     * @deprecated Use mirabuf.PartDefinition.$Properties instead.
     */
    interface IPartDefinition extends mirabuf.PartDefinition.$Properties {
    }

    /**
     * Part Definition
     * Unique Definition of a part that can be replicated.
     * Useful for keeping the object counter down in the scene.
     */
    class PartDefinition {

        /**
         * Constructs a new PartDefinition.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.PartDefinition.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Information about version - id - name */
        info?: (mirabuf.Info.$Properties|null);

        /** Physical data associated with Part */
        physicalData?: (mirabuf.PhysicalProperties.$Properties|null);

        /** Base Transform applied - Most Likely Identity Matrix */
        baseTransform?: (mirabuf.Transform.$Properties|null);

        /** Mesh Bodies to populate part */
        bodies: mirabuf.Body.$Properties[];

        /** Optional value to state whether an object is a dynamic object in a static assembly - all children are also considered overriden */
        dynamic: boolean;

        /** Optional value for overriding the friction value 0-1 */
        frictionOverride: number;

        /** Optional value for overriding an indiviaul object's mass */
        massOverride: number;

        /**
         * Encodes the specified PartDefinition message. Does not implicitly {@link mirabuf.PartDefinition.verify|verify} messages.
         * @param message PartDefinition message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.PartDefinition.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PartDefinition message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.PartDefinition & mirabuf.PartDefinition.$Shape} PartDefinition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.PartDefinition & mirabuf.PartDefinition.$Shape;

        /**
         * Gets the type url for PartDefinition
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace PartDefinition {

        /** Properties of a PartDefinition. */
        interface $Properties {

            /** Information about version - id - name */
            info?: (mirabuf.Info.$Properties|null);

            /** Physical data associated with Part */
            physicalData?: (mirabuf.PhysicalProperties.$Properties|null);

            /** Base Transform applied - Most Likely Identity Matrix */
            baseTransform?: (mirabuf.Transform.$Properties|null);

            /** Mesh Bodies to populate part */
            bodies?: (mirabuf.Body.$Properties[]|null);

            /** Optional value to state whether an object is a dynamic object in a static assembly - all children are also considered overriden */
            dynamic?: (boolean|null);

            /** Optional value for overriding the friction value 0-1 */
            frictionOverride?: (number|null);

            /** Optional value for overriding an indiviaul object's mass */
            massOverride?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a PartDefinition. */
        type $Shape = {
          info?: mirabuf.Info.$Shape|null;
          physicalData?: mirabuf.PhysicalProperties.$Shape|null;
          baseTransform?: mirabuf.Transform.$Shape|null;
          bodies?: mirabuf.Body.$Shape[]|null;
          dynamic?: boolean|null;
          frictionOverride?: number|null;
          massOverride?: number|null;
          $unknowns?: Uint8Array[];
        };
    }

    /**
     * Properties of a PartInstance.
     * @deprecated Use mirabuf.PartInstance.$Properties instead.
     */
    interface IPartInstance extends mirabuf.PartInstance.$Properties {
    }

    /** Represents a PartInstance. */
    class PartInstance {

        /**
         * Constructs a new PartInstance.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.PartInstance.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** PartInstance info. */
        info?: (mirabuf.Info.$Properties|null);

        /** Reference to the Part Definition defined in Assembly Data */
        partDefinitionReference: string;

        /** Overriding the object transform (moves the part from the def) - in design hierarchy context */
        transform?: (mirabuf.Transform.$Properties|null);

        /** Position transform from a global scope */
        globalTransform?: (mirabuf.Transform.$Properties|null);

        /** Joints that interact with this element */
        joints: string[];

        /** PartInstance appearance. */
        appearance: string;

        /** Physical Material Reference to link to `Materials->PhysicalMaterial->Info->id` */
        physicalMaterial: string;

        /** Flag that if enabled indicates we should skip generating a collider, defaults to FALSE or undefined */
        skipCollider: boolean;

        /**
         * Encodes the specified PartInstance message. Does not implicitly {@link mirabuf.PartInstance.verify|verify} messages.
         * @param message PartInstance message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.PartInstance.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PartInstance message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.PartInstance & mirabuf.PartInstance.$Shape} PartInstance
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.PartInstance & mirabuf.PartInstance.$Shape;

        /**
         * Gets the type url for PartInstance
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace PartInstance {

        /** Properties of a PartInstance. */
        interface $Properties {

            /** PartInstance info */
            info?: (mirabuf.Info.$Properties|null);

            /** Reference to the Part Definition defined in Assembly Data */
            partDefinitionReference?: (string|null);

            /** Overriding the object transform (moves the part from the def) - in design hierarchy context */
            transform?: (mirabuf.Transform.$Properties|null);

            /** Position transform from a global scope */
            globalTransform?: (mirabuf.Transform.$Properties|null);

            /** Joints that interact with this element */
            joints?: (string[]|null);

            /** PartInstance appearance */
            appearance?: (string|null);

            /** Physical Material Reference to link to `Materials->PhysicalMaterial->Info->id` */
            physicalMaterial?: (string|null);

            /** Flag that if enabled indicates we should skip generating a collider, defaults to FALSE or undefined */
            skipCollider?: (boolean|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a PartInstance. */
        type $Shape = mirabuf.PartInstance.$Properties;
    }

    /**
     * Properties of a Body.
     * @deprecated Use mirabuf.Body.$Properties instead.
     */
    interface IBody extends mirabuf.Body.$Properties {
    }

    /** Represents a Body. */
    class Body {

        /**
         * Constructs a new Body.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Body.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Body info. */
        info?: (mirabuf.Info.$Properties|null);

        /** Reference to Part Definition */
        part: string;

        /** Triangle Mesh for rendering */
        triangleMesh?: (mirabuf.TriangleMesh.$Properties|null);

        /** Override Visual Appearance for the body */
        appearanceOverride: string;

        /**
         * Encodes the specified Body message. Does not implicitly {@link mirabuf.Body.verify|verify} messages.
         * @param message Body message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Body.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Body message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Body & mirabuf.Body.$Shape} Body
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Body & mirabuf.Body.$Shape;

        /**
         * Gets the type url for Body
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Body {

        /** Properties of a Body. */
        interface $Properties {

            /** Body info */
            info?: (mirabuf.Info.$Properties|null);

            /** Reference to Part Definition */
            part?: (string|null);

            /** Triangle Mesh for rendering */
            triangleMesh?: (mirabuf.TriangleMesh.$Properties|null);

            /** Override Visual Appearance for the body */
            appearanceOverride?: (string|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Body. */
        type $Shape = {
          info?: mirabuf.Info.$Shape|null;
          part?: string|null;
          triangleMesh?: mirabuf.TriangleMesh.$Shape|null;
          appearanceOverride?: string|null;
          $unknowns?: Uint8Array[];
        };
    }

    /**
     * Properties of a TriangleMesh.
     * @deprecated Use mirabuf.TriangleMesh.$Properties instead.
     */
    interface ITriangleMesh extends mirabuf.TriangleMesh.$Properties {
    }

    /** Traingle Mesh for Storing Display Mesh data */
    class TriangleMesh {

        /**
         * Constructs a new TriangleMesh.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.TriangleMesh.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** TriangleMesh info. */
        info?: (mirabuf.Info.$Properties|null);

        /** Is this object a Plane ? (Does it have volume) */
        hasVolume: boolean;

        /** Rendered Appearance properties referenced from Assembly Data */
        materialReference: string;

        /** Stored as true types, inidicies, verts, uv */
        mesh?: (mirabuf.Mesh.$Properties|null);

        /** Stored as binary data in bytes */
        bmesh?: (mirabuf.BinaryMesh.$Properties|null);

        /** What kind of Mesh Data exists in this Triangle Mesh */
        meshType?: ("mesh"|"bmesh");

        /**
         * Encodes the specified TriangleMesh message. Does not implicitly {@link mirabuf.TriangleMesh.verify|verify} messages.
         * @param message TriangleMesh message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.TriangleMesh.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TriangleMesh message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.TriangleMesh & mirabuf.TriangleMesh.$Shape} TriangleMesh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.TriangleMesh & mirabuf.TriangleMesh.$Shape;

        /**
         * Gets the type url for TriangleMesh
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace TriangleMesh {

        /** Properties of a TriangleMesh. */
        interface $Properties {

            /** TriangleMesh info */
            info?: (mirabuf.Info.$Properties|null);

            /** Is this object a Plane ? (Does it have volume) */
            hasVolume?: (boolean|null);

            /** Rendered Appearance properties referenced from Assembly Data */
            materialReference?: (string|null);

            /** Stored as true types, inidicies, verts, uv */
            mesh?: (mirabuf.Mesh.$Properties|null);

            /** Stored as binary data in bytes */
            bmesh?: (mirabuf.BinaryMesh.$Properties|null);

            /** What kind of Mesh Data exists in this Triangle Mesh */
            meshType?: ("mesh"|"bmesh");

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Narrowed shape of a TriangleMesh. */
        type $Shape = {
          info?: mirabuf.Info.$Shape|null;
          hasVolume?: boolean|null;
          materialReference?: string|null;
          mesh?: mirabuf.Mesh.$Shape|null;
          bmesh?: mirabuf.BinaryMesh.$Shape|null;
          $unknowns?: Uint8Array[];
        } & (
          ({ meshType?: undefined; mesh?: null; bmesh?: null }|{ meshType?: "mesh"; mesh: mirabuf.Mesh.$Shape; bmesh?: null }|{ meshType?: "bmesh"; mesh?: null; bmesh: mirabuf.BinaryMesh.$Shape })
        );
    }

    /**
     * Properties of a Mesh.
     * @deprecated Use mirabuf.Mesh.$Properties instead.
     */
    interface IMesh extends mirabuf.Mesh.$Properties {
    }

    /** Mesh Data stored as generic Data Structure */
    class Mesh {

        /**
         * Constructs a new Mesh.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Mesh.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Tri Mesh Verts vec3 */
        verts: number[];

        /** Tri Mesh Normals vec3 */
        normals: number[];

        /** Tri Mesh uv Mapping vec2 */
        uv: number[];

        /** Tri Mesh indicies (Vert Map) */
        indices: number[];

        /**
         * Encodes the specified Mesh message. Does not implicitly {@link mirabuf.Mesh.verify|verify} messages.
         * @param message Mesh message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Mesh.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Mesh message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Mesh & mirabuf.Mesh.$Shape} Mesh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Mesh & mirabuf.Mesh.$Shape;

        /**
         * Gets the type url for Mesh
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Mesh {

        /** Properties of a Mesh. */
        interface $Properties {

            /** Tri Mesh Verts vec3 */
            verts?: (number[]|null);

            /** Tri Mesh Normals vec3 */
            normals?: (number[]|null);

            /** Tri Mesh uv Mapping vec2 */
            uv?: (number[]|null);

            /** Tri Mesh indicies (Vert Map) */
            indices?: (number[]|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Mesh. */
        type $Shape = mirabuf.Mesh.$Properties;
    }

    /**
     * Properties of a BinaryMesh.
     * @deprecated Use mirabuf.BinaryMesh.$Properties instead.
     */
    interface IBinaryMesh extends mirabuf.BinaryMesh.$Properties {
    }

    /** Mesh used for more effective file transfers */
    class BinaryMesh {

        /**
         * Constructs a new BinaryMesh.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.BinaryMesh.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** BEWARE of ENDIANESS */
        data: Uint8Array;

        /**
         * Encodes the specified BinaryMesh message. Does not implicitly {@link mirabuf.BinaryMesh.verify|verify} messages.
         * @param message BinaryMesh message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.BinaryMesh.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BinaryMesh message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.BinaryMesh & mirabuf.BinaryMesh.$Shape} BinaryMesh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.BinaryMesh & mirabuf.BinaryMesh.$Shape;

        /**
         * Gets the type url for BinaryMesh
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace BinaryMesh {

        /** Properties of a BinaryMesh. */
        interface $Properties {

            /** BEWARE of ENDIANESS */
            data?: (Uint8Array|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a BinaryMesh. */
        type $Shape = mirabuf.BinaryMesh.$Properties;
    }

    /**
     * Properties of a Node.
     * @deprecated Use mirabuf.Node.$Properties instead.
     */
    interface INode extends mirabuf.Node.$Properties {
    }

    /** Represents a Node. */
    class Node {

        /**
         * Constructs a new Node.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Node.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** the reference ID for whatever kind of graph this is */
        value: string;

        /** the children for the given leaf */
        children: mirabuf.Node.$Properties[];

        /** other associated data that can be used */
        userData?: (mirabuf.UserData.$Properties|null);

        /**
         * Encodes the specified Node message. Does not implicitly {@link mirabuf.Node.verify|verify} messages.
         * @param message Node message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Node.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Node message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Node & mirabuf.Node.$Shape} Node
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Node & mirabuf.Node.$Shape;

        /**
         * Gets the type url for Node
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Node {

        /** Properties of a Node. */
        interface $Properties {

            /** the reference ID for whatever kind of graph this is */
            value?: (string|null);

            /** the children for the given leaf */
            children?: (mirabuf.Node.$Properties[]|null);

            /** other associated data that can be used */
            userData?: (mirabuf.UserData.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Node. */
        type $Shape = mirabuf.Node.$Properties;
    }

    /**
     * Properties of a GraphContainer.
     * @deprecated Use mirabuf.GraphContainer.$Properties instead.
     */
    interface IGraphContainer extends mirabuf.GraphContainer.$Properties {
    }

    /** Represents a GraphContainer. */
    class GraphContainer {

        /**
         * Constructs a new GraphContainer.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.GraphContainer.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** GraphContainer nodes. */
        nodes: mirabuf.Node.$Properties[];

        /**
         * Encodes the specified GraphContainer message. Does not implicitly {@link mirabuf.GraphContainer.verify|verify} messages.
         * @param message GraphContainer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.GraphContainer.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GraphContainer message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.GraphContainer & mirabuf.GraphContainer.$Shape} GraphContainer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.GraphContainer & mirabuf.GraphContainer.$Shape;

        /**
         * Gets the type url for GraphContainer
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace GraphContainer {

        /** Properties of a GraphContainer. */
        interface $Properties {

            /** GraphContainer nodes */
            nodes?: (mirabuf.Node.$Properties[]|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a GraphContainer. */
        type $Shape = mirabuf.GraphContainer.$Properties;
    }

    /**
     * Properties of a UserData.
     * @deprecated Use mirabuf.UserData.$Properties instead.
     */
    interface IUserData extends mirabuf.UserData.$Properties {
    }

    /**
     * UserData
     *
     * Arbitrary data to append to a given message in map form
     */
    class UserData {

        /**
         * Constructs a new UserData.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.UserData.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** e.g. data["wheel"] = "yes" */
        data: { [k: string]: string };

        /**
         * Encodes the specified UserData message. Does not implicitly {@link mirabuf.UserData.verify|verify} messages.
         * @param message UserData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.UserData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UserData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.UserData & mirabuf.UserData.$Shape} UserData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.UserData & mirabuf.UserData.$Shape;

        /**
         * Gets the type url for UserData
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace UserData {

        /** Properties of a UserData. */
        interface $Properties {

            /** e.g. data["wheel"] = "yes" */
            data?: ({ [k: string]: string }|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a UserData. */
        type $Shape = mirabuf.UserData.$Properties;
    }

    /**
     * Properties of a Vector3.
     * @deprecated Use mirabuf.Vector3.$Properties instead.
     */
    interface IVector3 extends mirabuf.Vector3.$Properties {
    }

    /** Represents a Vector3. */
    class Vector3 {

        /**
         * Constructs a new Vector3.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Vector3.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Vector3 x. */
        x: number;

        /** Vector3 y. */
        y: number;

        /** Vector3 z. */
        z: number;

        /**
         * Encodes the specified Vector3 message. Does not implicitly {@link mirabuf.Vector3.verify|verify} messages.
         * @param message Vector3 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Vector3.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Vector3 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Vector3 & mirabuf.Vector3.$Shape} Vector3
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Vector3 & mirabuf.Vector3.$Shape;

        /**
         * Gets the type url for Vector3
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Vector3 {

        /** Properties of a Vector3. */
        interface $Properties {

            /** Vector3 x */
            x?: (number|null);

            /** Vector3 y */
            y?: (number|null);

            /** Vector3 z */
            z?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Vector3. */
        type $Shape = mirabuf.Vector3.$Properties;
    }

    /**
     * Properties of a PhysicalProperties.
     * @deprecated Use mirabuf.PhysicalProperties.$Properties instead.
     */
    interface IPhysicalProperties extends mirabuf.PhysicalProperties.$Properties {
    }

    /** Represents a PhysicalProperties. */
    class PhysicalProperties {

        /**
         * Constructs a new PhysicalProperties.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.PhysicalProperties.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** kg per cubic cm kg/(cm^3) */
        density: number;

        /** kg */
        mass: number;

        /** cm^3 */
        volume: number;

        /** cm^2 */
        area: number;

        /** non-negative? Vec3 */
        com?: (mirabuf.Vector3.$Properties|null);

        /**
         * Encodes the specified PhysicalProperties message. Does not implicitly {@link mirabuf.PhysicalProperties.verify|verify} messages.
         * @param message PhysicalProperties message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.PhysicalProperties.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PhysicalProperties message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.PhysicalProperties & mirabuf.PhysicalProperties.$Shape} PhysicalProperties
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.PhysicalProperties & mirabuf.PhysicalProperties.$Shape;

        /**
         * Gets the type url for PhysicalProperties
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace PhysicalProperties {

        /** Properties of a PhysicalProperties. */
        interface $Properties {

            /** kg per cubic cm kg/(cm^3) */
            density?: (number|null);

            /** kg */
            mass?: (number|null);

            /** cm^3 */
            volume?: (number|null);

            /** cm^2 */
            area?: (number|null);

            /** non-negative? Vec3 */
            com?: (mirabuf.Vector3.$Properties|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a PhysicalProperties. */
        type $Shape = mirabuf.PhysicalProperties.$Properties;
    }

    /**
     * Properties of a Transform.
     * @deprecated Use mirabuf.Transform.$Properties instead.
     */
    interface ITransform extends mirabuf.Transform.$Properties {
    }

    /**
     * Transform
     *
     * Data needed to apply scale, position, and rotational changes
     */
    class Transform {

        /**
         * Constructs a new Transform.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Transform.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Transform spatialMatrix. */
        spatialMatrix: number[];

        /**
         * Encodes the specified Transform message. Does not implicitly {@link mirabuf.Transform.verify|verify} messages.
         * @param message Transform message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Transform.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transform message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Transform & mirabuf.Transform.$Shape} Transform
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Transform & mirabuf.Transform.$Shape;

        /**
         * Gets the type url for Transform
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Transform {

        /** Properties of a Transform. */
        interface $Properties {

            /** Transform spatialMatrix */
            spatialMatrix?: (number[]|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Transform. */
        type $Shape = mirabuf.Transform.$Properties;
    }

    /**
     * Properties of a Color.
     * @deprecated Use mirabuf.Color.$Properties instead.
     */
    interface IColor extends mirabuf.Color.$Properties {
    }

    /** Represents a Color. */
    class Color {

        /**
         * Constructs a new Color.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Color.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Color R. */
        R: number;

        /** Color G. */
        G: number;

        /** Color B. */
        B: number;

        /** Color A. */
        A: number;

        /**
         * Encodes the specified Color message. Does not implicitly {@link mirabuf.Color.verify|verify} messages.
         * @param message Color message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Color.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Color message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Color & mirabuf.Color.$Shape} Color
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Color & mirabuf.Color.$Shape;

        /**
         * Gets the type url for Color
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Color {

        /** Properties of a Color. */
        interface $Properties {

            /** Color R */
            R?: (number|null);

            /** Color G */
            G?: (number|null);

            /** Color B */
            B?: (number|null);

            /** Color A */
            A?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Color. */
        type $Shape = mirabuf.Color.$Properties;
    }

    /** Axis enum. */
    enum Axis {

        /** X value */
        X = 0,

        /** Y value */
        Y = 1,

        /** Z value */
        Z = 2
    }

    /**
     * Properties of an Info.
     * @deprecated Use mirabuf.Info.$Properties instead.
     */
    interface IInfo extends mirabuf.Info.$Properties {
    }

    /**
     * Defines basic fields for almost all objects
     * The location where you can access the GUID for a reference
     */
    class Info {

        /**
         * Constructs a new Info.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Info.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Info GUID. */
        GUID: string;

        /** Info name. */
        name: string;

        /** Info version. */
        version: number;

        /**
         * Encodes the specified Info message. Does not implicitly {@link mirabuf.Info.verify|verify} messages.
         * @param message Info message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Info.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Info message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Info & mirabuf.Info.$Shape} Info
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Info & mirabuf.Info.$Shape;

        /**
         * Gets the type url for Info
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Info {

        /** Properties of an Info. */
        interface $Properties {

            /** Info GUID */
            GUID?: (string|null);

            /** Info name */
            name?: (string|null);

            /** Info version */
            version?: (number|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an Info. */
        type $Shape = mirabuf.Info.$Properties;
    }

    /**
     * Properties of a Thumbnail.
     * @deprecated Use mirabuf.Thumbnail.$Properties instead.
     */
    interface IThumbnail extends mirabuf.Thumbnail.$Properties {
    }

    /**
     * A basic Thumbnail to be encoded in the file
     * Most of the Time Fusion can encode the file with transparency as PNG not bitmap
     */
    class Thumbnail {

        /**
         * Constructs a new Thumbnail.
         * @param [properties] Properties to set
         */
        constructor(properties?: mirabuf.Thumbnail.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Image Width */
        width: number;

        /** Image Height */
        height: number;

        /** Image Extension - ex. (.png, .bitmap, .jpeg) */
        extension: string;

        /** Transparency - true from fusion when correctly configured */
        transparent: boolean;

        /** Data as read from the file in bytes[] form */
        data: Uint8Array;

        /**
         * Encodes the specified Thumbnail message. Does not implicitly {@link mirabuf.Thumbnail.verify|verify} messages.
         * @param message Thumbnail message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: mirabuf.Thumbnail.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Thumbnail message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {mirabuf.Thumbnail & mirabuf.Thumbnail.$Shape} Thumbnail
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.Thumbnail & mirabuf.Thumbnail.$Shape;

        /**
         * Gets the type url for Thumbnail
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Thumbnail {

        /** Properties of a Thumbnail. */
        interface $Properties {

            /** Image Width */
            width?: (number|null);

            /** Image Height */
            height?: (number|null);

            /** Image Extension - ex. (.png, .bitmap, .jpeg) */
            extension?: (string|null);

            /** Transparency - true from fusion when correctly configured */
            transparent?: (boolean|null);

            /** Data as read from the file in bytes[] form */
            data?: (Uint8Array|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Thumbnail. */
        type $Shape = mirabuf.Thumbnail.$Properties;
    }

    /** Namespace joint. */
    namespace joint {

        /**
         * Properties of a Joints.
         * @deprecated Use mirabuf.joint.Joints.$Properties instead.
         */
        interface IJoints extends mirabuf.joint.Joints.$Properties {
        }

        /**
         * Joints
         * A way to define the motion between various group connections
         */
        class Joints {

            /**
             * Constructs a new Joints.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.Joints.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** name, version, uid */
            info?: (mirabuf.Info.$Properties|null);

            /** Unique Joint Implementations */
            jointDefinitions: { [k: string]: mirabuf.joint.Joint.$Properties };

            /** Instances of the Joint Implementations */
            jointInstances: { [k: string]: mirabuf.joint.JointInstance.$Properties };

            /** Rigidgroups ? */
            rigidGroups: mirabuf.joint.RigidGroup.$Properties[];

            /** Collection of all Motors exported */
            motorDefinitions: { [k: string]: mirabuf.motor.Motor.$Properties };

            /**
             * Encodes the specified Joints message. Does not implicitly {@link mirabuf.joint.Joints.verify|verify} messages.
             * @param message Joints message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.Joints.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Joints message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.Joints & mirabuf.joint.Joints.$Shape} Joints
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.Joints & mirabuf.joint.Joints.$Shape;

            /**
             * Gets the type url for Joints
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Joints {

            /** Properties of a Joints. */
            interface $Properties {

                /** name, version, uid */
                info?: (mirabuf.Info.$Properties|null);

                /** Unique Joint Implementations */
                jointDefinitions?: ({ [k: string]: mirabuf.joint.Joint.$Properties }|null);

                /** Instances of the Joint Implementations */
                jointInstances?: ({ [k: string]: mirabuf.joint.JointInstance.$Properties }|null);

                /** Rigidgroups ? */
                rigidGroups?: (mirabuf.joint.RigidGroup.$Properties[]|null);

                /** Collection of all Motors exported */
                motorDefinitions?: ({ [k: string]: mirabuf.motor.Motor.$Properties }|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Joints. */
            type $Shape = {
              info?: mirabuf.Info.$Shape|null;
              jointDefinitions?: { [k: string]: mirabuf.joint.Joint.$Shape }|null;
              jointInstances?: { [k: string]: mirabuf.joint.JointInstance.$Shape }|null;
              rigidGroups?: mirabuf.joint.RigidGroup.$Shape[]|null;
              motorDefinitions?: { [k: string]: mirabuf.motor.Motor.$Shape }|null;
              $unknowns?: Uint8Array[];
            };
        }

        /** JointMotion enum. */
        enum JointMotion {

            /** RIGID value */
            RIGID = 0,

            /** REVOLUTE value */
            REVOLUTE = 1,

            /** SLIDER value */
            SLIDER = 2,

            /** CYLINDRICAL value */
            CYLINDRICAL = 3,

            /** PINSLOT value */
            PINSLOT = 4,

            /** PLANAR value */
            PLANAR = 5,

            /** BALL value */
            BALL = 6,

            /** CUSTOM value */
            CUSTOM = 7
        }

        /**
         * Properties of a JointInstance.
         * @deprecated Use mirabuf.joint.JointInstance.$Properties instead.
         */
        interface IJointInstance extends mirabuf.joint.JointInstance.$Properties {
        }

        /**
         * Instance of a Joint that has a defined motion and limits.
         * Instancing helps with identifiy closed loop systems.
         */
        class JointInstance {

            /**
             * Constructs a new JointInstance.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.JointInstance.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** JointInstance info. */
            info?: (mirabuf.Info.$Properties|null);

            /** JointInstance isEndEffector. */
            isEndEffector: boolean;

            /** JointInstance parentPart. */
            parentPart: string;

            /** JointInstance childPart. */
            childPart: string;

            /** JointInstance jointReference. */
            jointReference: string;

            /** JointInstance offset. */
            offset?: (mirabuf.Vector3.$Properties|null);

            /** JointInstance parts. */
            parts?: (mirabuf.GraphContainer.$Properties|null);

            /** JointInstance signalReference. */
            signalReference: string;

            /** JointInstance motionLink. */
            motionLink: mirabuf.joint.MotionLink.$Properties[];

            /**
             * Encodes the specified JointInstance message. Does not implicitly {@link mirabuf.joint.JointInstance.verify|verify} messages.
             * @param message JointInstance message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.JointInstance.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JointInstance message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.JointInstance & mirabuf.joint.JointInstance.$Shape} JointInstance
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.JointInstance & mirabuf.joint.JointInstance.$Shape;

            /**
             * Gets the type url for JointInstance
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace JointInstance {

            /** Properties of a JointInstance. */
            interface $Properties {

                /** JointInstance info */
                info?: (mirabuf.Info.$Properties|null);

                /** JointInstance isEndEffector */
                isEndEffector?: (boolean|null);

                /** JointInstance parentPart */
                parentPart?: (string|null);

                /** JointInstance childPart */
                childPart?: (string|null);

                /** JointInstance jointReference */
                jointReference?: (string|null);

                /** JointInstance offset */
                offset?: (mirabuf.Vector3.$Properties|null);

                /** JointInstance parts */
                parts?: (mirabuf.GraphContainer.$Properties|null);

                /** JointInstance signalReference */
                signalReference?: (string|null);

                /** JointInstance motionLink */
                motionLink?: (mirabuf.joint.MotionLink.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a JointInstance. */
            type $Shape = mirabuf.joint.JointInstance.$Properties;
        }

        /**
         * Properties of a MotionLink.
         * @deprecated Use mirabuf.joint.MotionLink.$Properties instead.
         */
        interface IMotionLink extends mirabuf.joint.MotionLink.$Properties {
        }

        /**
         * Motion Link Feature
         * Enables the restriction on a joint to a certain range of motion as it is relative to another joint
         * This is useful for moving parts restricted by belts and gears
         */
        class MotionLink {

            /**
             * Constructs a new MotionLink.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.MotionLink.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** MotionLink jointInstance. */
            jointInstance: string;

            /** MotionLink ratio. */
            ratio: number;

            /** MotionLink reversed. */
            reversed: boolean;

            /**
             * Encodes the specified MotionLink message. Does not implicitly {@link mirabuf.joint.MotionLink.verify|verify} messages.
             * @param message MotionLink message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.MotionLink.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MotionLink message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.MotionLink & mirabuf.joint.MotionLink.$Shape} MotionLink
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.MotionLink & mirabuf.joint.MotionLink.$Shape;

            /**
             * Gets the type url for MotionLink
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace MotionLink {

            /** Properties of a MotionLink. */
            interface $Properties {

                /** MotionLink jointInstance */
                jointInstance?: (string|null);

                /** MotionLink ratio */
                ratio?: (number|null);

                /** MotionLink reversed */
                reversed?: (boolean|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a MotionLink. */
            type $Shape = mirabuf.joint.MotionLink.$Properties;
        }

        /**
         * Properties of a Joint.
         * @deprecated Use mirabuf.joint.Joint.$Properties instead.
         */
        interface IJoint extends mirabuf.joint.Joint.$Properties {
        }

        /**
         * A unqiue implementation of a joint motion
         * Contains information about motion but not assembly relation
         * NOTE: A spring motion is a joint with no driver
         */
        class Joint {

            /**
             * Constructs a new Joint.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.Joint.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Joint name, ID, version, etc */
            info?: (mirabuf.Info.$Properties|null);

            /** Joint origin. */
            origin?: (mirabuf.Vector3.$Properties|null);

            /** Joint jointMotionType. */
            jointMotionType: mirabuf.joint.JointMotion;

            /** Joint breakMagnitude. */
            breakMagnitude: number;

            /** ONEOF rotational joint */
            rotational?: (mirabuf.joint.RotationalJoint.$Properties|null);

            /** ONEOF prismatic joint */
            prismatic?: (mirabuf.joint.PrismaticJoint.$Properties|null);

            /** ONEOF custom joint */
            custom?: (mirabuf.joint.CustomJoint.$Properties|null);

            /** Additional information someone can query or store relative to your joint. */
            userData?: (mirabuf.UserData.$Properties|null);

            /** Motor definition reference to lookup in joints collection */
            motorReference: string;

            /** Joint JointMotion. */
            JointMotion?: ("rotational"|"prismatic"|"custom");

            /**
             * Encodes the specified Joint message. Does not implicitly {@link mirabuf.joint.Joint.verify|verify} messages.
             * @param message Joint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.Joint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Joint message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.Joint & mirabuf.joint.Joint.$Shape} Joint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.Joint & mirabuf.joint.Joint.$Shape;

            /**
             * Gets the type url for Joint
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Joint {

            /** Properties of a Joint. */
            interface $Properties {

                /** Joint name, ID, version, etc */
                info?: (mirabuf.Info.$Properties|null);

                /** Joint origin */
                origin?: (mirabuf.Vector3.$Properties|null);

                /** Joint jointMotionType */
                jointMotionType?: (mirabuf.joint.JointMotion|null);

                /** Joint breakMagnitude */
                breakMagnitude?: (number|null);

                /** ONEOF rotational joint */
                rotational?: (mirabuf.joint.RotationalJoint.$Properties|null);

                /** ONEOF prismatic joint */
                prismatic?: (mirabuf.joint.PrismaticJoint.$Properties|null);

                /** ONEOF custom joint */
                custom?: (mirabuf.joint.CustomJoint.$Properties|null);

                /** Additional information someone can query or store relative to your joint. */
                userData?: (mirabuf.UserData.$Properties|null);

                /** Motor definition reference to lookup in joints collection */
                motorReference?: (string|null);

                /** Joint JointMotion */
                JointMotion?: ("rotational"|"prismatic"|"custom");

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Narrowed shape of a Joint. */
            type $Shape = {
              info?: mirabuf.Info.$Shape|null;
              origin?: mirabuf.Vector3.$Shape|null;
              jointMotionType?: mirabuf.joint.JointMotion|null;
              breakMagnitude?: number|null;
              rotational?: mirabuf.joint.RotationalJoint.$Shape|null;
              prismatic?: mirabuf.joint.PrismaticJoint.$Shape|null;
              custom?: mirabuf.joint.CustomJoint.$Shape|null;
              userData?: mirabuf.UserData.$Shape|null;
              motorReference?: string|null;
              $unknowns?: Uint8Array[];
            } & (
              ({ JointMotion?: undefined; rotational?: null; prismatic?: null; custom?: null }|{ JointMotion?: "rotational"; rotational: mirabuf.joint.RotationalJoint.$Shape; prismatic?: null; custom?: null }|{ JointMotion?: "prismatic"; rotational?: null; prismatic: mirabuf.joint.PrismaticJoint.$Shape; custom?: null }|{ JointMotion?: "custom"; rotational?: null; prismatic?: null; custom: mirabuf.joint.CustomJoint.$Shape })
            );
        }

        /**
         * Properties of a Dynamics.
         * @deprecated Use mirabuf.joint.Dynamics.$Properties instead.
         */
        interface IDynamics extends mirabuf.joint.Dynamics.$Properties {
        }

        /** Dynamics specify the mechanical effects on the motion. */
        class Dynamics {

            /**
             * Constructs a new Dynamics.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.Dynamics.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Damping effect on a given joint motion */
            damping: number;

            /** Friction effect on a given joint motion */
            friction: number;

            /**
             * Encodes the specified Dynamics message. Does not implicitly {@link mirabuf.joint.Dynamics.verify|verify} messages.
             * @param message Dynamics message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.Dynamics.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Dynamics message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.Dynamics & mirabuf.joint.Dynamics.$Shape} Dynamics
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.Dynamics & mirabuf.joint.Dynamics.$Shape;

            /**
             * Gets the type url for Dynamics
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Dynamics {

            /** Properties of a Dynamics. */
            interface $Properties {

                /** Damping effect on a given joint motion */
                damping?: (number|null);

                /** Friction effect on a given joint motion */
                friction?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Dynamics. */
            type $Shape = mirabuf.joint.Dynamics.$Properties;
        }

        /**
         * Properties of a Limits.
         * @deprecated Use mirabuf.joint.Limits.$Properties instead.
         */
        interface ILimits extends mirabuf.joint.Limits.$Properties {
        }

        /**
         * Limits specify the mechanical range of a given joint.
         *
         * TODO: Add units
         */
        class Limits {

            /**
             * Constructs a new Limits.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.Limits.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Lower Limit corresponds to default displacement */
            lower: number;

            /** Upper Limit is the joint extent */
            upper: number;

            /** Velocity Max in m/s^2 (angular for rotational) */
            velocity: number;

            /** Effort is the absolute force a joint can apply for a given instant - ROS has a great article on it http://wiki.ros.org/pr2_controller_manager/safety_limits */
            effort: number;

            /**
             * Encodes the specified Limits message. Does not implicitly {@link mirabuf.joint.Limits.verify|verify} messages.
             * @param message Limits message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.Limits.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Limits message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.Limits & mirabuf.joint.Limits.$Shape} Limits
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.Limits & mirabuf.joint.Limits.$Shape;

            /**
             * Gets the type url for Limits
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Limits {

            /** Properties of a Limits. */
            interface $Properties {

                /** Lower Limit corresponds to default displacement */
                lower?: (number|null);

                /** Upper Limit is the joint extent */
                upper?: (number|null);

                /** Velocity Max in m/s^2 (angular for rotational) */
                velocity?: (number|null);

                /** Effort is the absolute force a joint can apply for a given instant - ROS has a great article on it http://wiki.ros.org/pr2_controller_manager/safety_limits */
                effort?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Limits. */
            type $Shape = mirabuf.joint.Limits.$Properties;
        }

        /**
         * Properties of a Safety.
         * @deprecated Use mirabuf.joint.Safety.$Properties instead.
         */
        interface ISafety extends mirabuf.joint.Safety.$Properties {
        }

        /**
         * Safety switch configuration for a given joint.
         * Can usefully indicate a bounds issue.
         * Inspired by the URDF implementation.
         *
         * This should really just be created by the controller.
         * http://wiki.ros.org/pr2_controller_manager/safety_limits
         */
        class Safety {

            /**
             * Constructs a new Safety.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.Safety.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Lower software limit */
            lowerLimit: number;

            /** Upper Software limit */
            upperLimit: number;

            /** Relation between position and velocity limit */
            kPosition: number;

            /** Relation between effort and velocity limit */
            kVelocity: number;

            /**
             * Encodes the specified Safety message. Does not implicitly {@link mirabuf.joint.Safety.verify|verify} messages.
             * @param message Safety message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.Safety.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Safety message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.Safety & mirabuf.joint.Safety.$Shape} Safety
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.Safety & mirabuf.joint.Safety.$Shape;

            /**
             * Gets the type url for Safety
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Safety {

            /** Properties of a Safety. */
            interface $Properties {

                /** Lower software limit */
                lowerLimit?: (number|null);

                /** Upper Software limit */
                upperLimit?: (number|null);

                /** Relation between position and velocity limit */
                kPosition?: (number|null);

                /** Relation between effort and velocity limit */
                kVelocity?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Safety. */
            type $Shape = mirabuf.joint.Safety.$Properties;
        }

        /**
         * Properties of a DOF.
         * @deprecated Use mirabuf.joint.DOF.$Properties instead.
         */
        interface IDOF extends mirabuf.joint.DOF.$Properties {
        }

        /** DOF - representing the construction of a joint motion */
        class DOF {

            /**
             * Constructs a new DOF.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.DOF.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** In case you want to name this degree of freedom */
            name: string;

            /** Axis the degree of freedom is pivoting by */
            axis?: (mirabuf.Vector3.$Properties|null);

            /** Direction the axis vector is offset from - this has an incorrect naming scheme */
            pivotDirection: mirabuf.Axis;

            /** Dynamic properties of this joint pivot */
            dynamics?: (mirabuf.joint.Dynamics.$Properties|null);

            /** Limits of this freedom */
            limits?: (mirabuf.joint.Limits.$Properties|null);

            /** Current value of the DOF */
            value: number;

            /**
             * Encodes the specified DOF message. Does not implicitly {@link mirabuf.joint.DOF.verify|verify} messages.
             * @param message DOF message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.DOF.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DOF message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.DOF & mirabuf.joint.DOF.$Shape} DOF
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.DOF & mirabuf.joint.DOF.$Shape;

            /**
             * Gets the type url for DOF
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace DOF {

            /** Properties of a DOF. */
            interface $Properties {

                /** In case you want to name this degree of freedom */
                name?: (string|null);

                /** Axis the degree of freedom is pivoting by */
                axis?: (mirabuf.Vector3.$Properties|null);

                /** Direction the axis vector is offset from - this has an incorrect naming scheme */
                pivotDirection?: (mirabuf.Axis|null);

                /** Dynamic properties of this joint pivot */
                dynamics?: (mirabuf.joint.Dynamics.$Properties|null);

                /** Limits of this freedom */
                limits?: (mirabuf.joint.Limits.$Properties|null);

                /** Current value of the DOF */
                value?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a DOF. */
            type $Shape = mirabuf.joint.DOF.$Properties;
        }

        /**
         * Properties of a CustomJoint.
         * @deprecated Use mirabuf.joint.CustomJoint.$Properties instead.
         */
        interface ICustomJoint extends mirabuf.joint.CustomJoint.$Properties {
        }

        /**
         * CustomJoint is a joint with N degrees of freedom specified.
         * There should be input validation to handle max freedom case.
         */
        class CustomJoint {

            /**
             * Constructs a new CustomJoint.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.CustomJoint.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** A list of degrees of freedom that the joint can contain */
            dofs: mirabuf.joint.DOF.$Properties[];

            /**
             * Encodes the specified CustomJoint message. Does not implicitly {@link mirabuf.joint.CustomJoint.verify|verify} messages.
             * @param message CustomJoint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.CustomJoint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CustomJoint message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.CustomJoint & mirabuf.joint.CustomJoint.$Shape} CustomJoint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.CustomJoint & mirabuf.joint.CustomJoint.$Shape;

            /**
             * Gets the type url for CustomJoint
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace CustomJoint {

            /** Properties of a CustomJoint. */
            interface $Properties {

                /** A list of degrees of freedom that the joint can contain */
                dofs?: (mirabuf.joint.DOF.$Properties[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a CustomJoint. */
            type $Shape = mirabuf.joint.CustomJoint.$Properties;
        }

        /**
         * Properties of a RotationalJoint.
         * @deprecated Use mirabuf.joint.RotationalJoint.$Properties instead.
         */
        interface IRotationalJoint extends mirabuf.joint.RotationalJoint.$Properties {
        }

        /**
         * RotationalJoint describes a joint with rotational translation.
         * This is the exact same as prismatic for now.
         */
        class RotationalJoint {

            /**
             * Constructs a new RotationalJoint.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.RotationalJoint.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** RotationalJoint rotationalFreedom. */
            rotationalFreedom?: (mirabuf.joint.DOF.$Properties|null);

            /**
             * Encodes the specified RotationalJoint message. Does not implicitly {@link mirabuf.joint.RotationalJoint.verify|verify} messages.
             * @param message RotationalJoint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.RotationalJoint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RotationalJoint message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.RotationalJoint & mirabuf.joint.RotationalJoint.$Shape} RotationalJoint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.RotationalJoint & mirabuf.joint.RotationalJoint.$Shape;

            /**
             * Gets the type url for RotationalJoint
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace RotationalJoint {

            /** Properties of a RotationalJoint. */
            interface $Properties {

                /** RotationalJoint rotationalFreedom */
                rotationalFreedom?: (mirabuf.joint.DOF.$Properties|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a RotationalJoint. */
            type $Shape = mirabuf.joint.RotationalJoint.$Properties;
        }

        /**
         * Properties of a BallJoint.
         * @deprecated Use mirabuf.joint.BallJoint.$Properties instead.
         */
        interface IBallJoint extends mirabuf.joint.BallJoint.$Properties {
        }

        /** Represents a BallJoint. */
        class BallJoint {

            /**
             * Constructs a new BallJoint.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.BallJoint.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** BallJoint yaw. */
            yaw?: (mirabuf.joint.DOF.$Properties|null);

            /** BallJoint pitch. */
            pitch?: (mirabuf.joint.DOF.$Properties|null);

            /** BallJoint rotation. */
            rotation?: (mirabuf.joint.DOF.$Properties|null);

            /**
             * Encodes the specified BallJoint message. Does not implicitly {@link mirabuf.joint.BallJoint.verify|verify} messages.
             * @param message BallJoint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.BallJoint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BallJoint message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.BallJoint & mirabuf.joint.BallJoint.$Shape} BallJoint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.BallJoint & mirabuf.joint.BallJoint.$Shape;

            /**
             * Gets the type url for BallJoint
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace BallJoint {

            /** Properties of a BallJoint. */
            interface $Properties {

                /** BallJoint yaw */
                yaw?: (mirabuf.joint.DOF.$Properties|null);

                /** BallJoint pitch */
                pitch?: (mirabuf.joint.DOF.$Properties|null);

                /** BallJoint rotation */
                rotation?: (mirabuf.joint.DOF.$Properties|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a BallJoint. */
            type $Shape = mirabuf.joint.BallJoint.$Properties;
        }

        /**
         * Properties of a PrismaticJoint.
         * @deprecated Use mirabuf.joint.PrismaticJoint.$Properties instead.
         */
        interface IPrismaticJoint extends mirabuf.joint.PrismaticJoint.$Properties {
        }

        /** Prismatic Joint describes a motion that translates the position in a single axis */
        class PrismaticJoint {

            /**
             * Constructs a new PrismaticJoint.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.PrismaticJoint.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** PrismaticJoint prismaticFreedom. */
            prismaticFreedom?: (mirabuf.joint.DOF.$Properties|null);

            /**
             * Encodes the specified PrismaticJoint message. Does not implicitly {@link mirabuf.joint.PrismaticJoint.verify|verify} messages.
             * @param message PrismaticJoint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.PrismaticJoint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PrismaticJoint message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.PrismaticJoint & mirabuf.joint.PrismaticJoint.$Shape} PrismaticJoint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.PrismaticJoint & mirabuf.joint.PrismaticJoint.$Shape;

            /**
             * Gets the type url for PrismaticJoint
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace PrismaticJoint {

            /** Properties of a PrismaticJoint. */
            interface $Properties {

                /** PrismaticJoint prismaticFreedom */
                prismaticFreedom?: (mirabuf.joint.DOF.$Properties|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a PrismaticJoint. */
            type $Shape = mirabuf.joint.PrismaticJoint.$Properties;
        }

        /**
         * Properties of a RigidGroup.
         * @deprecated Use mirabuf.joint.RigidGroup.$Properties instead.
         */
        interface IRigidGroup extends mirabuf.joint.RigidGroup.$Properties {
        }

        /** Represents a RigidGroup. */
        class RigidGroup {

            /**
             * Constructs a new RigidGroup.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.joint.RigidGroup.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** RigidGroup name. */
            name: string;

            /** RigidGroup occurrences. */
            occurrences: string[];

            /**
             * Encodes the specified RigidGroup message. Does not implicitly {@link mirabuf.joint.RigidGroup.verify|verify} messages.
             * @param message RigidGroup message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.joint.RigidGroup.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RigidGroup message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.joint.RigidGroup & mirabuf.joint.RigidGroup.$Shape} RigidGroup
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.joint.RigidGroup & mirabuf.joint.RigidGroup.$Shape;

            /**
             * Gets the type url for RigidGroup
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace RigidGroup {

            /** Properties of a RigidGroup. */
            interface $Properties {

                /** RigidGroup name */
                name?: (string|null);

                /** RigidGroup occurrences */
                occurrences?: (string[]|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a RigidGroup. */
            type $Shape = mirabuf.joint.RigidGroup.$Properties;
        }
    }

    /** Namespace motor. */
    namespace motor {

        /**
         * Duty Cycles for electric motors
         * Affects the dynamic output of the motor
         * https://www.news.benevelli-group.com/index.php/en/88-what-motor-duty-cycle.html
         * These each have associated data we are not going to use right now
         */
        enum DutyCycles {

            /** S1 */
            CONTINUOUS_RUNNING = 0,

            /** S2 */
            SHORT_TIME = 1,

            /** S3 */
            INTERMITTENT_PERIODIC = 2,

            /** S6 Continuous Operation with Periodic Duty */
            CONTINUOUS_PERIODIC = 3
        }

        /**
         * Properties of a Motor.
         * @deprecated Use mirabuf.motor.Motor.$Properties instead.
         */
        interface IMotor extends mirabuf.motor.Motor.$Properties {
        }

        /**
         * A Motor should determine the relationship between an input and joint motion
         * Could represent something like a DC Motor relationship
         */
        class Motor {

            /**
             * Constructs a new Motor.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.motor.Motor.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Motor info. */
            info?: (mirabuf.Info.$Properties|null);

            /** Motor dcMotor. */
            dcMotor?: (mirabuf.motor.DCMotor.$Properties|null);

            /** Motor simpleMotor. */
            simpleMotor?: (mirabuf.motor.SimpleMotor.$Properties|null);

            /** Motor motorType. */
            motorType?: ("dcMotor"|"simpleMotor");

            /**
             * Encodes the specified Motor message. Does not implicitly {@link mirabuf.motor.Motor.verify|verify} messages.
             * @param message Motor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.motor.Motor.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Motor message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.motor.Motor & mirabuf.motor.Motor.$Shape} Motor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.motor.Motor & mirabuf.motor.Motor.$Shape;

            /**
             * Gets the type url for Motor
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Motor {

            /** Properties of a Motor. */
            interface $Properties {

                /** Motor info */
                info?: (mirabuf.Info.$Properties|null);

                /** Motor dcMotor */
                dcMotor?: (mirabuf.motor.DCMotor.$Properties|null);

                /** Motor simpleMotor */
                simpleMotor?: (mirabuf.motor.SimpleMotor.$Properties|null);

                /** Motor motorType */
                motorType?: ("dcMotor"|"simpleMotor");

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Narrowed shape of a Motor. */
            type $Shape = {
              info?: mirabuf.Info.$Shape|null;
              dcMotor?: mirabuf.motor.DCMotor.$Shape|null;
              simpleMotor?: mirabuf.motor.SimpleMotor.$Shape|null;
              $unknowns?: Uint8Array[];
            } & (
              ({ motorType?: undefined; dcMotor?: null; simpleMotor?: null }|{ motorType?: "dcMotor"; dcMotor: mirabuf.motor.DCMotor.$Shape; simpleMotor?: null }|{ motorType?: "simpleMotor"; dcMotor?: null; simpleMotor: mirabuf.motor.SimpleMotor.$Shape })
            );
        }

        /**
         * Properties of a SimpleMotor.
         * @deprecated Use mirabuf.motor.SimpleMotor.$Properties instead.
         */
        interface ISimpleMotor extends mirabuf.motor.SimpleMotor.$Properties {
        }

        /**
         * SimpleMotor Configuration
         * Very easy motor used to simulate joints without specifying a real motor
         * Can set braking_constant - stall_torque - and max_velocity
         * Assumes you are solving using a velocity constraint for a joint and not a acceleration constraint
         */
        class SimpleMotor {

            /**
             * Constructs a new SimpleMotor.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.motor.SimpleMotor.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Torque at 0 rpm with a inverse linear relationship to max_velocity */
            stallTorque: number;

            /** The target velocity in RPM, will use stall_torque relationship to reach each step */
            maxVelocity: number;

            /** (Optional) 0 - 1, the relationship of stall_torque used to perserve the position of this motor */
            brakingConstant: number;

            /**
             * Encodes the specified SimpleMotor message. Does not implicitly {@link mirabuf.motor.SimpleMotor.verify|verify} messages.
             * @param message SimpleMotor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.motor.SimpleMotor.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SimpleMotor message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.motor.SimpleMotor & mirabuf.motor.SimpleMotor.$Shape} SimpleMotor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.motor.SimpleMotor & mirabuf.motor.SimpleMotor.$Shape;

            /**
             * Gets the type url for SimpleMotor
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace SimpleMotor {

            /** Properties of a SimpleMotor. */
            interface $Properties {

                /** Torque at 0 rpm with a inverse linear relationship to max_velocity */
                stallTorque?: (number|null);

                /** The target velocity in RPM, will use stall_torque relationship to reach each step */
                maxVelocity?: (number|null);

                /** (Optional) 0 - 1, the relationship of stall_torque used to perserve the position of this motor */
                brakingConstant?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a SimpleMotor. */
            type $Shape = mirabuf.motor.SimpleMotor.$Properties;
        }

        /**
         * Properties of a DCMotor.
         * @deprecated Use mirabuf.motor.DCMotor.$Properties instead.
         */
        interface IDCMotor extends mirabuf.motor.DCMotor.$Properties {
        }

        /**
         * DCMotor Configuration
         * Parameters to simulate a DC Electric Motor
         * Still needs some more but overall they are most of the parameters we can use
         */
        class DCMotor {

            /**
             * Constructs a new DCMotor.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.motor.DCMotor.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Reference for purchase page or spec sheet */
            referenceUrl: string;

            /** m-Nm/Amp */
            torqueConstant: number;

            /** mV/rad/sec */
            emfConstant: number;

            /** Resistance of Motor - Optional if other values are known */
            resistance: number;

            /** measure in percentage of 100 - generally around 60 - measured under optimal load */
            maximumEffeciency: number;

            /** measured in Watts */
            maximumPower: number;

            /** Stated Duty Cycle of motor */
            dutyCycle: mirabuf.motor.DutyCycles;

            /** Optional data that can give a better relationship to the simulation */
            advanced?: (mirabuf.motor.DCMotor.Advanced.$Properties|null);

            /**
             * Encodes the specified DCMotor message. Does not implicitly {@link mirabuf.motor.DCMotor.verify|verify} messages.
             * @param message DCMotor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.motor.DCMotor.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DCMotor message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.motor.DCMotor & mirabuf.motor.DCMotor.$Shape} DCMotor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.motor.DCMotor & mirabuf.motor.DCMotor.$Shape;

            /**
             * Gets the type url for DCMotor
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace DCMotor {

            /** Properties of a DCMotor. */
            interface $Properties {

                /** Reference for purchase page or spec sheet */
                referenceUrl?: (string|null);

                /** m-Nm/Amp */
                torqueConstant?: (number|null);

                /** mV/rad/sec */
                emfConstant?: (number|null);

                /** Resistance of Motor - Optional if other values are known */
                resistance?: (number|null);

                /** measure in percentage of 100 - generally around 60 - measured under optimal load */
                maximumEffeciency?: (number|null);

                /** measured in Watts */
                maximumPower?: (number|null);

                /** Stated Duty Cycle of motor */
                dutyCycle?: (mirabuf.motor.DutyCycles|null);

                /** Optional data that can give a better relationship to the simulation */
                advanced?: (mirabuf.motor.DCMotor.Advanced.$Properties|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a DCMotor. */
            type $Shape = mirabuf.motor.DCMotor.$Properties;

            /**
             * Properties of an Advanced.
             * @deprecated Use mirabuf.motor.DCMotor.Advanced.$Properties instead.
             */
            interface IAdvanced extends mirabuf.motor.DCMotor.Advanced.$Properties {
            }

            /** Information usually found on datasheet */
            class Advanced {

                /**
                 * Constructs a new Advanced.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mirabuf.motor.DCMotor.Advanced.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** measured in AMPs */
                freeCurrent: number;

                /** measured in RPM */
                freeSpeed: number;

                /** measure in AMPs */
                stallCurrent: number;

                /** measured in Nm */
                stallTorque: number;

                /** measured in Volts DC */
                inputVoltage: number;

                /** between (K * (N / 4)) and (K * ((N-2) / 4)) where N is number of poles - leave at 0 if unknown */
                resistanceVariation: number;

                /**
                 * Encodes the specified Advanced message. Does not implicitly {@link mirabuf.motor.DCMotor.Advanced.verify|verify} messages.
                 * @param message Advanced message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mirabuf.motor.DCMotor.Advanced.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Advanced message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mirabuf.motor.DCMotor.Advanced & mirabuf.motor.DCMotor.Advanced.$Shape} Advanced
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.motor.DCMotor.Advanced & mirabuf.motor.DCMotor.Advanced.$Shape;

                /**
                 * Gets the type url for Advanced
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Advanced {

                /** Properties of an Advanced. */
                interface $Properties {

                    /** measured in AMPs */
                    freeCurrent?: (number|null);

                    /** measured in RPM */
                    freeSpeed?: (number|null);

                    /** measure in AMPs */
                    stallCurrent?: (number|null);

                    /** measured in Nm */
                    stallTorque?: (number|null);

                    /** measured in Volts DC */
                    inputVoltage?: (number|null);

                    /** between (K * (N / 4)) and (K * ((N-2) / 4)) where N is number of poles - leave at 0 if unknown */
                    resistanceVariation?: (number|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an Advanced. */
                type $Shape = mirabuf.motor.DCMotor.Advanced.$Properties;
            }
        }
    }

    /** Namespace material. */
    namespace material {

        /**
         * Properties of a Materials.
         * @deprecated Use mirabuf.material.Materials.$Properties instead.
         */
        interface IMaterials extends mirabuf.material.Materials.$Properties {
        }

        /**
         * Represents a File or Set of Materials with Appearances and Physical Data
         *
         * Can be Stored in AssemblyData
         */
        class Materials {

            /**
             * Constructs a new Materials.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.material.Materials.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Identifiable information (id, name, version) */
            info?: (mirabuf.Info.$Properties|null);

            /** Map of Physical Materials */
            physicalMaterials: { [k: string]: mirabuf.material.PhysicalMaterial.$Properties };

            /** Map of Appearances that are purely visual */
            appearances: { [k: string]: mirabuf.material.Appearance.$Properties };

            /**
             * Encodes the specified Materials message. Does not implicitly {@link mirabuf.material.Materials.verify|verify} messages.
             * @param message Materials message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.material.Materials.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Materials message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.material.Materials & mirabuf.material.Materials.$Shape} Materials
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.material.Materials & mirabuf.material.Materials.$Shape;

            /**
             * Gets the type url for Materials
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Materials {

            /** Properties of a Materials. */
            interface $Properties {

                /** Identifiable information (id, name, version) */
                info?: (mirabuf.Info.$Properties|null);

                /** Map of Physical Materials */
                physicalMaterials?: ({ [k: string]: mirabuf.material.PhysicalMaterial.$Properties }|null);

                /** Map of Appearances that are purely visual */
                appearances?: ({ [k: string]: mirabuf.material.Appearance.$Properties }|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Materials. */
            type $Shape = mirabuf.material.Materials.$Properties;
        }

        /**
         * Properties of an Appearance.
         * @deprecated Use mirabuf.material.Appearance.$Properties instead.
         */
        interface IAppearance extends mirabuf.material.Appearance.$Properties {
        }

        /**
         * Contains information on how a object looks
         * Limited to just color for now
         */
        class Appearance {

            /**
             * Constructs a new Appearance.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.material.Appearance.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Identfiable information (id, name, version) */
            info?: (mirabuf.Info.$Properties|null);

            /** albedo map RGBA 0-255 */
            albedo?: (mirabuf.Color.$Properties|null);

            /** roughness value 0-1 */
            roughness: number;

            /** metallic value 0-1 */
            metallic: number;

            /** specular value 0-1 */
            specular: number;

            /**
             * Encodes the specified Appearance message. Does not implicitly {@link mirabuf.material.Appearance.verify|verify} messages.
             * @param message Appearance message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.material.Appearance.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Appearance message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.material.Appearance & mirabuf.material.Appearance.$Shape} Appearance
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.material.Appearance & mirabuf.material.Appearance.$Shape;

            /**
             * Gets the type url for Appearance
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Appearance {

            /** Properties of an Appearance. */
            interface $Properties {

                /** Identfiable information (id, name, version) */
                info?: (mirabuf.Info.$Properties|null);

                /** albedo map RGBA 0-255 */
                albedo?: (mirabuf.Color.$Properties|null);

                /** roughness value 0-1 */
                roughness?: (number|null);

                /** metallic value 0-1 */
                metallic?: (number|null);

                /** specular value 0-1 */
                specular?: (number|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of an Appearance. */
            type $Shape = mirabuf.material.Appearance.$Properties;
        }

        /**
         * Properties of a PhysicalMaterial.
         * @deprecated Use mirabuf.material.PhysicalMaterial.$Properties instead.
         */
        interface IPhysicalMaterial extends mirabuf.material.PhysicalMaterial.$Properties {
        }

        /** Data to represent any given Physical Material */
        class PhysicalMaterial {

            /**
             * Constructs a new PhysicalMaterial.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.material.PhysicalMaterial.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Identifiable information (id, name, version, etc) */
            info?: (mirabuf.Info.$Properties|null);

            /** short description of physical material */
            description: string;

            /** Thermal Physical properties of the model OPTIONAL */
            thermal?: (mirabuf.material.PhysicalMaterial.Thermal.$Properties|null);

            /** Mechanical properties of the model OPTIONAL */
            mechanical?: (mirabuf.material.PhysicalMaterial.Mechanical.$Properties|null);

            /** Physical Strength properties of the model OPTIONAL */
            strength?: (mirabuf.material.PhysicalMaterial.Strength.$Properties|null);

            /** Frictional force for dampening - Interpolate (0-1) */
            dynamicFriction: number;

            /** Frictional force override at stop - Interpolate (0-1) */
            staticFriction: number;

            /** Restitution of the object - Interpolate (0-1) */
            restitution: number;

            /** should this object deform when encountering large forces - TODO: This needs a proper message and equation field */
            deformable: boolean;

            /** generic type to assign some default params */
            matType: mirabuf.material.PhysicalMaterial.MaterialType;

            /**
             * Encodes the specified PhysicalMaterial message. Does not implicitly {@link mirabuf.material.PhysicalMaterial.verify|verify} messages.
             * @param message PhysicalMaterial message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.material.PhysicalMaterial.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PhysicalMaterial message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.material.PhysicalMaterial & mirabuf.material.PhysicalMaterial.$Shape} PhysicalMaterial
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.material.PhysicalMaterial & mirabuf.material.PhysicalMaterial.$Shape;

            /**
             * Gets the type url for PhysicalMaterial
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace PhysicalMaterial {

            /** Properties of a PhysicalMaterial. */
            interface $Properties {

                /** Identifiable information (id, name, version, etc) */
                info?: (mirabuf.Info.$Properties|null);

                /** short description of physical material */
                description?: (string|null);

                /** Thermal Physical properties of the model OPTIONAL */
                thermal?: (mirabuf.material.PhysicalMaterial.Thermal.$Properties|null);

                /** Mechanical properties of the model OPTIONAL */
                mechanical?: (mirabuf.material.PhysicalMaterial.Mechanical.$Properties|null);

                /** Physical Strength properties of the model OPTIONAL */
                strength?: (mirabuf.material.PhysicalMaterial.Strength.$Properties|null);

                /** Frictional force for dampening - Interpolate (0-1) */
                dynamicFriction?: (number|null);

                /** Frictional force override at stop - Interpolate (0-1) */
                staticFriction?: (number|null);

                /** Restitution of the object - Interpolate (0-1) */
                restitution?: (number|null);

                /** should this object deform when encountering large forces - TODO: This needs a proper message and equation field */
                deformable?: (boolean|null);

                /** generic type to assign some default params */
                matType?: (mirabuf.material.PhysicalMaterial.MaterialType|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a PhysicalMaterial. */
            type $Shape = mirabuf.material.PhysicalMaterial.$Properties;

            /** MaterialType enum. */
            enum MaterialType {

                /** METAL value */
                METAL = 0,

                /** PLASTIC value */
                PLASTIC = 1
            }

            /**
             * Properties of a Thermal.
             * @deprecated Use mirabuf.material.PhysicalMaterial.Thermal.$Properties instead.
             */
            interface IThermal extends mirabuf.material.PhysicalMaterial.Thermal.$Properties {
            }

            /** Thermal Properties Set Definition for Simulation. */
            class Thermal {

                /**
                 * Constructs a new Thermal.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mirabuf.material.PhysicalMaterial.Thermal.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** W/(m*K) */
                thermalConductivity: number;

                /** J/(g*C) */
                specificHeat: number;

                /** um/(m*C) */
                thermalExpansionCoefficient: number;

                /**
                 * Encodes the specified Thermal message. Does not implicitly {@link mirabuf.material.PhysicalMaterial.Thermal.verify|verify} messages.
                 * @param message Thermal message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mirabuf.material.PhysicalMaterial.Thermal.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Thermal message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mirabuf.material.PhysicalMaterial.Thermal & mirabuf.material.PhysicalMaterial.Thermal.$Shape} Thermal
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.material.PhysicalMaterial.Thermal & mirabuf.material.PhysicalMaterial.Thermal.$Shape;

                /**
                 * Gets the type url for Thermal
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Thermal {

                /** Properties of a Thermal. */
                interface $Properties {

                    /** W/(m*K) */
                    thermalConductivity?: (number|null);

                    /** J/(g*C) */
                    specificHeat?: (number|null);

                    /** um/(m*C) */
                    thermalExpansionCoefficient?: (number|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Thermal. */
                type $Shape = mirabuf.material.PhysicalMaterial.Thermal.$Properties;
            }

            /**
             * Properties of a Mechanical.
             * @deprecated Use mirabuf.material.PhysicalMaterial.Mechanical.$Properties instead.
             */
            interface IMechanical extends mirabuf.material.PhysicalMaterial.Mechanical.$Properties {
            }

            /** Mechanical Properties Set Definition for Simulation. */
            class Mechanical {

                /**
                 * Constructs a new Mechanical.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mirabuf.material.PhysicalMaterial.Mechanical.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** GPa */
                youngMod: number;

                /** ? */
                poissonRatio: number;

                /** MPa */
                shearMod: number;

                /** g/cm^3 */
                density: number;

                /** ? */
                dampingCoefficient: number;

                /**
                 * Encodes the specified Mechanical message. Does not implicitly {@link mirabuf.material.PhysicalMaterial.Mechanical.verify|verify} messages.
                 * @param message Mechanical message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mirabuf.material.PhysicalMaterial.Mechanical.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Mechanical message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mirabuf.material.PhysicalMaterial.Mechanical & mirabuf.material.PhysicalMaterial.Mechanical.$Shape} Mechanical
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.material.PhysicalMaterial.Mechanical & mirabuf.material.PhysicalMaterial.Mechanical.$Shape;

                /**
                 * Gets the type url for Mechanical
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Mechanical {

                /** Properties of a Mechanical. */
                interface $Properties {

                    /** GPa */
                    youngMod?: (number|null);

                    /** ? */
                    poissonRatio?: (number|null);

                    /** MPa */
                    shearMod?: (number|null);

                    /** g/cm^3 */
                    density?: (number|null);

                    /** ? */
                    dampingCoefficient?: (number|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Mechanical. */
                type $Shape = mirabuf.material.PhysicalMaterial.Mechanical.$Properties;
            }

            /**
             * Properties of a Strength.
             * @deprecated Use mirabuf.material.PhysicalMaterial.Strength.$Properties instead.
             */
            interface IStrength extends mirabuf.material.PhysicalMaterial.Strength.$Properties {
            }

            /** Strength Properties Set Definition for Simulation. */
            class Strength {

                /**
                 * Constructs a new Strength.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mirabuf.material.PhysicalMaterial.Strength.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** MPa */
                yieldStrength: number;

                /** MPa */
                tensileStrength: number;

                /** yes / no */
                thermalTreatment: boolean;

                /**
                 * Encodes the specified Strength message. Does not implicitly {@link mirabuf.material.PhysicalMaterial.Strength.verify|verify} messages.
                 * @param message Strength message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mirabuf.material.PhysicalMaterial.Strength.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Strength message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mirabuf.material.PhysicalMaterial.Strength & mirabuf.material.PhysicalMaterial.Strength.$Shape} Strength
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.material.PhysicalMaterial.Strength & mirabuf.material.PhysicalMaterial.Strength.$Shape;

                /**
                 * Gets the type url for Strength
                 * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                 * @returns The type url
                 */
                static getTypeUrl(prefix?: string): string;
            }

            namespace Strength {

                /** Properties of a Strength. */
                interface $Properties {

                    /** MPa */
                    yieldStrength?: (number|null);

                    /** MPa */
                    tensileStrength?: (number|null);

                    /** yes / no */
                    thermalTreatment?: (boolean|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Strength. */
                type $Shape = mirabuf.material.PhysicalMaterial.Strength.$Properties;
            }
        }
    }

    /** Namespace signal. */
    namespace signal {

        /**
         * Properties of a Signals.
         * @deprecated Use mirabuf.signal.Signals.$Properties instead.
         */
        interface ISignals extends mirabuf.signal.Signals.$Properties {
        }

        /** Signals is a container for all of the potential signals. */
        class Signals {

            /**
             * Constructs a new Signals.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.signal.Signals.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Has identifiable data (id, name, version) */
            info?: (mirabuf.Info.$Properties|null);

            /** Contains a full collection of symbols */
            signalMap: { [k: string]: mirabuf.signal.Signal.$Properties };

            /**
             * Encodes the specified Signals message. Does not implicitly {@link mirabuf.signal.Signals.verify|verify} messages.
             * @param message Signals message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.signal.Signals.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Signals message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.signal.Signals & mirabuf.signal.Signals.$Shape} Signals
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.signal.Signals & mirabuf.signal.Signals.$Shape;

            /**
             * Gets the type url for Signals
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Signals {

            /** Properties of a Signals. */
            interface $Properties {

                /** Has identifiable data (id, name, version) */
                info?: (mirabuf.Info.$Properties|null);

                /** Contains a full collection of symbols */
                signalMap?: ({ [k: string]: mirabuf.signal.Signal.$Properties }|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Signals. */
            type $Shape = mirabuf.signal.Signals.$Properties;
        }

        /** IOType is a way to specify Input or Output. */
        enum IOType {

            /** Input Signal */
            INPUT = 0,

            /** Output Signal */
            OUTPUT = 1
        }

        /**
         * DeviceType needs to be a type of device that has a supported connection
         * As well as a signal frmae but that can come later
         */
        enum DeviceType {

            /** PWM value */
            PWM = 0,

            /** Digital value */
            Digital = 1,

            /** Analog value */
            Analog = 2,

            /** I2C value */
            I2C = 3,

            /** CANBUS value */
            CANBUS = 4,

            /** CUSTOM value */
            CUSTOM = 5
        }

        /**
         * Properties of a Signal.
         * @deprecated Use mirabuf.signal.Signal.$Properties instead.
         */
        interface ISignal extends mirabuf.signal.Signal.$Properties {
        }

        /**
         * Signal is a way to define a controlling signal.
         *
         * TODO: Add Origin
         * TODO: Decide how this is linked to a exported object
         */
        class Signal {

            /**
             * Constructs a new Signal.
             * @param [properties] Properties to set
             */
            constructor(properties?: mirabuf.signal.Signal.$Properties);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];

            /** Has identifiable data (id, name, version) */
            info?: (mirabuf.Info.$Properties|null);

            /** Is this a Input or Output */
            io: mirabuf.signal.IOType;

            /** The name of a custom input type that is not listed as a device type */
            customType: string;

            /** ID for a given signal that exists... PWM 2, CANBUS 4 */
            signalId: number;

            /** Enum for device type that should always be set */
            deviceType: mirabuf.signal.DeviceType;

            /**
             * Encodes the specified Signal message. Does not implicitly {@link mirabuf.signal.Signal.verify|verify} messages.
             * @param message Signal message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            static encode(message: mirabuf.signal.Signal.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Signal message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns {mirabuf.signal.Signal & mirabuf.signal.Signal.$Shape} Signal
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mirabuf.signal.Signal & mirabuf.signal.Signal.$Shape;

            /**
             * Gets the type url for Signal
             * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
             * @returns The type url
             */
            static getTypeUrl(prefix?: string): string;
        }

        namespace Signal {

            /** Properties of a Signal. */
            interface $Properties {

                /** Has identifiable data (id, name, version) */
                info?: (mirabuf.Info.$Properties|null);

                /** Is this a Input or Output */
                io?: (mirabuf.signal.IOType|null);

                /** The name of a custom input type that is not listed as a device type */
                customType?: (string|null);

                /** ID for a given signal that exists... PWM 2, CANBUS 4 */
                signalId?: (number|null);

                /** Enum for device type that should always be set */
                deviceType?: (mirabuf.signal.DeviceType|null);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];
            }

            /** Shape of a Signal. */
            type $Shape = mirabuf.signal.Signal.$Properties;
        }
    }
}
