import { useLocation, useSearchParams } from 'react-router-dom'

const withRouter = (WrappedComponent) => (props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  return (
    <WrappedComponent
      {...props}
      {...{ searchParams, setSearchParams, location /* other injected props */ }}
    />
  )
}

export default withRouter
