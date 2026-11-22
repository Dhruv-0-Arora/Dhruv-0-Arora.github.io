use std::path::PathBuf;
use std::process::ExitCode;

use clap::{Args, Parser, Subcommand};
use site::{Options, Problem, Summary};

#[derive(Parser)]
#[command(name = "site", about = "Build darora1.me")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    Build(BuildArgs),
}

#[derive(Args)]
struct BuildArgs {
    #[arg(long, default_value = ".")]
    root: PathBuf,
    #[arg(long)]
    out: Option<PathBuf>,
    #[arg(long)]
    wasm: Option<PathBuf>,
}

impl BuildArgs {
    fn options(self) -> Options {
        let mut options = Options::new(self.root);
        if let Some(out) = self.out {
            options.out = out;
        }
        if let Some(wasm) = self.wasm {
            options.wasm = wasm;
        }
        options
    }
}

fn report(result: &Result<Summary, Vec<Problem>>) {
    match result {
        Ok(summary) => {
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
            let result = site::build(&args.options());
            report(&result);
            if result.is_ok() {
                ExitCode::SUCCESS
            } else {
                ExitCode::FAILURE
            }
        }
    }
}
