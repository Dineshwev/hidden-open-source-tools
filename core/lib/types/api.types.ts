export type RouteContext<K extends string = "id"> = {
  params: Record<K, string>;
};
