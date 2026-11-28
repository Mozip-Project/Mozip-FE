'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import CameraIcon from '@/assets/icons/camera.svg'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import { useObjectUrl } from '@/hooks/useObjectUrl'

const PHOTO_FILE_NAME = 'camera-photo.jpg'
const PHOTO_TYPE = 'image/jpeg'
const PHOTO_QUALITY = 0.9
const CAMERA_IDEAL_WIDTH_PX = 1920
const CAMERA_IDEAL_HEIGHT_PX = 1080
// 공고 카드·상세의 대표 이미지 비율(2:1)
const POSTING_IMAGE_ASPECT_RATIO = 2
const SHOOT_COUNTDOWN_SECONDS = 3
const COUNTDOWN_TICK_MS = 1000

type CameraStatus = 'loading' | 'ready' | 'unavailable'

type PostingImageCameraDialogProps = {
  onCapture: (photo: File) => void
}

function PostingImageCameraDialog({ onCapture }: PostingImageCameraDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleUse(photo: File) {
    onCapture(photo)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="m" className="w-full">
          <CameraIcon aria-hidden />
          사진 찍기
        </Button>
      </DialogTrigger>
      <DialogContent className="w-160">
        <DialogHeader title="사진 찍기" description="찍은 사진을 대표 이미지로 등록해요." />
        {/* 열려 있는 동안에만 마운트되어 닫으면 카메라 종료 */}
        <CameraCapture onUse={handleUse} />
      </DialogContent>
    </Dialog>
  )
}

function CameraCapture({ onUse }: { onUse: (photo: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<CameraStatus>('loading')
  const [photo, setPhoto] = useState<File | null>(null)
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null)
  const photoUrl = useObjectUrl(photo)
  const canShoot = status === 'ready' && countdownSeconds === null

  useEffect(() => {
    let isClosed = false
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        // HTTPS·localhost가 아니면 mediaDevices가 없어 catch로 이동
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: CAMERA_IDEAL_WIDTH_PX },
            height: { ideal: CAMERA_IDEAL_HEIGHT_PX },
          },
          audio: false,
        })

        if (isClosed) {
          stopCamera(cameraStream)
          return
        }
        stream = cameraStream
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream
        }
        setStatus('ready')
      } catch {
        if (!isClosed) {
          setStatus('unavailable')
        }
      }
    }

    void startCamera()

    return () => {
      isClosed = true
      if (stream) {
        stopCamera(stream)
      }
    }
  }, [])

  useEffect(() => {
    if (countdownSeconds === null) {
      return
    }
    const timerId = window.setTimeout(() => {
      if (countdownSeconds > 1) {
        setCountdownSeconds(countdownSeconds - 1)
        return
      }
      setCountdownSeconds(null)
      if (videoRef.current) {
        savePhoto(videoRef.current, setPhoto)
      }
    }, COUNTDOWN_TICK_MS)

    return () => window.clearTimeout(timerId)
  }, [countdownSeconds])

  if (status === 'unavailable') {
    return (
      <>
        <p role="alert" className="text-center text-body2 font-normal break-keep text-critical">
          카메라를 사용할 수 없어요. 브라우저의 카메라 권한을 확인해 주세요.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <div className="relative flex aspect-2/1 w-full items-center justify-center overflow-hidden rounded-m bg-neutral-weak">
        {/* 다시 찍을 때 바로 이어지도록 촬영 뒤에도 유지, 거울처럼 좌우 반전 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="카메라 미리보기"
          className="size-full -scale-x-100 object-cover"
        />
        {status === 'loading' && (
          <p role="status" className="absolute text-body2 font-normal text-neutral-subtle">
            카메라를 켜는 중이에요
          </p>
        )}
        {countdownSeconds !== null && (
          <p
            role="status"
            className="absolute flex size-16 items-center justify-center rounded-full bg-neutral-solid text-title3 font-bold text-on-neutral-solid"
          >
            <span className="sr-only">촬영까지 </span>
            {countdownSeconds}
            <span className="sr-only">초</span>
          </p>
        )}
        {photoUrl && (
          <Image
            src={photoUrl}
            alt="찍은 사진"
            fill
            unoptimized
            className="bg-neutral-weak object-cover"
          />
        )}
      </div>
      {photo ? (
        <DialogFooter>
          <Button variant="secondary" onClick={() => setPhoto(null)}>
            다시 찍기
          </Button>
          <Button onClick={() => onUse(photo)}>사용하기</Button>
        </DialogFooter>
      ) : (
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <Button disabled={!canShoot} onClick={() => setCountdownSeconds(SHOOT_COUNTDOWN_SECONDS)}>
            촬영
          </Button>
        </DialogFooter>
      )}
    </>
  )
}

function savePhoto(video: HTMLVideoElement, onSave: (photo: File) => void) {
  if (video.videoWidth === 0) {
    return
  }
  // 미리보기에 보이는 가운데 2:1 영역만 저장
  const cropWidth = Math.min(video.videoWidth, video.videoHeight * POSTING_IMAGE_ASPECT_RATIO)
  const cropHeight = cropWidth / POSTING_IMAGE_ASPECT_RATIO
  const cropX = (video.videoWidth - cropWidth) / 2
  const cropY = (video.videoHeight - cropHeight) / 2
  const canvas = document.createElement('canvas')
  canvas.width = cropWidth
  canvas.height = cropHeight
  const context = canvas.getContext('2d')

  if (!context) {
    return
  }
  // 미리보기와 같은 거울 방향으로 저장
  context.translate(canvas.width, 0)
  context.scale(-1, 1)
  context.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
  canvas.toBlob(
    (blob) => {
      if (blob) {
        onSave(new File([blob], PHOTO_FILE_NAME, { type: PHOTO_TYPE }))
      }
    },
    PHOTO_TYPE,
    PHOTO_QUALITY,
  )
}

function stopCamera(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop())
}

export { PostingImageCameraDialog }
