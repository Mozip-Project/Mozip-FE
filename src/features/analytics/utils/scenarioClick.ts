// 정답 클릭 영역 표시 속성, 값은 행동 이름
const SCENARIO_TARGET_ATTRIBUTE = 'data-track-target'

// 입력은 정답·오클릭 어느 쪽도 아님 (기획 결정)
const INPUT_SELECTOR =
  'input, textarea, select, label, [contenteditable="true"], [role="textbox"], [role="combobox"]'

// 오클릭은 조작 요소를 잘못 누른 것만, 글자·빈 공간 클릭은 세지 않음 (기획 결정)
const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'summary',
  '[draggable="true"]',
  ...[
    'button',
    'link',
    'tab',
    'menuitem',
    'menuitemradio',
    'menuitemcheckbox',
    'option',
    'radio',
    'checkbox',
    'switch',
  ].map((role) => `[role="${role}"]`),
].join(', ')

type ScenarioClick = { type: 'target'; action: string } | { type: 'ignored' } | { type: 'miss' }

function getScenarioClick(element: Element): ScenarioClick {
  const target = element.closest(`[${SCENARIO_TARGET_ATTRIBUTE}]`)
  const action = target?.getAttribute(SCENARIO_TARGET_ATTRIBUTE)

  if (action) {
    return { type: 'target', action }
  }
  if (element.closest(INPUT_SELECTOR) || !element.closest(INTERACTIVE_SELECTOR)) {
    return { type: 'ignored' }
  }
  return { type: 'miss' }
}

// 오클릭 위치 구분용, 화면 글자는 개인정보가 섞일 수 있어 태그·역할·data-slot만
function describeElement(element: Element) {
  const role = element.getAttribute('role')
  const slot = element.closest('[data-slot]')?.getAttribute('data-slot')

  return [element.tagName.toLowerCase(), role, slot].filter(Boolean).join(' ')
}

export { describeElement, getScenarioClick, SCENARIO_TARGET_ATTRIBUTE }
export type { ScenarioClick }
