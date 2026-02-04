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
import type * as cleanup from "../cleanup.js";
import type * as clerkWebhook from "../clerkWebhook.js";
import type * as crons from "../crons.js";
import type * as customerMenu from "../customerMenu.js";
import type * as customerOrders from "../customerOrders.js";
import type * as customerRestaurants from "../customerRestaurants.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as foodCategories from "../foodCategories.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_helpers from "../lib/helpers.js";
import type * as lib_storage from "../lib/storage.js";
import type * as lib_types from "../lib/types.js";
import type * as menu from "../menu.js";
import type * as migrations from "../migrations.js";
import type * as orders from "../orders.js";
import type * as permissions from "../permissions.js";
import type * as promoBanners from "../promoBanners.js";
import type * as restaurants from "../restaurants.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as stripe from "../stripe.js";
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
  cleanup: typeof cleanup;
  clerkWebhook: typeof clerkWebhook;
  crons: typeof crons;
  customerMenu: typeof customerMenu;
  customerOrders: typeof customerOrders;
  customerRestaurants: typeof customerRestaurants;
  favorites: typeof favorites;
  files: typeof files;
  foodCategories: typeof foodCategories;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/constants": typeof lib_constants;
  "lib/helpers": typeof lib_helpers;
  "lib/storage": typeof lib_storage;
  "lib/types": typeof lib_types;
  menu: typeof menu;
  migrations: typeof migrations;
  orders: typeof orders;
  permissions: typeof permissions;
  promoBanners: typeof promoBanners;
  restaurants: typeof restaurants;
  seed: typeof seed;
  sessions: typeof sessions;
  stripe: typeof stripe;
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
