use std::collections::BTreeMap;

use prost::Message;

#[derive(Clone, PartialEq, Message)]
pub struct Assembly {
    #[prost(message, optional, tag = "2")]
    pub data: Option<AssemblyData>,
    #[prost(message, optional, tag = "5")]
    pub design_hierarchy: Option<GraphContainer>,
}

#[derive(Clone, PartialEq, Message)]
pub struct AssemblyData {
    #[prost(message, optional, tag = "1")]
    pub parts: Option<Parts>,
    #[prost(message, optional, tag = "3")]
    pub materials: Option<Materials>,
}

#[derive(Clone, PartialEq, Message)]
pub struct Parts {
    #[prost(btree_map = "string, message", tag = "2")]
    pub part_definitions: BTreeMap<String, PartDefinition>,
    #[prost(btree_map = "string, message", tag = "3")]
    pub part_instances: BTreeMap<String, PartInstance>,
}

#[derive(Clone, PartialEq, Message)]
pub struct PartDefinition {
    #[prost(message, optional, tag = "3")]
    pub base_transform: Option<Transform>,
    #[prost(message, repeated, tag = "4")]
    pub bodies: Vec<Body>,
}

#[derive(Clone, PartialEq, Message)]
pub struct PartInstance {
    #[prost(string, tag = "2")]
    pub part_definition_reference: String,
    #[prost(message, optional, tag = "3")]
    pub transform: Option<Transform>,
    #[prost(message, optional, tag = "4")]
    pub global_transform: Option<Transform>,
    #[prost(string, tag = "6")]
    pub appearance: String,
}

#[derive(Clone, PartialEq, Message)]
pub struct Body {
    #[prost(message, optional, tag = "3")]
    pub triangle_mesh: Option<TriangleMesh>,
    #[prost(string, tag = "4")]
    pub appearance_override: String,
}

#[derive(Clone, PartialEq, Message)]
pub struct TriangleMesh {
    #[prost(string, tag = "3")]
    pub material_reference: String,
    #[prost(message, optional, tag = "4")]
    pub mesh: Option<Mesh>,
}

#[derive(Clone, PartialEq, Message)]
pub struct Mesh {
    #[prost(float, repeated, tag = "1")]
    pub verts: Vec<f32>,
    #[prost(int32, repeated, tag = "4")]
    pub indices: Vec<i32>,
}

#[derive(Clone, PartialEq, Message)]
pub struct GraphContainer {
    #[prost(message, repeated, tag = "1")]
    pub nodes: Vec<Node>,
}

#[derive(Clone, PartialEq, Message)]
pub struct Node {
    #[prost(string, tag = "1")]
    pub value: String,
    #[prost(message, repeated, tag = "2")]
    pub children: Vec<Node>,
}

#[derive(Clone, PartialEq, Message)]
pub struct Transform {
    #[prost(float, repeated, tag = "1")]
    pub spatial_matrix: Vec<f32>,
}

#[derive(Clone, PartialEq, Message)]
pub struct Materials {
    #[prost(btree_map = "string, message", tag = "3")]
    pub appearances: BTreeMap<String, Appearance>,
}

#[derive(Clone, PartialEq, Message)]
pub struct Appearance {
    #[prost(message, optional, tag = "2")]
    pub albedo: Option<Color>,
}

#[derive(Clone, Copy, PartialEq, Message)]
pub struct Color {
    #[prost(int32, tag = "1")]
    pub r: i32,
    #[prost(int32, tag = "2")]
    pub g: i32,
    #[prost(int32, tag = "3")]
    pub b: i32,
    #[prost(int32, tag = "4")]
    pub a: i32,
}
