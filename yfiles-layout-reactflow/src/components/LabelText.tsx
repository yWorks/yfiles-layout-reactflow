import { CSSProperties, PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react'
import { isLabelType, Label } from './Labels.tsx'

type LabelTextProps = {
  x: number
  y: number
  width?: number
  height?: number
  angle?: number
  transform?: string
  label: Label | string | ReactNode
  labelStyle?: CSSProperties
  dataId: string
  className?: string
  isNodeLabel?: boolean
}

export default function LabelText({
  x,
  y,
  width,
  height,
  angle,
  transform,
  label,
  labelStyle,
  dataId,
  isNodeLabel,
  className,
  children
}: LabelTextProps & PropsWithChildren) {
  const [textBox, setTextBox] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const hasLayout = typeof width !== 'undefined' && typeof height !== 'undefined'
  const labelRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!labelRef || !labelRef.current) return

    if (!width || !height) {
      const bbox = (labelRef.current as HTMLDivElement).getBoundingClientRect()
      setTextBox({
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      })
    } else {
      setTextBox({
        x: x,
        y: y,
        width: width ?? 0,
        height: height ?? 0
      })
    }
  }, [x, y, width, height])

  const defaultStyle = { position: 'absolute', whiteSpace:  'nowrap' , boxSizing: 'content-box'} as CSSProperties
  let style: CSSProperties = { ...defaultStyle, ...isNodeLabel && {top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}

  if (hasLayout) {
    let hOffset = 0
    let vOffset = 0
    if (isNodeLabel) {
        // handle the case where the label with paddings is larger than the node's bounds
        const {offset, wDiff, hDiff} = calculateOffsets(textBox.width, textBox.height, containerRef.current!)
        hOffset += wDiff * 0.5 + (textBox.x >= 0 ? offset.left : offset.right)
        vOffset += hDiff * 0.5 + (textBox.y >= 0 ? offset.top : offset.bottom)
    }

    style = {
        ...defaultStyle,
        width: textBox.width,
        height: textBox.height,
        transform: (isNodeLabel ? `translate(${textBox.x - hOffset}px,${textBox.y - vOffset}px) ` : '') + (transform ? ` ${transform}` : ''),
        ...!isNodeLabel && {transformOrigin: `0px 0px`}
    }
  }

  return (
    <div data-id={dataId} style={style} className={className} ref={containerRef}>
      <div
        style={{
          ...labelStyle,
          ...(isNodeLabel && shouldFlipText(angle) && { transform: `rotate(${Math.PI}rad)` })
        }}
        ref={labelRef}
      >
        {isLabelType(label) ? label.label : label}
      </div>
      {children}
    </div>
  )
}

/**
 * Returns true if the label with its paddings is larger than the node bounds.
 */
function calculateOffsets(
  width: number,
  height: number,
  labelElement: HTMLDivElement
): {
  offset: { top: number; right: number; bottom: number; left: number }
  wDiff: number
  hDiff: number
} {
  if (labelElement) {
    const parentElement = labelElement.parentElement as HTMLDivElement
    if (parentElement) {
      const parentWidth = parentElement.clientWidth
      const parentHeight = parentElement.clientHeight
      const parentPadding = calculatePadding(parentElement)
      const labelPadding = calculatePadding(labelElement)
      return {
        offset: {
          top: parentPadding.top + labelPadding.top,
          bottom: parentPadding.bottom + labelPadding.bottom,
          right: parentPadding.right + labelPadding.right,
          left: parentPadding.left + labelPadding.left
        },
        wDiff: width - parentWidth,
        hDiff: height - parentHeight,
      }
    }
  }
  return { offset: { top: 0, right: 0, bottom: 0, left: 0 }, wDiff: -1, hDiff: -1 }
}

function calculatePadding(element: HTMLDivElement) {
  if (!element) {
    return {  top: 0, right: 0, bottom: 0, left: 0 }
  }
  const elementStyle = window.getComputedStyle(element)
  return {
    top: parseFloat(elementStyle.paddingTop) ?? 0,
    right: parseFloat(elementStyle.paddingRight) ?? 0,
    bottom: parseFloat(elementStyle.paddingBottom) ?? 0,
    left: parseFloat(elementStyle.paddingLeft) ?? 0
  }
}

/**
 * Checks whether the text has to be flipped.
 */
function shouldFlipText(angle: number | undefined) {
    return angle && ((angle >= -Math.PI && angle <= -Math.PI / 2) || (angle >= Math.PI / 2 && angle <= Math.PI));
}
