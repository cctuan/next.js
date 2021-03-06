import React, { Component, PropTypes, Children } from 'react'

export default class Link extends Component {
  static contextTypes = {
    router: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.linkClicked = this.linkClicked.bind(this)
  }

  linkClicked (e) {
    if (e.target.nodeName === 'A' &&
      (e.metaKey || e.ctrlKey || e.shiftKey || (e.nativeEvent && e.nativeEvent.which === 2))) {
      // ignore click for new tab / new window behavior
      return
    }

    const { href, scroll, as } = this.props

    if (!isLocal(href)) {
      // ignore click if it's outside our scope
      return
    }

    e.preventDefault()

    const route = as ? href : null
    // getting navigation event props.
    const {
      onStart = () => null,
      onComplete = () => null,
      onError = () => null,
      onBefore = (next) => { next() }
    } = this.props

    // straight up redirect
    onStart()
    onBefore(() => {
      this.context.router.push(route, href)
      .then((success) => {
        onComplete(success)
        if (!success) return
        if (scroll !== false) window.scrollTo(0, 0)
      })
      .catch(onError)
    })
  }

  render () {
    const children = Children.map(this.props.children, (child) => {
      const props = {
        onClick: this.linkClicked
      }

      const isAnchor = child && child.type === 'a'

      // if child does not specify a href, specify it
      // so that repetition is not needed by the user
      if (!isAnchor || !('href' in child.props)) {
        props.href = this.props.as || this.props.href
      }

      if (isAnchor) {
        return React.cloneElement(child, props)
      } else {
        return <a {...props}>{child}</a>
      }
    })

    return children[0]
  }
}

export function isLocal (href) {
  const origin = window.location.origin
  return !/^https?:\/\//.test(href) ||
    origin === href.substr(0, origin.length)
}
