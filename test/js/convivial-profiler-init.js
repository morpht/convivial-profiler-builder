(function (window, ConvivialProfiler, config) {
  window.convivialProfiler = new ConvivialProfiler(config.config, config.site);
  window.convivialProfiler.collect();
})(window, window.ConvivialProfiler.default, testBuilder.convivialProfiler);
