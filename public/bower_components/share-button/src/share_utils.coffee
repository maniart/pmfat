# classList shim for IE 9
if ("classList" not of document.documentElement) and Object.defineProperty and typeof HTMLElement isnt "undefined"
  Object.defineProperty HTMLElement::, "classList",
    get: ->
      update = (fn) ->
        (value) ->
          classes = self.className.split(/\s+/)
          index = classes.indexOf(value)
          fn classes, index, value
          self.className = classes.join(" ")
          return
      self = this
      ret =
        add: update((classes, index, value) ->
          ~index or classes.push(value)
          return
        )
        remove: update((classes, index) ->
          ~index and classes.splice(index, 1)
          return
        )
        toggle: update((classes, index, value) ->
          (if ~index then classes.splice(index, 1) else classes.push(value))
          return
        )
        contains: (value) ->
          !!~self.className.split(/\s+/).indexOf(value)

        item: (i) ->
          self.className.split(/\s+/)[i] or null

      Object.defineProperty ret, "length",
        get: ->
          self.className.split(/\s+/).length

      ret

####

class ShareUtils
  extend: (to, from, overwrite) ->
    for prop of from
      hasProp = to[prop] isnt `undefined`
      if hasProp and typeof(from[prop]) is "object"
        @extend(to[prop], from[prop], overwrite)
      else
        to[prop] = from[prop] if overwrite or not hasProp
    return

  hide: (el) ->
    el.style.display = "none"

  show: (el) ->
    el.style.display = "block"

  has_class: (el, class_name) ->
    el.classList.contains(class_name)

  add_class: (el, class_name) ->
    el.classList.add(class_name)

  remove_class: (el, class_name) ->
    el.classList.remove(class_name)

  is_encoded: (str) ->
    decodeURIComponent(str) isnt str

  encode: (str)->
    if @is_encoded(str) then str else encodeURIComponent(str)

  popup: (url, params = {}) ->
    popup =
      width:  500
      height: 350

    popup.top  = (screen.height/2) - (popup.height/2)
    popup.left = (screen.width/2)  - (popup.width/2)

    qs = ("#{k}=#{@encode(v)}" for k, v of params).join('&')
    if qs then qs = "?#{qs}"

    window.open(url+qs, 'targetWindow', "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,left=#{popup.left},top=#{popup.top},width=#{popup.width},height=#{popup.height}")
