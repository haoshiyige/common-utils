const functionsMap = [
  [
    'fullscreen',
    'requestFullscreen',
    'exitFullscreen',
    'fullscreenchange'
  ],
  [
    'msFullscrren',
    'msRequestFullscreen',
    'msExitFullscreen',
    'MSFullscreenChange'
  ],
  [
    'webkitIsFullScreen',
    'webkitRequestFullScreen',
    'webkitExitFullscreen',
    'webkitfullscreenchange'
  ],
  [
    'mozFullScreen',
    'mozRequestFullScreen',
    'mozCancelFullScreen',
    'mozfullscreenchange'
  ]
]

const useFullscreen = (el: HTMLElement | null) => {
  const target = el || document.documentElement
  let isSupported = false
  let isFullscreen = false
  let map = functionsMap[0]

  for (const m of functionsMap) {
    if (m[1] in document) {
      map = m
      isSupported = true
      break
    }
  }

  const [FLAG, ENTER, EXIT, EVENT] = map

  async function exit () {
    if (isSupported && !!FLAG) {
      await document[EXIT]()
      isFullscreen = false
    }
  }
  async function enter () {
    if (isSupported) {
      await exit()
      target[ENTER]()
      isFullscreen = true
    }
  }

  async function toggle () {
    if (isFullscreen) {
      await exit()
    } else {
      await enter()
    }
  }
  function onFullscreenChange (e: Event) {
    return e
  }
  document.addEventListener(EVENT, onFullscreenChange, false)

  return {
    isSupported,
    enter,
    exit,
    toggle,
    onFullscreenChange
  }
}

export default useFullscreen
