import { TrophyCount } from "../types/trophies";

export class Game {
  npServiceName: string;
  npCommunicationId: string;
  trophySetVersion: string;
  trophyTitleName: string;
  trophyTitleDetail: string;
  trophyTitleIconUrl: string;
  trophyTitlePlatform: string;
  hasTrophyGroups: boolean;
  trophyGroupCount: number;
  definedTrophies: TrophyCount;
  progress: number;
  earnedTrophies: TrophyCount;
  hiddenFlag: boolean;
  lastUpdatedDateTime: Date;

  constructor(
    npServiceName: string,
    npCommunicationId: string,
    trophySetVersion: string,
    trophyTitleName: string,
    trophyTitleDetail: string,
    trophyTitleIconUrl: string,
    trophyTitlePlatform: string,
    hasTrophyGroups: boolean,
    trophyGroupCount: number,
    definedTrophies: TrophyCount,
    progress: number,
    earnedTrophies: TrophyCount,
    hiddenFlag: boolean,
    lastUpdatedDateTime: Date
  ) {
    this.npServiceName = npServiceName;
    this.npCommunicationId = npCommunicationId;
    this.trophySetVersion = trophySetVersion;
    this.trophyTitleName = trophyTitleName;
    this.trophyTitleDetail = trophyTitleDetail;
    this.trophyTitleIconUrl = trophyTitleIconUrl;
    this.trophyTitlePlatform = trophyTitlePlatform;
    this.hasTrophyGroups = hasTrophyGroups;
    this.trophyGroupCount = trophyGroupCount;
    this.definedTrophies = definedTrophies;
    this.progress = progress;
    this.earnedTrophies = earnedTrophies;
    this.hiddenFlag = hiddenFlag;
    this.lastUpdatedDateTime = lastUpdatedDateTime;
  }
}

// To parse this data:
//
//   import { Convert, Game } from "./file";
//
//   const game = Convert.toGame(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class ConvertGame {
  public static toGame(json: string): Game {
    return cast(JSON.parse(json), r("Game"));
  }

  public static gameToJson(value: Game): string {
    return JSON.stringify(uncast(value, r("Game")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
      val
    )}`
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(", ")}]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = "",
  parent: any = ""
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      // return invalidValue(l(ref || "object"), val, key, parent);
      return {};
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : "undefined";
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty("props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  Game: o(
    [
      { json: "npServiceName", js: "npServiceName", typ: "" },
      { json: "npCommunicationId", js: "npCommunicationId", typ: "" },
      { json: "trophySetVersion", js: "trophySetVersion", typ: "" },
      { json: "trophyTitleName", js: "trophyTitleName", typ: "" },
      { json: "trophyTitleDetail", js: "trophyTitleDetail", typ: "" },
      { json: "trophyTitleIconUrl", js: "trophyTitleIconUrl", typ: "" },
      { json: "trophyTitlePlatform", js: "trophyTitlePlatform", typ: "" },
      { json: "hasTrophyGroups", js: "hasTrophyGroups", typ: true },
      { json: "trophyGroupCount", js: "trophyGroupCount", typ: 0 },
      { json: "definedTrophies", js: "definedTrophies", typ: r("NedTrophies") },
      { json: "progress", js: "progress", typ: 0 },
      { json: "earnedTrophies", js: "earnedTrophies", typ: r("NedTrophies") },
      { json: "hiddenFlag", js: "hiddenFlag", typ: true },
      { json: "lastUpdatedDateTime", js: "lastUpdatedDateTime", typ: Date },
    ],
    false
  ),
  NedTrophies: o(
    [
      { json: "bronze", js: "bronze", typ: 0 },
      { json: "silver", js: "silver", typ: 0 },
      { json: "gold", js: "gold", typ: 0 },
      { json: "platinum", js: "platinum", typ: 0 },
    ],
    false
  ),
};
