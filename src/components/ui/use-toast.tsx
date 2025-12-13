import { useState, useEffect } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const toasts: Toast[] = []
const listeners: ((toasts: Toast[]) => void)[] = []

let memoryState: { toasts: Toast[] } = {
  toasts: [],
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const addToRemoveQueue = (toastId: string) => {
  if (memoryState.toasts.find((t) => t.id === toastId)) {
    setTimeout(() => {
      memoryState.toasts = memoryState.toasts.filter((t) => t.id !== toastId)
      listeners.forEach((listener) => {
        listener(memoryState.toasts)
      })
    }, 5000)
  }
}

const reducer = (state: Toast[], action: any): Toast[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.toast]
    case 'UPDATE_TOAST':
      return state.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t))
    case 'DISMISS_TOAST': {
      const { toastId } = action
      return state.filter((t) => t.id !== toastId)
    }
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.toastId)
    default:
      return state
  }
}

const listeners2: Array<(state: Toast[]) => void> = []

let memoryState2: Toast[] = []

function dispatch(action: any) {
  memoryState2 = reducer(memoryState2, action)
  listeners2.forEach((listener) => {
    listener(memoryState2)
  })
}

type ToasterToast = Toast & {
  id: string
  title?: string
  description?: string
}

function toast({ ...props }: Omit<ToasterToast, 'id'>) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    },
  })

  addToRemoveQueue(id)

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = useState<Toast[]>(memoryState2)

  useEffect(() => {
    listeners2.push(setState)
    return () => {
      const index = listeners2.indexOf(setState)
      if (index > -1) {
        listeners2.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      dispatch({ type: 'DISMISS_TOAST', toastId })
    },
  }
}

export { useToast, toast }