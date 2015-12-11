# WebGL Fragment Shader Profiler
[CIS565][cis565] Final Project, Terry Sun & Sally Kong

![](img/preview.png)

There are many tools for [profiling JavaScript/WebGL applications][profile], but
none (?) which profile the actual shaders. However, shaders can end up doing
quite a bit of heavy lifting, and we want to minimize the
amount of time they take so Javascript can have all of the fun.

We want to build a tool for profiling fragment shaders, potentially a Chrome
extension. This would run on a webpage, access the GLSL programs running on it,
and profile the fragment shader(s) over different pixels.

  [cis565]: cis565-fall-2015.github.io
  [profile]: http://www.realtimerendering.com/blog/webgl-debugging-and-profiling-tools/

### Progress

Class presentations can be found here:

* [Pitch](https://docs.google.com/presentation/d/1ql6i_PHFyAe6U6gH-zOUKhpxpAzX0TQIN0ZWSS-D-2A/edit?usp=sharing)
* [Milestone 1](https://docs.google.com/presentation/d/1SiUU418lQQzw1nnS0Zcmk2OT4B24SbFRJwTcBvBYxPY/edit?usp=sharing)
* [Milestone 2](https://docs.google.com/presentation/d/1HPLnnpjw2ReZOZ5Td3XHB_Z3rfg1j9FKO2kJrvgp9os/edit?pli=1)
* [Milestone 3] (https://docs.google.com/presentation/d/1upIHXKcaad5nB-Nd1lpLAzsPMyScnBzAQUJCbzc4_m4/edit#slide=id.p)
* [Final] (https://docs.google.com/presentation/d/1c7s_22Zo8IYG6FWvKAEqLfBznxyj_ytWnPDWKFXVl40/edit?ts=566a27e8#slide=id.gdafbcba01_1_59)

Code for the Chrome extension can be found in profiler_chrome/

### Tools

What we're using

* [haxe-glsl-editor][haxe-glsl]

  [haxe-glsl]: https://github.com/haxiomic/haxe-glsl-parser

* Inspiration for hijacing WebGLContexts was found by looking at
  [Chrome Shader Editor Extension][shader-editor]
  and [WebGL Inspector][webgl-inspector]

  [shader-editor]: https://github.com/spite/ShaderEditorExtension
  [webgl-inspector]: https://benvanik.github.io/WebGL-Inspector/

### Profiling

(GPU-accurate!) Shader timing data is being taken with the [WebGL disjoint timer
query][disjoint-timer], which is a WebGL API, currently available in Chrome
Canary (or Chromium).

* If you have Chrome Canary, you can enable the disjoint timer query by enabling
WebGL Draft Extensions at "chrome://flags/#enable-webgl-draft-extensions"

In order to measure the performance impact of a section of a fragment shader, the shader is re-compiled with a no-op inserted in place of a potentially expensive operation, then profile the new shader. The performance gain from the new shader will reveal the cost of whatever section was replaced.

With pixel-selection support, you could scissor the rendering target in order to
profile only a single pixel or section of the screen.

### Assorted Ideas, Suggestions, References

Suggest more!

* Try injecting code into the definitions of the WebGL context prototype
  functions. Maybe in a draw call you can, e.g., bind a dummy FBO, set a
  scissor around a pixel, start a disjoint timer query, render 1000 times, stop
  timing, then do the real draw call. (-Kai)
* [This AMD GPU shader analyzer?][amd-analyzer]

  [disjoint-timer]: https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
  [amd-analyzer]: http://developer.amd.com/tools-and-sdks/graphics-development/gpu-shaderanalyzer/

