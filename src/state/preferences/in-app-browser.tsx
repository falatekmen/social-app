import React from 'react'
import * as persisted from '#/state/persisted'
import {Linking} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import {isNative} from '#/platform/detection'
import {useModalControls} from '../modals'

type StateContext = persisted.Schema['useInAppBrowser']
type SetContext = (v: persisted.Schema['useInAppBrowser']) => void

const stateContext = React.createContext<StateContext>(
  persisted.defaults.useInAppBrowser,
)
const setContext = React.createContext<SetContext>(
  (_: persisted.Schema['useInAppBrowser']) => {},
)

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [state, setState] = React.useState(persisted.get('useInAppBrowser'))

  const setStateWrapped = React.useCallback(
    (inAppBrowser: persisted.Schema['useInAppBrowser']) => {
      setState(inAppBrowser)
      persisted.write('useInAppBrowser', inAppBrowser)
    },
    [setState],
  )

  React.useEffect(() => {
    return persisted.onUpdate(() => {
      setState(persisted.get('useInAppBrowser'))
    })
  }, [setStateWrapped])

  return (
    <stateContext.Provider value={state}>
      <setContext.Provider value={setStateWrapped}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export function useInAppBrowser() {
  return React.useContext(stateContext)
}

export function useSetInAppBrowser() {
  return React.useContext(setContext)
}

export function useOpenLink() {
  const {openModal} = useModalControls()
  const enabled = useInAppBrowser()

  const openLink = React.useCallback(
    (url: string, override?: boolean) => {
      if (isNative && !url.startsWith('mailto:')) {
        if (override === undefined && enabled === undefined) {
          openModal({
            name: 'in-app-browser-consent',
            href: url,
          })
          return
        } else if (override ?? enabled) {
          WebBrowser.openBrowserAsync(url, {
            presentationStyle:
              WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          })
          return
        }
      }
      Linking.openURL(url)
    },
    [enabled, openModal],
  )

  return openLink
}
