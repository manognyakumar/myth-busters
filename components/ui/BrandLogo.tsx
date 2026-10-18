const LOGO = "/brand/RIT_2018_logo_Dubai.png";

/** RIT Dubai logo on white only. */
export function BrandLogo({ large = false }: { large?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${LOGO}`} alt="RIT Dubai" width={3836} height={629} className={large ? "h-[52px] w-auto" : "h-10 w-auto lg:h-11"} />;
}
