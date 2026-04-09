'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { iconMap } from '../../lib/nav/iconMap';
import { resolveTarget } from '../../lib/nav/resolveTarget';
import { RawNavCol, RawNavConfig } from '../../lib/nav/types';

type Props = {
  rawMenus: RawNavConfig[];
};

function widthClass(width?: string) {
  if (width === 'xwide') return 'with-mega-item-3';
  return 'with-mega-item-2 small';
}

function renderCol(col: RawNavCol, colIdx: number) {
  if (col.type === 'title') {
    return (
      <h3 key={colIdx} className="lcai-short-title">
        {col.title}
      </h3>
    );
  }

  if (col.type === 'cards') {
    return (
      <ul key={colIdx} className="mega-menu-item mega-menu-card-item">
        {col.items.map((item, idx) => {
          const iconClass = iconMap[item.iconKey] ?? iconMap['default'];
          const target = resolveTarget(item.href, item.target);
          const Tag = target === '_blank' ? 'a' : Link;
          const props =
            target === '_blank'
              ? { href: item.href, target: '_blank' as const }
              : { href: item.href };

          return (
            <li key={idx}>
              <Tag className="lcai-nav-card" {...props}>
                <span className="icon bg-flashlight-static">
                  <i className={iconClass} />
                </span>
                <span className="content">
                  <span className="title">{item.label}</span>
                  {item.desc && <span className="description">{item.desc}</span>}
                </span>
                <span className="right-arrow">
                  <i className="fa-solid fa-arrow-right hover-icon" />
                  <i className="fa-solid fa-chevron-right default-icon" />
                </span>
              </Tag>
            </li>
          );
        })}
      </ul>
    );
  }

  return null;
}

const Nav: React.FC<Props> = ({ rawMenus }) => {
  const [activeMenu, setActiveMenu] = useState<number>(-1);

  return (
    <>
      <ul className="mainmenu">
        {rawMenus &&
          rawMenus.map((menu, idx) => (
            <li
              key={menu.label}
              className="with-megamenu has-menu-child-item position-relative non-hover"
            >
              <a
                href="#"
                onClick={() => setActiveMenu((pre) => (pre === idx ? -1 : idx))}
                className={activeMenu === idx ? 'open' : ''}
              >
                {menu.label} <i className="feather-chevron-down" />
              </a>
              <div
                className={`lightchain-megamenu right-align ${widthClass(menu.width)} ${
                  activeMenu === idx ? '!block' : ''
                }`}
              >
                <div className="wrapper p-0">
                  {menu.width === 'xwide' ? (
                    <div className="lg:flex">
                      {menu.columns.map((col, ci) => {
                        if (col.type === 'title') return null;
                        const prevCol = ci > 0 ? menu.columns[ci - 1] : null;
                        const heading =
                          prevCol && prevCol.type === 'title' ? prevCol.title : undefined;
                        return (
                          <div key={ci} className="single-mega-item sm:flex-1">
                            {heading && <h3 className="lcai-short-title">{heading}</h3>}
                            {renderCol(col, ci)}
                          </div>
                        );
                      })}
                    </div>
                  ) : menu.width === 'wide' ? (
                    <div className="mx-0">
                      {menu.columns.map((col, ci) => {
                        if (col.type === 'title') return null;
                        const prevCol = ci > 0 ? menu.columns[ci - 1] : null;
                        const heading =
                          prevCol && prevCol.type === 'title' ? prevCol.title : undefined;
                        return (
                          <div key={ci} className="single-mega-item md:flex-1">
                            {heading && <h5 className="lcai-short-title">{heading}</h5>}
                            {renderCol(col, ci)}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="single-mega-item">
                      {menu.columns.map((col, ci) => renderCol(col, ci))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </>
  );
};

export default Nav;
