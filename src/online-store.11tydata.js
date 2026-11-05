export default {
  eleventyComputed: {
    permalink: (data) => (data.site && data.site.show_store ? "/online-store/" : false),
  },
};
