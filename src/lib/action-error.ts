export type ActionError = { error: string };
export type ActionResult<T = object> = ActionError | undefined | T;

export function isActionError(result: unknown): result is ActionError {
  return typeof result === "object" && result !== null && "error" in result;
}
