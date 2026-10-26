import localFont from 'next/font/local'

// Pretendard 1.3.9 가변 폰트(OFL-1.1, fonts/LICENSE.txt). weight 범위는 폰트 파일 기준
export const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  weight: '45 920',
  display: 'swap',
  variable: '--font-pretendard',
})
