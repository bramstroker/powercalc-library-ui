import type { LinksFunction, MetaFunction } from "react-router";

import { ProfileCategoryIndex } from "../components/ProfileCategoryIndex";
import { DEVICE_TYPE_CATEGORY } from "../config/profileCategories";
import { libraryPreloadLinks } from "../seo/apiLinks";
import { createPageMeta } from "../seo/meta";

export const links: LinksFunction = () => libraryPreloadLinks;

export const meta: MetaFunction = () => {
  const config = DEVICE_TYPE_CATEGORY;
  return createPageMeta({
    path: config.indexPath,
    title: config.indexTitle,
    description: config.indexDescription,
  });
};

const ProfileCategoriesRoute = () => <ProfileCategoryIndex config={DEVICE_TYPE_CATEGORY} />;

export default ProfileCategoriesRoute;
