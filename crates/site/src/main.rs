use std::path::PathBuf;
use std::process::ExitCode;

use clap::{Args, Parser, Subcommand};
use site::{Gate, Options, Problem, Summary};

#[derive(Parser)]
#[command(name = "site", about = "Build and serve darora1.me")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    Build(BuildArgs),
    Serve {
        #[command(flatten)]
        build: BuildArgs,
        #[arg(long, default_value_t = 4000)]
        port: u16,
    },
}

#[derive(Args)]
struct BuildArgs {
    #[arg(long, default_value = ".")]
    root: PathBuf,
    #[arg(long)]
    out: Option<PathBuf>,
    #[arg(long)]
    claims: Option<PathBuf>,
    #[arg(long)]
    require_claims: bool,
    #[arg(long)]
    wasm: Option<PathBuf>,
}

impl BuildArgs {
    fn options(self, live_reload: bool) -> Options {
        let mut options = Options::new(self.root);
        if let Some(out) = self.out {
            options.out = out;
        }
        if let Some(wasm) = self.wasm {
            options.wasm = wasm;
        }
        options.claims = self.claims;
        options.require_claims = self.require_claims;
        options.live_reload = live_reload;
        options
    }
}

fn report(result: &Result<Summary, Vec<Problem>>) {
    match result {
        Ok(summary) => {
            match &summary.gate {
                Gate::Checked { file, phrases } => {
                    println!("claims gate: {phrases} phrases from {file}, none found");
                }
                Gate::Skipped => {
                    println!("claims gate skipped: no --claims file and no profile/claims.md");
                }
            }
            println!(
                "built {} pages and copied {} static files",
                summary.pages, summary.static_files
            );
        }
        Err(problems) => {
            for problem in problems {
                eprintln!("{problem}");
            }
            let s = if problems.len() == 1 { "" } else { "s" };
            eprintln!("build failed with {} problem{s}", problems.len());
        }
    }
}

fn main() -> ExitCode {
    match Cli::parse().command {
        Command::Build(args) => {
            let result = site::build(&args.options(false));
            report(&result);
            if result.is_ok() {
                ExitCode::SUCCESS
            } else {
                ExitCode::FAILURE
            }
        }
        Command::Serve { build, port } => match site::serve(&build.options(true), port, report) {
            Ok(()) => ExitCode::SUCCESS,
            Err(message) => {
                eprintln!("{message}");
                ExitCode::FAILURE
            }
        },
    }
}
