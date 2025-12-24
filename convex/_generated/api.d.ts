/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as collectors_github from "../collectors/github.js";
import type * as collectors_hackernews from "../collectors/hackernews.js";
import type * as collectors_rss from "../collectors/rss.js";
import type * as crons from "../crons.js";
import type * as functions_items from "../functions/items.js";
import type * as lib_constants from "../lib/constants.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "collectors/github": typeof collectors_github;
  "collectors/hackernews": typeof collectors_hackernews;
  "collectors/rss": typeof collectors_rss;
  crons: typeof crons;
  "functions/items": typeof functions_items;
  "lib/constants": typeof lib_constants;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
