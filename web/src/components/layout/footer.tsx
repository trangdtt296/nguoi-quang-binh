import Link from "next/link";
import { LogoMark } from "./logo";
import { footerNav } from "@/lib/nav";
import type { SiteSettings } from "@/types/content";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-ink text-silver">
      <div className="container-page py-14">
        <div className="flex flex-wrap gap-12 border-b border-white/10 pb-9">
          <div className="flex-1 basis-[300px]">
            <div className="mb-3.5 flex items-center gap-2.5 text-white">
              <LogoMark size={30} />
              <span className="text-[15px] font-bold">
                {settings.siteName.toUpperCase()}
              </span>
            </div>
            <p className="max-w-[36ch] text-[14px] leading-relaxed">
              {settings.slogan}. {settings.aboutShort}
            </p>
          </div>

          {footerNav.map((group) => (
            <div key={group.title} className="flex-1 basis-[160px]">
              <h2 className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
                {group.title}
              </h2>
              <ul className="flex flex-col gap-2.5 text-[14px]">
                {group.items.map((item, index) => (
                  <li key={`${item.href}-${index}`}>
                    <Link href={item.href} className="hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex-1 basis-[220px]">
            <h2 className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
              Kết nối
            </h2>
            <ul className="flex flex-col gap-2.5 text-[14px]">
              <li>
                <a
                  href={settings.facebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Fanpage Facebook
                </a>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-white">
                  Gửi góp ý
                </Link>
              </li>
              {settings.email ? <li>{settings.email}</li> : null}
              {settings.hotline ? <li>{settings.hotline}</li> : null}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-[13px] text-white/50">{settings.footerText}</p>
      </div>
    </footer>
  );
}
