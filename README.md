# WebGL Fragment Shader Profiler
[CIS565][cis565] Final Project,
[Terry Sun](http://terrysun.blue) &
[Sally Kong](http://www.kongsally.com/)

![](img/preview.png)

## [Video](https://www.youtube.com/watch?v=iM2nibuqaWU)

There are many tools for [profiling JavaScript/WebGL applications][profile], but
none (?) which profile the actual shaders. However, shaders can end up doing
quite a bit of heavy lifting, and we want to minimize the
amount of time they take so Javascript can have all of the fun.

We have built a tool for profiling fragment shaders, potentially a Chrome
extension. This would run on a webpage, access the GLSL programs running on it,
and profile the fragment shader(s) over different pixels.

  [cis565]: cis565-fall-2015.github.io
  [profile]: http://www.realtimerendering.com/blog/webgl-debugging-and-profiling-tools/

### Progress

Class presentations can be found here:

* [Pitch](https://docs.google.com/presentation/d/1ql6i_PHFyAe6U6gH-zOUKhpxpAzX0TQIN0ZWSS-D-2A/edit?usp=sharing)
* [Milestone 1](https://docs.google.com/presentation/d/1SiUU418lQQzw1nnS0Zcmk2OT4B24SbFRJwTcBvBYxPY/edit?usp=sharing)
* [Milestone 2](https://docs.google.com/presentation/d/1HPLnnpjw2ReZOZ5Td3XHB_Z3rfg1j9FKO2kJrvgp9os/edit?usp=sharing)
* [Milestone 3](https://docs.google.com/presentation/d/1upIHXKcaad5nB-Nd1lpLAzsPMyScnBzAQUJCbzc4_m4/edit?usp=sharing)
* [Milestone 4](https://docs.google.com/presentation/d/1c7s_22Zo8IYG6FWvKAEqLfBznxyj_ytWnPDWKFXVl40/edit?usp=sharing)
* [Final] (https://docs.google.com/presentation/d/1c7s_22Zo8IYG6FWvKAEqLfBznxyj_ytWnPDWKFXVl40/edit?ts=566a27e8#slide=id.gdafbcba01_1_59)

### Acknowledgements

We've included [haxe-glsl-editor][haxe-glsl] as library in order to parse and
modify GLSL code.

  [haxe-glsl]: https://github.com/haxiomic/haxe-glsl-parser

Inspiration for hijacking WebGLContexts was found by looking at the code for
[Chrome Shader Editor Extension][shader-editor] and
[WebGL Inspector][webgl-inspector].

  [shader-editor]: https://github.com/spite/ShaderEditorExtension
  [webgl-inspector]: https://benvanik.github.io/WebGL-Inspector/

### Installation Instructions

This extension relies on the WebGL disjoint timer query extension, which is
currently only available on pre-release version of Chrome (Chrome Canary or
Chromium). Additionally, you need to enable WebGL draft extensions at
"chrome://flags". You should check that "EXT\_disjoint\_timer\_query" is listed
at [http://webglreport.com/](http://webglreport.com/).

Then:

1. Download this git repository with
    `git clone https://github.com/terrynsun/WebGL-Fragment-Shader-Profiler.git`.
2. Go to `chrome://extensions` and enable Developer Settings (top right corner).
3. Click "Load unpacked extension" and select `profiler\_chrome` from this repo.
4. Find a WebGL app to play with!

### Profiling

(GPU-accurate!) Shader timing data is being taken with the [WebGL disjoint timer
query][disjoint-timer], which is a WebGL API, currently available in Chrome
Canary (or Chromium).

With pixel-selection support, you could scissor the rendering target in order to
profile only a single pixel or section of the screen.

### Wishlist

Suggest more!

* Try injecting code into the definitions of the WebGL context prototype
  functions. Maybe in a draw call you can, e.g., bind a dummy FBO, set a
  scissor around a pixel, start a disjoint timer query, render 1000 times, stop
  timing, then do the real draw call. (-Kai)
* [This AMD GPU shader analyzer?][amd-analyzer]

  [disjoint-timer]: https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
  [amd-analyzer]: http://developer.amd.com/tools-and-sdks/graphics-development/gpu-shaderanalyzer/
