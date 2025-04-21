/**
 *  Cookie based authentication with ability to sync between multiple browser tabs
 *  https://codesandbox.io/s/oxy3e?file=/utils/auth.js
 * */

import  cookie from 'js-cookie'
import { GetServerSidePropsContext, NextPage, NextPageContext } from 'next'
import nextCookie from 'next-cookies'
import Router from 'next/router'
import { FC, useEffect } from 'react'
import { isBrowser } from './envUtils'

const LOGIN_PATH = '/LoginPage'

export const getServerAccessToken = (ctx: NextPageContext | GetServerSidePropsContext) => nextCookie(ctx).token
export const getClientAccessToken = () => cookie.get('token')
export const isClientLoggedIn = () => Boolean(getClientAccessToken())

export const login = (token: string, nextPath?: string) => {
  cookie.set('token', token, { expires: 1 })
  if (nextPath) {
    Router.push(nextPath)
  }
}


export const auth = (ctx: { res?: any; req?: { headers: { cookie?: string | undefined } } | undefined }) => {
  const { token } = nextCookie(ctx)

  // If there's no token, it means the user is not logged in.
if (!token) {
    if (typeof window === 'undefined') {
      ctx.res.writeHead(302, { Location: '/LoginPage' })
      ctx.res.end()
    } else {
      Router.push('/LoginPage')
    }
  }

  return token
}

export const logout = () => {
  cookie.remove('token')
  // to support logging out from all windows
  window.localStorage.setItem('logout', Date.now().toString())
  Router.push(LOGIN_PATH)
}

export type WithAuthSync = {
  token?: string
}

export const withAuthSync = <T extends WithAuthSync>(WrappedComponent: FC<T> & NextPage) => {
  /**
   * Add fetching logic here for account details.
   * Utilize desired state management library.
   * Don't forget to handle UI loading state.
   * @param props
   * @returns
   */
  const Wrapper = (props: T) => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key === 'logout') {
        Router.push(LOGIN_PATH)
      }
    }

    useEffect(() => {
      window.addEventListener('storage', syncLogout)

      return () => {
        window.removeEventListener('storage', syncLogout)
        window.localStorage.removeItem('logout')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <WrappedComponent {...props} />
  }

  Wrapper.getInitialProps = async (ctx: NextPageContext) => {
    const token = getServerAccessToken(ctx)

    if (!token) {
      if (!isBrowser) {
        ctx.res?.writeHead(302, { Location: LOGIN_PATH })
        ctx.res?.end()
      } else {
        Router.push(LOGIN_PATH)
      }
    }

    const wrappedComponentProps = WrappedComponent.getInitialProps && (await WrappedComponent.getInitialProps(ctx))

    return { ...wrappedComponentProps, token }
  }

  return Wrapper
}
