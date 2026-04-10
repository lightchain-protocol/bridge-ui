export type RawNavCardItem = {
  label: string;
  desc?: string;
  href: string;
  iconKey: string;
  target?: "_blank";
  badge?: string;
};

export type RawNavCol =
  | { type: "title"; title: string }
  | { type: "cards"; items: RawNavCardItem[] }
  | { type: "imageCard"; href: string; img: string; badge?: string; title: string; meta?: string }
  | { type: "spacer" };

export type RawNavConfig = {
  label: string;
  align?: "left" | "right";
  width?: "small" | "wide" | "xwide";
  columns: RawNavCol[];
};
