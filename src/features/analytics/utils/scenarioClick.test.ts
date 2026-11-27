import { describe, expect, it } from 'vitest'
import { describeElement, getScenarioClick, getScenarioDropAction } from './scenarioClick'

function render(html: string) {
  document.body.innerHTML = html
}

function query(selector: string) {
  const element = document.querySelector(selector)
  if (!element) {
    throw new Error(`${selector} 없음`)
  }
  return element
}

describe('getScenarioClick', () => {
  it('정답 영역 안의 요소를 누르면 그 영역의 행동 이름', () => {
    render('<div data-track-target="doc_score"><button><span id="inner">3</span></button></div>')

    expect(getScenarioClick(query('#inner'))).toEqual({ type: 'target', action: 'doc_score' })
  })

  it('정답 영역은 입력보다 먼저 판단해 업로드 라벨도 정답', () => {
    render('<div data-track-target="posting_image_upload"><label id="upload">등록</label></div>')

    expect(getScenarioClick(query('#upload'))).toEqual({
      type: 'target',
      action: 'posting_image_upload',
    })
  })

  it('입력칸·라벨 클릭은 정답도 오클릭도 아님', () => {
    render('<label id="label">제목<input id="input" /></label><textarea id="area"></textarea>')

    expect(getScenarioClick(query('#input'))).toEqual({ type: 'ignored' })
    expect(getScenarioClick(query('#label'))).toEqual({ type: 'ignored' })
    expect(getScenarioClick(query('#area'))).toEqual({ type: 'ignored' })
  })

  it('정답이 아닌 버튼·링크·메뉴 항목 클릭은 오클릭', () => {
    render(
      '<main><button id="button"><span id="inner">취소</span></button><a id="link" href="/">홈</a><div id="item" role="menuitem">삭제</div></main>',
    )

    expect(getScenarioClick(query('#inner'))).toEqual({ type: 'miss' })
    expect(getScenarioClick(query('#link'))).toEqual({ type: 'miss' })
    expect(getScenarioClick(query('#item'))).toEqual({ type: 'miss' })
  })

  it('조작 요소가 아닌 글자·빈 공간 클릭은 세지 않음', () => {
    render('<div data-slot="popover-content"><p id="text">최근 쓴 장소</p></div>')

    expect(getScenarioClick(query('#text'))).toEqual({ type: 'ignored' })
  })
})

describe('getScenarioDropAction', () => {
  it('놓는 영역 안이면 그 영역의 행동 이름, 밖이면 null', () => {
    render(
      '<div data-track-drop="timetable_slot_assign"><span id="slot">빈 칸</span></div><p id="out">밖</p>',
    )

    expect(getScenarioDropAction(query('#slot'))).toBe('timetable_slot_assign')
    expect(getScenarioDropAction(query('#out'))).toBeNull()
  })
})

describe('describeElement', () => {
  it('화면 글자 없이 태그·역할·가까운 data-slot만', () => {
    render('<div data-slot="applicant-row"><div id="cell" role="cell">김모집</div></div>')

    expect(describeElement(query('#cell'))).toBe('div cell applicant-row')
  })
})
