import React from 'react'
import { COLORS } from '../constants'

type PadProps = {
  instrument: number
  column: number
  row: number
  active: boolean
  soundPalette: number
  togglePad: (opts: { instrument: number; column: number; row: number }) => void
}

class Pad extends React.Component<PadProps> {
  constructor(props) {
    super(props)
    this.state = {
      color: props.active ? COLORS[props.soundPalette % COLORS.length] : 'white',
      opacity: 0.65,
      transition: 'none',
    }
  }

  onClick() {
    let { instrument, column, row, active, soundPalette, togglePad } = this.props
    if (!active) {
      this.setState({ color: COLORS[soundPalette % COLORS.length] })
    }
    togglePad({ instrument, column, row })
  }

  componentWillReceiveProps(props) {
    if (props.pulsing && !this.props.pulsing) {
      this.setState({
        opacity: 1,
        transition: 'none',
        color: COLORS[props.soundPalette % COLORS.length],
      })
      setTimeout(() => {
        this.setState({
          opacity: 0.65,
          transition: 'opacity 200ms linear',
        })
      }, 50)
    }
  }

  render() {
    let { active } = this.props
    let { color, opacity, transition } = this.state
    let style = {
      backgroundColor: active ? color : 'white',
      opacity,
      transition,
    }
    return (
      <div
        ref="pad"
        onClick={() => this.onClick()}
        style={style}
        className={`pad ${active ? 'active' : ''}`}
      ></div>
    )
  }
}

Pad.propTypes = {
  instrument: React.PropTypes.number.isRequired,
  column: React.PropTypes.number.isRequired,
  row: React.PropTypes.number.isRequired,
  actions: React.PropTypes.object.isRequired,
  active: React.PropTypes.bool.isRequired,
  soundPalette: React.PropTypes.number.isRequired,
  pulsing: React.PropTypes.bool.isRequired,
}

export default Pad
