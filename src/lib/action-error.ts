export type ActionError = { error: string };
export type ActionResult<T = object | void> = Promise<T | ActionError>;

export function isActionError(result: unknown): result is ActionError {
  return typeof result === "object" && result !== null && "error" in result;
}
