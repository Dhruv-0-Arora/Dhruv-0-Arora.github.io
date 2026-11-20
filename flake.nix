{
  description = "darora1.me: a static site written in Rust, with the simulator under /sim/";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            rustc
            cargo
            clippy
            rustfmt
            rust-analyzer
            # nixpkgs rustc has no rust-lld so wasm32 links with this
            lld
            binaryen
            just
            bacon
            cargo-insta
            bun
            nodejs_24
            validator-nu
            lychee
            (python3.withPackages (ps: [
              ps.fonttools
              ps.brotli
            ]))
          ];
        };
      });
    };
}
