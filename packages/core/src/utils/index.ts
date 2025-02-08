export * from "./chains";
export * from "./tokens";
export * from "./bet";

export function bigIntFormatter(_key: string | number, value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  } else {
    return value;
  }
}
