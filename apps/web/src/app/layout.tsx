import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyApp Web',
  description: 'Web application for MyApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
        <style suppressHydrationWarning dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              touch-action: manipulation;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              -webkit-touch-callout: none;
              -webkit-tap-highlight-color: transparent;
              overflow-x: hidden;
              overflow-y: auto;
              position: fixed;
              width: 100%;
              height: 100vh;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              box-sizing: border-box;
            }
            html {
              overflow: hidden;
              height: 100vh;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            input, textarea {
              -webkit-user-select: auto;
              -moz-user-select: auto;
              -ms-user-select: auto;
              user-select: auto;
            }
          `
        }} />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}