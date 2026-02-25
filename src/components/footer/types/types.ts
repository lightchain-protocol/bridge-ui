export type RawFooterLink = {
  text: string;
  href: string;
  target?: "_blank";
};

export type RawFooterColumn = {
  title: string;
  style: "top" | "bottom";
  links: RawFooterLink[];
};

export type RawSocialLink = {
  text: string;
  href: string;
  target: "_blank";
  iconKey: string;
};

export type RawFooterConfig = {
  columns: RawFooterColumn[];
  social: RawSocialLink[];
};
