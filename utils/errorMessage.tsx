type entry = {
  message: string
}

type errorType = Record<string, entry>

export const errorMessage: errorType = {
  '-32002': {
    message: 'Metamask window is already open, please click on the Metamask icon in the extension list',
  },
}
