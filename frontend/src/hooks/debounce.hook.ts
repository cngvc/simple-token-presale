import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useRef } from 'react'

export const useDebounce = <T extends (...args: any[]) => void>(callback: T): T => {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = callback
  }, [callback])

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.()
    }
    return debounce(func, 500)
  }, [])

  return useCallback(debouncedCallback, [])
}
