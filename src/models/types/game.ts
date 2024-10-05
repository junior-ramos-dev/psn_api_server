export enum TROPHY_TITLE_PLATFORM {
  PS5 = "PS5",
  PS4 = "PS4",
  PS3 = "PS3",
  PSVITA = "PSVITA",
}

/**
 * When the title platform is PS3, PS4, or PS Vita you must specify the npServiceName parameter as "trophy".
 */
export enum NP_SERVICE_NAME {
  PS3_PS4_PSVITA_TROPHY = "trophy",
  PS5_TROPHY = "trophy2",
}

/**
 * A call to this function will retrieve the trophy list of a single - or all - trophy groups for a title.
 * A title can have multiple groups of trophies (a "default" group which all titles have,
 * and additional groups starting with the name "001" and incrementing for each additional group).
 * To retrieve trophies from all groups within a title (ie. the full trophy set),
 * then trophyGroupId should be set to "all".
 */
export enum TROPHY_GROUP_ID {
  ALL = "all",
}

export interface IGameIconProjection {
  [key: string]: number;
}

export interface IGameDetailsProjection {
  [key: string]: number;
}
export interface IGameDetailsListProjection {
  [key: string]: number | string;
}

export enum IMG_TYPE {
  PNG = "png",
  WEBP = "webp",
}
