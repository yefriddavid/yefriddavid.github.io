import React from 'react'
import { CToast, CToastBody, CToastHeader } from '@coreui/react'

export const Notification = ({visible, message, type="error"}) => {
  return (
    <CToast animation={false} autohide={false} visible={visible}>
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <div className="fw-bold me-auto">Error message</div>
        <small>7 min ago</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )
}



