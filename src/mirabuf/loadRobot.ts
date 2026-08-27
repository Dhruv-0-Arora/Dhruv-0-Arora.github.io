import { buildRobot, type RobotModel } from "./buildRobot";
import { parseMira } from "./parseMira";

let robotPromise: Promise<RobotModel> | null = null;

/** The Dozer, parsed once per page from the real .mira file and shared. */
export function loadRobot(): Promise<RobotModel> {
  robotPromise ??= parseMira("/models/dozer.mira").then((assembly) =>
    buildRobot(assembly),
  );
  return robotPromise;
}
