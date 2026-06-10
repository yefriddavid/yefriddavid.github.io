import React, { Component } from 'react'
import { Autocomplete, TextField } from '@material-ui/lab'

class SelectControl extends Component {
  state = {
    value: '',
  }
  onChangeValueHandler = (_, v) => {
    const { onChange, name } = this.props
    onChange(v, name)
  }

  render() {
    const { value, title, options } = this.props

    return (
      <>
        <h3>{title}</h3>
        <Autocomplete
          onChange={this.onChangeValueHandler}
          value={value}
          options={options}
          style={{ width: 300, height: 50 }}
          renderInput={(params) => <TextField {...params} label={title} variant="outlined" />}
        />
      </>
    )
  }
}

export { SelectControl }
