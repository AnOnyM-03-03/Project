const { src, dest, watch, parallel, series  } = require('gulp');
const scss          = require('gulp-sass')(require('sass'));
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create();
const uglify        = require('gulp-uglify-es').default;
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const del           = require('del');




//таск для очистки полностью папки dist
function clean(){
    return del('dist');
}











//таск для сжатия картинок
function images(){
    return src('app/images/**/*')//Откуда берем файлы
    .pipe(imagemin(([//опция для сжатия всех типов картинок
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ])
    ))
    .pipe(dest('dist/images'))//Куда файлы добавляем
}








//для перекидывания папок и файлов в другую директорию
function build(){
    return src([
        'app/css/main.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
        
    ],{base: 'app'})//указывает директорию app и что нужно делать перекидку полностью с папками
    .pipe(dest('dist'))
}








function scripts(){
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/mixitup/dist/mixitup.js',
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))//конкатенация - объединение
    .pipe(uglify())//сжатие
    .pipe(dest('app/js'))//куда выбросить
    .pipe(browserSync.stream())//атомат обновление страницы
}





//таск для хоста
function browser(){
    browserSync.init({
        server:{
            baseDir:"app/"
        }
    });
}


//таск для всех стилей
function styles(){
    return src('app/scss/style.scss')//ОТкуда берем файл
    .pipe(scss({outputStyle: 'compressed'}))//Сжатие scss файла
    .pipe(concat('main.min.css'))//конкатенация или перенаименование
    .pipe(autoprefixer({
        overrideBrowserslist:['last 10 version'],//отслеживание последних 10 версий браузеров
        grid: true//подключение гридов
    }))
    .pipe(dest('app/css'))//конечный пункт файла
    .pipe(browserSync.stream())//Обновление страницы когда все выполнено
}


//Слежение за проектом и автоматом выполнять функцию
function watching(){
    watch(['app/scss/**/*.scss'],styles)//Слежение за scss которая в app за всеми внутренними папками и файлами с расширением .scss
    watch(['app/*.html']).on('change', browserSync.reload);
    watch(['app/js/**/*.js', '!app/js/main.min.js'],scripts)//слежение за всеми фалами js кроме '!app/js/main.min.js'
}








exports.styles = styles;
exports.watching = watching;
exports.browser = browser;
exports.scripts = scripts;
exports.images = images;
exports.clean = clean;

//сначала очистка - загружаются картинки - полностью build
exports.build = series( clean, images, build );
//Для выполнения одновременных задач
exports.default = parallel( styles ,scripts , browser, watching );