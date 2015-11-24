# WebGL Fragment Shader Profiler
[CIS565][cis565] Final Project, Terry Sun & Sally Kong

There are many tools for [profiling JavaScript/WebGL applications][profile], but
none (?) which profile the actual shaders. However, shaders can end up doing
quite a bit of heavy lifting, and we want to minimize the
amount of time they take so Javascript can have all of the fun.

I want to build a tool for profiling fragment shaders, potentially a Chrome
extension. This would run on a webpage, access the GLSL programs running on it,
and profile the fragment shader(s) over different pixels.

  [cis565]: cis565-fall-2015.github.io
  [profile]: http://www.realtimerendering.com/blog/webgl-debugging-and-profiling-tools/

### General goals

(To be updated as I figure out what's feasible and/or I have more ideas.)

* Profile individual parts of the shader:
  * Via user markup to delineate sections.
  * Automatic profiling (eg. choosing function calls to target).
  * Interacting with the AST (vs. string replacement).
* Allow the user to select a pixel to profile (via mouseover), and display
  hotspots in the shader for that pixel.
* Compare shader hotspots across different pixels in the same shader.
* Output some pretty graphs.

### Progress

Class presentations can be found here:

* [Pitch](https://docs.google.com/presentation/d/1ql6i_PHFyAe6U6gH-zOUKhpxpAzX0TQIN0ZWSS-D-2A/edit?usp=sharing)
* [Milestone 1](https://docs.google.com/presentation/d/1SiUU418lQQzw1nnS0Zcmk2OT4B24SbFRJwTcBvBYxPY/edit?usp=sharing)

Research/development is currently going on in a [second Github
repository][sandbox] (building off a previous class project, a WebGL Deferred
Shader). New code can be found in the profiler/ folder.

  [sandbox]: https://github.com/terrynsun/WebGL-Profiler-Sandbox

### Tools

What I'm using

* [haxe-glsl-editor][haxe-glsl]

  [haxe-glsl]: https://github.com/haxiomic/haxe-glsl-parser

There are some existing tools which I would like to use:

* [Chrome Shader Editor Extension][shader-editor]. It looks like this is modeled
  after the Firefox shader editor tool, but would be less complicated to
  integrate with because it's stand-alone rather than a Firefox dev tool. I’m
  thinking of forking this extension in order to provide some of the
  WebGL-interactive framework.

  [shader-editor]: https://github.com/spite/ShaderEditorExtension

### Profiling

(GPU-accurate!) Shader timing data can be taken with the [WebGL disjoint timer
query][disjoint-timer], which is a WebGL API, currently available in Chrome
Canary (which is not built for Linux, so I'm using a new Chromium build)

In order to measure the performance impact of a section of a fragment shader, I
will re-compile the shader with a no-op inserted in place of a potentially
expensive operation, then profile the new shader. The performance gain from the
new shader will reveal the cost of whatever section was replaced.

Changes to make might include:

* Replace function calls (texture2D, heavy math, user-defined functions, loop
  bodies) with no-op / no-compute values.
    * Use uniforms to prevent const optimization.
* Replace textures with a single 1x1 texture, which will reduce texture access
  times and memory throughput.
* Analyze performance between different pixels.

With pixel-selection support, I could scissor the rendering target in order to
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
