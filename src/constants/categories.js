// Central list of product categories.
// Only mouse, keyboard, gamepad, headset and other are supported.
export const CATEGORIES = [
  { slug: 'mouse',    label: 'Mouse'    },
  { slug: 'keyboard', label: 'Teclado'  },
  { slug: 'gamepad',  label: 'Controle' },
  { slug: 'headset',  label: 'Headset'  },
  { slug: 'other',    label: 'Outros'   },
]

export function getCategoryLabel(slug) {
  return CATEGORIES.find(c => c.slug === slug)?.label ?? slug
}
