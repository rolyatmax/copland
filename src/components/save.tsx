import React, { useState } from 'react'
import { BASE_URL } from '../constants'

type SaveProps = {
  hash: string
  hideSave: () => void
  show: boolean
}

export default function Save({ show, hash, hideSave }: SaveProps) {
  const [copied, setCopied] = useState(false)

  const url = `${BASE_URL}#/${hash}`
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="saved-popup-container">
      <div className={`saved-popup ${show ? 'show' : ''}`}>
        <div className="close" onClick={hideSave}>
          x
        </div>
        <p>Share and listen to your creation with this url:</p>
        <code>{url}</code>
        <button onClick={copyToClipboard}>{copied ? 'Copied!' : 'Copy'}</button>
      </div>
    </div>
  )
}
