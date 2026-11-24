import isUndefined from "lodash.isundefined";
import omitBy from "lodash.omitby";

export function omitUndefinedCondition(
  record: Record<string, string | number | undefined | null>
) {
  return omitBy(record, isUndefined);
}
