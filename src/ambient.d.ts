/// <reference types="ambient-dts" />

module 'open-in-editor' {
  export default {
    configure(opts: {
      editor: string
      dotfiles: string
      pattern: string
    }): {
      open(filename: string): Promise<void>
    }
  }
}
