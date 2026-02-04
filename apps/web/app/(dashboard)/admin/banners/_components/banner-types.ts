export interface BannerFormData {
  title: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
}

export const DEFAULT_BANNER_FORM: BannerFormData = {
  title: "",
  linkUrl: "",
  order: 0,
  isActive: true,
};
