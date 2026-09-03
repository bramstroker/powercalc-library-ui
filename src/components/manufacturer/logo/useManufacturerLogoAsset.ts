import { useEffect, useState } from "react";

import {
  getCachedManufacturerLogoAsset,
  loadManufacturerLogoAsset,
  type ManufacturerLogoAsset,
  type ManufacturerLogoSource,
} from "./manufacturerLogoAssets";

type ResolvedLogoAsset = {
  cacheKey: string;
  asset: ManufacturerLogoAsset;
};

export const useManufacturerLogoAsset = (source: ManufacturerLogoSource | undefined) => {
  const cacheKey = source?.cacheKey;
  const load = source?.load;
  const cached = cacheKey ? getCachedManufacturerLogoAsset(cacheKey) : undefined;
  const [resolved, setResolved] = useState<ResolvedLogoAsset | undefined>(() =>
    cacheKey && cached ? { cacheKey, asset: cached } : undefined,
  );

  useEffect(() => {
    if (!cacheKey || !load) return;

    const cachedAsset = getCachedManufacturerLogoAsset(cacheKey);
    if (cachedAsset) {
      setResolved({ cacheKey, asset: cachedAsset });
      return;
    }

    let live = true;
    void loadManufacturerLogoAsset({ cacheKey, load }).then((asset) => {
      if (live) setResolved({ cacheKey, asset });
    });
    return () => {
      live = false;
    };
  }, [cacheKey, load]);

  if (!cacheKey) return undefined;
  return resolved?.cacheKey === cacheKey ? resolved.asset : cached;
};
