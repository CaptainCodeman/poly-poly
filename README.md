# poly-poly

Example approach to using Feature Polyfills with Polymer

## Background

Let's talk about polyfills ... they are never going to go away. The whole reason we can use
WebComponents at all is because polyfills enable them in browsers that don't yet support them.
If we had to wait for all browsers to support a feature before we could use it, some features
would never be usable because use helps drive implementation by other browser vendors and the
polyfills help with that.

We obviously need to load the WebComponents polyfill itself when using Polymer but what about
other polyfills for features that may be required by individual elements?

## The Problem

The problem is, who's job is it to load polyfills and how?

One option is for each element to load whatever polyfill it needs directly. It's easy to add
a static `<script src="some-polyfill.js">` to the element and boom, job done. But there are
some drawbacks to doing this:

1. Polyfill scripts need to be added to each element repository (and not all are available
via package managers). Does the element author have to maintain those scripts as they are
updated and improved? Will they?

2. Polyfill scripts are loaded by all browsers, whether they need them or not. Some polyfills
are small and insignificant but others can be pretty large and they all add-up and ultimately
consume bandwidth and add script parsing overhead which can be significant on slower devices.

3. Different elements could need the same polyfills or different combinations of polyfills
which would further add to waste, especially as the same scripts could then be referenced from
several different paths.

3. It's unclear when polyfills can be removed. For a published element it becomes a hard choice
to support some versions of browsers or not. All these polyfills in different elements could 
build up over time.

4. We may be forcing one particular polyfill on consumers of our element when they would
prefer to use a different implementation.

Some of these could be mitigated - the element could include some feature detection to only
load the polyfill if it was required but this then leads to other problems - making sure that
the now possibly unreferenced script is included in any app bundle and so on. If we end up using
several different polyfills in different elements, each will add some latency to the loading
which could be undesirable. We're also still left with the polyfill versioning and support issues.

Bundling polyfills with our element goes against [fundamental polyfill best practices](https://w3ctag.github.io/polyfills/)

## Use a Polyfill Service

The ideal solution to polyfill loading is to use a [polyfill service](https://polyfill.io/v2/docs/).
This can allow us to update the users browser to support just the features we require all in a
single web request and as browsers are updated, the use of the pollyfills can evaporate to zero
all without a single code change or redeploy of our applications.

If our element used any new feature we would need to document it and it become the app authors 
responsibility to load any required polyfill for it based on the browsers they want to support.

Perfect!

Except ...

## Async Polyfill Loading

Our polyfills may be requested way up in the header of the page, but the elements that use them
are right down in the DOM. If we make everything load synchronously then we're OK but it would be
nicer if we could keep everything as async as possible.

If the elements and polyfills are loaded async, there is no guarantee that the polyfills will have
patched the browser features before our elements try to use them. So how do we make them wait if
they have to?

The implementation I have come up with has two parts to it. The polyfill loading itself is done
in the [polyfills.js](./polyfills.js) which contains the WebComponents polyfill loading
that we are familiar with as well as whatever additional polyfills are needed via feature detection
and the [polyfill.io service](https://polyfill.io/v2/docs/). This script can be loaded asynchronously
or included in the main `index.html` page. Any polyfills it requests are also loaded asynchronously.

The key part is the `PolyfillCallbacks` array added to the global window object. This allows any
element to register a callback to receive a notification when the polyfills have been loaded. If
they are loaded before the element then the callback is short-circuited to execute immediately.
They also trigger if no polyfills are required for the browser being used.

An example of the callback being used to delay initializing an element until the required feature
is available is shown in [lazy-img.html](./lazy-img.html). Note that this makes use of
the [Class-style constructor](https://www.polymer-project.org/1.0/docs/devguide/registering-elements#element-constructor)
to delay upgrading the element until the callback notification.

The demo shows lazy loading images using [IntersectionObserver](https://developers.google.com/web/updates/2016/04/intersectionobserver)
which at the time of writing is only supported natively in Google Chrome and requires no additional
scripts.

A browser without native support will make a request to load the ~20Kb polyfill required but will
otherwise work as normal.

## Drawbacks

The biggest drawback to me is the complexity it introduces and the coupling between the app-level
script and the element. It would be nice if there were some less-direct notification hook that could
be used via Polymer itself (maybe there is - I hope someone tells me!).

I think it would also be a bit nicer to use a promise to delay the element initialization ... but
then promises might need to be polyfilled!

## Final Thoughts

The idea scenario would be for as much of this to be automated and built in to tooling as
possible. Maybe elements could be tagged with the features that they use (or they be automatically
detected by an analyzer) and the script to load them generated automatically.

I'd love to hear feedback on the approach and any ideas to improve it.
