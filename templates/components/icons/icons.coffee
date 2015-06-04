unless window.UOMIconHelper
  window.UOMIconHelper = ->
    class IconHelper
      constructor: (@el) ->
        @ref = @el.getAttribute('data-icon')

        # Protection
        @ref = 'icon-' + @ref if @ref.substr(0,5) != 'icon-'
        @ref = '#' + @ref if @ref.substr(0,1) != '#'

        # Save inner
        @inner = []
        for n in @el.childNodes
          @inner.push @el.removeChild(n)

        @el.innerHTML = """
        <svg class="icon" role="img">
          <use xlink:href="#{@ref}"></use>
        </svg>
"""

        label = document.createElement "div"
        label.addClass "icon-label"
        for n in @inner
          label.appendChild n

        @el.appendChild label

    if (supportedmodernbrowser)
      new IconHelper(m) for m in document.querySelectorAll '[data-icon]'