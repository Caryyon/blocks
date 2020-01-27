/** @jsx jsx */
import { useState, useRef, useEffect } from 'react'
import { jsx } from 'theme-ui'
import { Textarea } from '@theme-ui/components'
import prettier from 'prettier/standalone'
import parserJS from 'prettier/parser-babylon'

import { Clipboard, Check } from 'react-feather'

import * as transforms from './transforms'
import { useEditor } from './providers/editor'
import { useCode } from './providers/code'
import InlineRender from './inline-render'
import { PreviewArea, Device } from './device-preview'
import { IconButton } from './ui'
import useCopyToClipboard from './use-copy-to-clipboard'
import { useScope } from './providers/scope'
import { useCanvas } from './providers/canvas'
import { useElementSize } from './use-element-size'

const CanvasWrap = props => {
  const canvasRef = useRef()
  const elementSize = useElementSize(canvasRef)
  const { setCanvasSize } = useCanvas()

  useEffect(() => {
    setCanvasSize(elementSize)
  }, [elementSize])

  return (
    <div
      ref={canvasRef}
      sx={{
        position: 'relative',
        backgroundColor: 'white',
        overflow: 'auto'
      }}
      {...props}
    />
  )
}

const Copy = ({ toCopy }) => {
  const { hasCopied, copyToClipboard } = useCopyToClipboard()

  return (
    <IconButton
      onClick={() => copyToClipboard(toCopy)}
      sx={{ position: 'absolute', right: '-4px' }}
    >
      {hasCopied ? (
        <Check sx={{ color: 'green' }} aria-label="Copied" />
      ) : (
        <Clipboard size={16} aria-label="Copy" />
      )}
    </IconButton>
  )
}

const Canvas = () => {
  const [error, setError] = useState(null)
  const { theme, ...scope } = useScope()
  const { code, transformedCode, editCode } = useCode()
  const { mode } = useEditor()
  const rawCode = transforms.toRawJSX(code)
  const formattedCode = prettier.format(rawCode, {
    parser: 'babel',
    plugins: [parserJS]
  })

  if (mode === 'code') {
    return (
      <CanvasWrap>
        <pre
          sx={{
            mt: 0,
            mb: 0,
            backgroundColor: 'rgba(206, 17, 38, 0.05)',
            fontSize: '8pt'
          }}
        >
          {error}
        </pre>
        <Copy toCopy={formattedCode} />
        <Textarea
          sx={{
            height: '100%',
            border: 'none',
            borderRadius: 0,
            fontFamily: 'Menlo, monospace',
            fontSize: '14px'
          }}
          onChange={e => {
            try {
              editCode(e.target.value)
              setError(null)
            } catch (err) {
              setError(err.toString())
            }
          }}
        >
          {formattedCode}
        </Textarea>
      </CanvasWrap>
    )
  }

  if (mode === 'viewports') {
    return (
      <PreviewArea>
        {theme.breakpoints.map(breakpoint => (
          <Device key={breakpoint} width={breakpoint} height={500}>
            <InlineRender scope={scope} code={transformedCode} theme={theme} />
          </Device>
        ))}
      </PreviewArea>
    )
  }

  return (
    <CanvasWrap>
      <InlineRender
        fullHeight
        scope={scope}
        code={transformedCode}
        theme={theme}
      />
    </CanvasWrap>
  )
}

export default Canvas
