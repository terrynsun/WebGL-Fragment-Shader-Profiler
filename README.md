# WebGL Fragment Shader Profiler
[CIS565][cis565] Final Project, Terry Sun

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

### Profiling

I want to generate several variations of the shader being profiled, then take
performance data of each variation by running it many (hundreds of) times. The
difference in runtime will reveal the impact of different parts of the shader.

Changes to make might include:

* Replace function calls (texture2D, heavy math, user-defined functions) with
  no-op / no-compute values.
* Replace textures with a single 1x1 texture, which will reduce texture access
  times and memory throughput.
* Analyze loop performance between different pixels.

With pixel-selection support, I could scissor the rendering target in order to
profile only a single pixel or section of the screen.

To begin with, I plan on experimenting with taking performance data and making
simple shader modifications in a single web app.

### Assorted Ideas, Suggestions, References

Suggest more!

* [Timer queries][timer-queries] (currently in Chrome Canary)
* Try injecting code into the definitions of the WebGL context prototype
  functions. Maybe in a draw call you can, e.g., bind a dummy FBO, set a
  scissor around a pixel, start a disjoint timer query, render 1000 times, stop
  timing, then do the real draw call. (-Kai)
* [This AMD GPU shader analyzer?][amd-analyzer]

  [timer-queries]: https://www.khronos.org/registry/webgl/extensions/EXT_disjoint_timer_query/
  [amd-analyzer]: http://developer.amd.com/tools-and-sdks/graphics-development/gpu-shaderanalyzer/

### Tools

There are some existing tools which I would like to use:

* [Chrome Shader Editor Extension][shader-editor]. It looks like this is modeled
  after the Firefox shader editor tool, but would be less complicated to
  integrate with because it's stand-alone rather than a Firefox dev tool. I’m
  thinking of forking this extension in order to provide some of the
  WebGL-interactive framework.
* Some GLSL parser for modifying the shader. It looks like there are a couple of
  these, but the most extensive work is related to the stackgl project
  ([glsl-tokenizer], [glsl-parser]).
* GLSL Optimizer (originally in C++; compiled into JS with Emscripten). This is
  included in the ShaderEditor extension in some capacity, and I may be able to
  use it to my advantage.. somehow?

  [shader-editor]: https://github.com/spite/ShaderEditorExtension
  [glsl-tokenizer]: https://github.com/stackgl/glsl-tokenizer
  [glsl-parser]: https://github.com/stackgl/glsl-parser
