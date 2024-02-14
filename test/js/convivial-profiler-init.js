// convivial-profiler-init.js
(function (window, ConvivialProfiler) {
  window.testBuilder.onConfigReady = function () {
    window.convivialProfiler = new ConvivialProfiler(window.testBuilder.convivialProfiler.config, window.testBuilder.convivialProfiler.site);
    window.convivialProfiler.collect();
  };
})(window, window.ConvivialProfiler.default);
