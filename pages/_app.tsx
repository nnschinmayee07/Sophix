import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { montserrat, rubik, raleway } from '../lib/fonts'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <div className={`${montserrat.variable} ${rubik.variable} ${raleway.variable}`}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  )
}
