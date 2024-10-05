import React from 'react'
import { BASE_URL } from '../constants'

type SaveProps = {
  hash: string
  hideSave: () => void
  show: boolean
}

export default function Save({ show, hash, hideSave }: SaveProps) {
  return (
    <div className={`saved-popup ${show ? 'show' : ''}`}>
      <div className="close" onClick={hideSave}>
        x
      </div>
      <p>Share and listen to your creation with this url:</p>
      <textarea readOnly value={`${BASE_URL}#/${hash}`} />
    </div>
  )
}
