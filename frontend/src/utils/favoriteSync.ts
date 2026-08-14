const FAVORITES_CHANGED_EVENT =
  'progrefy:favorites-changed'

export interface FavoriteChangedEvent {
  trainerId: number
  isFavorite: boolean
}

export function notifyFavoritesChanged(
  trainerId: number,
  isFavorite: boolean,
) {
  window.dispatchEvent(
    new CustomEvent<FavoriteChangedEvent>(
      FAVORITES_CHANGED_EVENT,
      {
        detail: {
          trainerId: Number(trainerId),
          isFavorite,
        },
      },
    ),
  )
}

export function subscribeToFavoritesChanged(
  callback: (
    trainerId: number,
    isFavorite: boolean,
  ) => void,
) {
  function handleEvent(event: Event) {
    const customEvent =
      event as CustomEvent<FavoriteChangedEvent>

    const detail = customEvent.detail

    if (
      !detail ||
      typeof detail.trainerId !== 'number' ||
      typeof detail.isFavorite !== 'boolean'
    ) {
      return
    }

    callback(
      Number(detail.trainerId),
      detail.isFavorite,
    )
  }

  window.addEventListener(
    FAVORITES_CHANGED_EVENT,
    handleEvent,
  )

  return () => {
    window.removeEventListener(
      FAVORITES_CHANGED_EVENT,
      handleEvent,
    )
  }
}