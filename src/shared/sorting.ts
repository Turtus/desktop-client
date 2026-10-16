import { Record as ListenerRecord } from "./pb/types";

// Keep lists alphabetical. `numeric` so "Subgraph 2" sorts ahead of
// "Subgraph 10", and `sensitivity` so casing doesn't split the ordering.
export const compareTitles = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

export const byConnectionName = (a: ListenerRecord, b: ListenerRecord): number =>
  compareTitles(a?.conn?.name || "", b?.conn?.name || "");
