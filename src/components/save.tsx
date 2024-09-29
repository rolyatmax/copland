import React from 'react'
import { BASE_URL } from '../constants'
import { generateHash } from '../save_state_helpers'
import type { Instrument } from '../types'

type SaveProps = {
  instruments: Instrument[]
  toggleSave: () => void
  show: boolean
}

export default function Save({ show, instruments, toggleSave }: SaveProps) {
  const code = show ? generateHash({ instruments }) : ''
  return (
    <div className={`saved-popup ${show ? 'show' : ''}`}>
      <div className="close" onClick={toggleSave}>
        x
      </div>
      <p>Share and listen to your creation with this url:</p>
      <textarea readOnly value={`${BASE_URL}#/${code}`} />
    </div>
  )
}
