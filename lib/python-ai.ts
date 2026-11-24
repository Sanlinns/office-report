export function isPythonAiEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    Boolean(process.env.PY_AI_BASE_URL?.trim())
  );
}