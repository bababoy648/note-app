import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, shell: true, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`命令失败: ${cmd} ${args.join(' ')} (code ${code})`)),
    )
  })

await run('npm', ['run', 'build'])
console.log('\n正在启动本地预览服务器并打开浏览器…')
console.log('关闭本窗口即可停止记事簿。\n')
await run('npm', ['run', 'preview', '--', '--open', '--port', '4173'])
