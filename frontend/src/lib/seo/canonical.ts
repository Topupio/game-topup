import type { Metadata } from "next";

export function getCanonicalMetadata(pathname: string): Pick<Metadata, "alternates"> {
  return {
    alternates: {
      canonical: pathname,
    },
  };
}
