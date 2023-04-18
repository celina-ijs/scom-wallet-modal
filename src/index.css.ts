import { Styles } from "@ijstech/components";
const Theme = Styles.Theme.ThemeVars;

export default Styles.style({
  $nest: {
    '.os-modal': {
      boxSizing: 'border-box',
      $nest: {
        '.i-modal_header': {
          borderRadius: '10px 10px 0 0',
          background: 'unset',
          borderBottom: `2px solid ${Theme.divider}`,
          padding: '1rem',
          fontWeight: 700,
          fontSize: '1rem'
        },
        '.list-view': {
          $nest: {
            '.list-item:hover': {
              $nest: {
                '> *': {
                  opacity: 1
                }
              }
            },
            '.list-item': {
              cursor: 'pointer',
              transition: 'all .3s ease-in',
              $nest: {
                '&.disabled-network-selection': {
                  cursor: 'default',
                  $nest: {
                    '&:hover > *': {
                      opacity: '0.5 !important',
                    }
                  }
                },
                '> *': {
                  opacity: .5
                }
              }
            },
            '.list-item.is-actived': {
              $nest: {
                '> *': {
                  opacity: 1
                },
                '&:after': {
                  content: "''",
                  top: '50%',
                  left: 12,
                  position: 'absolute',
                  background: '#20bf55',
                  borderRadius: '50%',
                  width: 10,
                  height: 10,
                  transform: 'translate3d(-50%,-50%,0)'
                }
              }
            }
          }
        }
      }
    }
  }
})
