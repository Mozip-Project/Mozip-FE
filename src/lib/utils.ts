import { createCn } from 'cn/config'

const RADIUS_TOKENS = ['xs', 's', 'm', 'l', 'xl', 'xxl']
const SPACING_TOKENS = [
  'padding-xxs',
  'padding-xs',
  'padding-s',
  'padding-m',
  'padding-l',
  'padding-xl',
  'padding-xxl',
  'gap-xxs',
  'gap-xs',
  'gap-s',
  'gap-m',
  'gap-l',
  'gap-xl',
  'gap-xxl',
  'page-padding',
  'section-gap',
  'content-gap',
  'grid-gutter',
]
const FONT_SIZE_TOKENS = [
  'title3',
  'heading2',
  'headline2',
  'body1',
  'body2',
  'label1',
  'label2',
  'caption1',
]
const SHADOW_TOKENS = ['floating']

export const cn = createCn({
  extend: {
    theme: {
      radius: RADIUS_TOKENS,
      spacing: SPACING_TOKENS,
      shadow: SHADOW_TOKENS,
    },
    classGroups: {
      'font-size': [{ text: FONT_SIZE_TOKENS }],
    },
  },
})
