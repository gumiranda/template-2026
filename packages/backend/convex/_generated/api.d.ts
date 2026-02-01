/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as carts from "../carts.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_helpers from "../lib/helpers.js";
import type * as lib_types from "../lib/types.js";
import type * as menu from "../menu.js";
import type * as orders from "../orders.js";
import type * as permissions from "../permissions.js";
import type * as restaurants from "../restaurants.js";
import type * as sessions from "../sessions.js";
import type * as tables from "../tables.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  carts: typeof carts;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/helpers": typeof lib_helpers;
  "lib/types": typeof lib_types;
  menu: typeof menu;
  orders: typeof orders;
  permissions: typeof permissions;
  restaurants: typeof restaurants;
  sessions: typeof sessions;
  tables: typeof tables;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
