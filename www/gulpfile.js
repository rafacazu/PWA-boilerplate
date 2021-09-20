const gulp = require("gulp");
const webpackConfig = require("./webpack.config.js");
const webpack = require("webpack-stream");
const browserSync = require("browser-sync");
const autoprefixer = require("gulp-autoprefixer");
const cssnano = require("gulp-cssnano");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const notify = require("gulp-notify");
const nunjucksRender = require("gulp-nunjucks-render");
const del = require("del");

function handleErrors(errorObject, ...args) {
  notify
    .onError(errorObject.toString().split(": ").join(":\n"))
    .apply(this, args);
  if (errorObject) {
    // eslint-disable-next-line no-console
    console.log(errorObject);
  }
  if (typeof this.emit === "function") this.emit("end");
}

const buildDirectory = `./build/`;

// Webpack config
const config = {
  webpack_src: `./src/js/main.js`,
  webpack_src_service_worker: `./src/js/service-worker.js`,
  webpack_dest: `${buildDirectory}/assets/js`,
  webpack_watch: `./src/**/*.{js,ts}`,
  scss_src: `.src/scss/*.scss`,
  scss_settings: {
    indentedSyntax: false,
    outputStyle: "compact"
  },
  autoprefixer: {
    browsers: ["ie >= 9", "iOS 7"]
  },
  css_dest: `${buildDirectory}/assets/css`,
  scss_watch: `./src/**/*.scss`,
  html_src: `./src/**/*.html`,
  html_dest: buildDirectory,
  html_templates: `./src`,
  html_watch: `./src/**/*.html`,
  defaultPagePath: `/html/`,
  publicRoot: "./build",
  js_dev_src: `./src/js/**/*.{js,map}`,
  js_dest: `${buildDirectory}/assets/js`,
  js_watch: `${buildDirectory}/assets/js/**`,
};

gulp.task("webpack", async () => {
  // service-worker needs to be in the root of the page
  const entries = {
    'main': config.webpack_src,
    '../../service-worker' : config.webpack_src_service_worker,
  };
  // Optimise react.js using Webpack production mode
  const projectWebpackConfig = {
    ...webpackConfig,
    devtool: "source-map", 
    entry: {
      ...entries
    }
  };

  // Update public path based on project for Webpack dynamic imports
  projectWebpackConfig.output.publicPath = `/assets/js/`;
  return gulp
    .src(`./src/js/main.js`)
    .pipe(webpack(projectWebpackConfig))
    .pipe(gulp.dest(config.webpack_dest))
    .on("error", handleErrors)
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("styles", () => {
  return gulp
    .src(`./src/scss/style.scss`)
    .pipe(sass(config.scss_settings))
    .on("error", handleErrors)
    .pipe(autoprefixer(config.autoprefixer))
    .pipe(
      sass({
        outputStyle: "compact"
      })
    )
    .pipe(
      rename({
        basename: "main"
      })
    )
    .pipe(
      cssnano({
        autoprefixer: false
      })
    )
    .pipe(gulp.dest(config.css_dest))
    .pipe(browserSync.stream())
    .pipe(
      notify({
        message: `Styles task complete${config.css_dest}`
      })
    );
});

gulp.task("html", () => {
  return gulp
    .src([config.html_src, "!**/{templates,macros,core}/**"])
    .pipe(
      nunjucksRender({
        path: [config.html_templates]
      })
    )
    .on("error", handleErrors)
    .pipe(gulp.dest(config.html_dest))
    .pipe(browserSync.stream());
});

gulp.task("redirect-html", () => {
  return gulp
    .src([`./src/index.html`])
    .on("error", handleErrors)
    .pipe(gulp.dest("./build"));
});

gulp.task("js", () => {
  return gulp
    .src([config.js_dev_src])
    .pipe(gulp.dest(config.js_dest))
    .on("error", handleErrors)
    .pipe(browserSync.stream());
});

gulp.task("js-sw", () => {
  return gulp
    .src([config.js_sw_watch])
    .pipe(gulp.dest("./src"))
    .on("error", handleErrors)
    .pipe(browserSync.stream());
});

// WATCH task

gulp.task("watch", () => {
  gulp.watch(config.scss_watch, gulp.task("styles"));
  gulp.watch(config.html_watch, gulp.task("html"));
  // gulp.watch(config.fonts_watch, gulp.task("fonts"));
  // gulp.watch(config.images_watch, gulp.task("images"));
  // gulp.watch(config.svg_watch, gulp.task("svgSprite"));
  // gulp.watch(config.videos_watch, gulp.task("videos"));
  gulp.watch(config.webpack_watch, gulp.task("webpack"));
  gulp.watch(config.js_watch, gulp.task("js"));
});

gulp.task("browserSync", () => {
  return browserSync({
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: false // Causes issues with development having scroll enabled
    },
    notify: false,
    // files  : ['public/**/*.html'], //Don't need this as we call browsersync when nunjucks has rendered
    files: false,
    server: {
      baseDir: config.publicRoot
    },
    startPath: config.defaultPagePath
  });
});

gulp.task("clean", () => {
  return del([buildDirectory], {
    force: true
  }).then((paths) => {
    console.log("Files and folders that would be deleted:\n", paths.join("\n"));
  });
});

gulp.task(
  "default",
  gulp.series(
    "clean",
    //["svgSprite"],
    [
      // "redirect-html",
      "html",
      // "images",
      "styles",
      // "videos",
      // "sampleData",
      // "fonts",
      // "js",
      "webpack"
    ],
    gulp.parallel("watch", "browserSync")
  )
);
