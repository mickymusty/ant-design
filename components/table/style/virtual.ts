import { unit } from '@ant-design/cssinjs';
import type { CSSObject } from '@ant-design/cssinjs';

import type { GenerateStyle } from '../../theme/internal';
import type { TableToken } from './index';

const genVirtualStyle: GenerateStyle<TableToken, CSSObject> = (token) => {
  const { componentCls, lineWidth, lineType, tableBorderColor, calc } = token;

  const tableBorder = `${unit(lineWidth)} ${lineType} ${tableBorderColor}`;

  const rowCellCls = `${componentCls}-expanded-row-cell`;

  return {
    [`${componentCls}-wrapper`]: {
      // ========================== Row ==========================
      [`${componentCls}-tbody-virtual`]: {
        // Hint the browser to promote the scroll container to a compositor layer,
        // avoiding main-thread involvement on each scroll frame.
        [`${componentCls}-tbody-virtual-holder`]: {
          willChange: 'scroll-position',
        },

        [`${componentCls}-tbody-virtual-holder-inner`]: {
          [`
            & > ${componentCls}-row,
            & > div:not(${componentCls}-row) > ${componentCls}-row
          `]: {
            display: 'flex',
            boxSizing: 'border-box',
            width: '100%',
          },
        },

        [`${componentCls}-cell`]: {
          borderBottom: tableBorder,
          // Intentionally no transition here. The base table style applies
          // `background-color` transition to cells, but in virtual mode rows
          // mount/unmount on every scroll frame. Hundreds of simultaneous
          // transition starts block the main thread and cause scroll to freeze.
          transition: 'none',
        },

        [`${componentCls}-expanded-row`]: {
          [`${rowCellCls}${rowCellCls}-fixed`]: {
            position: 'sticky',
            insetInlineStart: 0,
            overflow: 'hidden',
            width: `calc(var(--virtual-width) - ${unit(lineWidth)})`,
            borderInlineEnd: 'none',
          },
        },
      },

      // ======================== Border =========================
      [`${componentCls}-bordered`]: {
        [`${componentCls}-tbody-virtual`]: {
          '&:after': {
            content: '""',
            insetInline: 0,
            bottom: 0,
            borderBottom: tableBorder,
            position: 'absolute',
          },

          [`${componentCls}-cell`]: {
            borderInlineEnd: tableBorder,

            [`&${componentCls}-cell-fix-right-first:before`]: {
              content: '""',
              position: 'absolute',
              insetBlock: 0,
              insetInlineStart: calc(lineWidth).mul(-1).equal(),
              borderInlineStart: tableBorder,
            },
          },
        },

        // Empty placeholder
        [`&${componentCls}-virtual`]: {
          [`${componentCls}-placeholder ${componentCls}-cell`]: {
            borderInlineEnd: tableBorder,
            borderBottom: tableBorder,
          },
        },
      },
    },
  };
};

export default genVirtualStyle;
