import { SetMetadata } from "@nestjs/common";

export const SKIP_RESPONSE_TRANSFORM_KEY = "skipResponseTransform";

/** Use on streaming or raw-response endpoints that must not be wrapped in `{ success, data }`. */
export const SkipResponseTransform = () =>
  SetMetadata(SKIP_RESPONSE_TRANSFORM_KEY, true);
