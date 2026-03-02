'use client';

import Link from 'next/link';
import React, { useState } from 'react';

interface InnerItem {
  link: string;
  text: string;
  icon?: string;
  targetBlank?: boolean;
  subItem?: InnerItem[];
}

interface Item {
  title: string;
  top?: boolean;
  icon?: string;
  innerItem: InnerItem[];
}

interface SingleFooterProps {
  data: Item[];
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const SingleFooter: React.FC<SingleFooterProps> = ({ data }) => {
  const [openCollapseId, setOpenCollapseId] = useState<string | null>(null);
  return (
    <>
      {data.map((item, index) => {
        const parentId = `footer-${slugify(item.title)}-${index}`;

        return (
          <div key={index}>
            <div className="lightchain-footer-widget">
              <div className={`widget-menu-${item.top ? 'top' : 'bottom'}`}>
                <h4 className="title">{item.title}</h4>

                <ul className="footer-link link-hover" id={parentId}>
                  {item.innerItem.map((subItem, subIndex) => {
                    const hasSub = Array.isArray(subItem.subItem) && subItem.subItem.length > 0;
                    const collapseId = `collapse-${parentId}-${subIndex}`;
                    const isOpen = openCollapseId === collapseId;
                    return (
                      <li key={subIndex} className="footer-parent-item flex items-center gap-2">
                        {subItem?.icon && (
                          <div className="lcai-icon-box bg-flashlight-static">
                            <div className="lcai-icon-box-inner bottom-flashlight">
                              <img
                                src={subItem?.icon}
                                alt={subItem?.text}
                                width={16}
                                height={16}
                                style={{ objectFit: 'contain' }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="inline-flex items-center justify-between">
                          {subItem.targetBlank ? (
                            <Link target="_blank" href={subItem.link}>
                              {subItem.text}
                            </Link>
                          ) : (
                            <Link href={subItem.link}>{subItem.text}</Link>
                          )}

                          {hasSub && (
                            <button
                              className="footer-collapse-btn btn btn-sm ms-2 p-0"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#${collapseId}`}
                              aria-expanded={isOpen}
                              aria-controls={collapseId}
                              onClick={() => setOpenCollapseId(isOpen ? null : collapseId)}
                            >
                              <i className={`fa-regular ${isOpen ? 'fa-minus' : 'fa-plus'}`} />
                            </button>
                          )}
                        </div>

                        {hasSub && (
                          <ul
                            className="footer-submenu collapse ps-5 pt-1"
                            id={collapseId}
                            data-bs-parent={`#${parentId}`}
                          >
                            {subItem?.subItem?.map((child, childIndex) => (
                              <li key={childIndex}>
                                {child.targetBlank ? (
                                  <Link target="_blank" href={child.link}>
                                    {child.text}
                                  </Link>
                                ) : (
                                  <Link href={child.link}>{child.text}</Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default SingleFooter;
