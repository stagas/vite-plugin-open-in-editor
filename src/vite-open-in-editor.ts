import { exec } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import type { Plugin } from 'vite'

export function openInEditor(options: { cmd: string }): Plugin {
  return {
    name: 'open-in-editor',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const proxy = server.config.server.proxy
        if (proxy && req.url) {
          if (typeof proxy === 'object' && !Array.isArray(proxy)) {
            for (const pattern of Object.keys(proxy)) {
              if (req.url.startsWith(pattern)) {
                return next()
              }
            }
          }
        }

        if (req.method === 'POST') {
          const fsPath = req.url!.slice(1).replace('@fs', '')
          const homedir = os.homedir()

          let filename: string
          if (fsPath.startsWith(homedir)) {
            filename = fsPath
          } else {
            filename = path.join(process.cwd(), fsPath)
          }
          try {
            console.log('[info] opening file in editor: ' + filename)
            const url = new URL(filename, 'http://localhost')
            const line = url.searchParams.get('at')
            exec(`${options.cmd} -r -g ${url.pathname}:${line}:1`)
          } catch (error) {
            res.writeHead(500)
            res.end((error as Error).message)
            return
          }
          res.writeHead(200, {
            'content-type': 'text/html',
          })
          res.end('<script>window.close()</script>')
          return
        }
        next()
      })
    },
  }
}
