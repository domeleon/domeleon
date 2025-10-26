import React from 'react'

interface RefForwardingChildWrapperProps {
  targetComponent: React.ElementType
  targetProps: Record<string, any>
  refPropName: string
  children: React.ReactElement
}

export const RefForwardingChildWrapper: React.FC<RefForwardingChildWrapperProps> = ({
  targetComponent,
  targetProps,
  refPropName,
  children,
  ...rest
}) => {
  const nodeRef = React.useRef(null)  
  const targetComponentProps = {
    ...targetProps,
    ...rest,
    [refPropName]: nodeRef
  }
  return React.createElement(targetComponent, targetComponentProps,
    React.cloneElement(children, { ref: nodeRef } as React.Attributes)
  )
} 